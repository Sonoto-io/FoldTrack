import { test, expect } from './syncFixtures'
import type { Page } from '@playwright/test'
import { TEST_USER } from '@/mocks/auth.handlers'

// Exercises the local-first sync behaviour (src/features/sync/sync.service.ts)
// end to end: an entry created while logged in should survive a logout, a
// local-only clear (simulating a fresh device/browser with no localStorage),
// and re-appear after logging back in because it was persisted to the
// (mocked) backend in the meantime.

const getLocalEntries = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('fold-entries') ?? '[]'))

const login = async (page: Page) => {
  await page.goto('/login')
  await page.locator('input[name="email"]').fill(TEST_USER.email)
  await page.locator('input[name="password"]').fill(TEST_USER.password)
  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(page).toHaveURL('/', { timeout: 5000 })
  await expect(page.getByText(`Connected with ${TEST_USER.email}`)).toBeVisible()
}

const logout = async (page: Page) => {
  await page.getByRole('button', { name: 'Logout' }).click()
  await expect(page.getByText('You have been logged out.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
}

// No-op if there is nothing to clear (button only renders once there is data).
//
// While logged in, this goes through clearEntriesService
// (src/features/sync/sync.service.ts), which deletes the user's rows on the
// backend before clearing local storage — so, unlike the background sync
// watcher's merge (which only ever unions backend and local entries and can't
// express a deletion), this is authoritative and the store reliably stays
// empty afterwards. See the dedicated regression test below.
//
// `exact: true` is required because the calculator's own "Delete entry"
// button is always present on the page and is a substring match for "Delete".
const removeAllEntries = async (page: Page) => {
  const removeButton = page.getByRole('button', { name: 'Remove all entries' })
  if (await removeButton.isVisible().catch(() => false)) {
    await removeButton.click()
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
  }
}

// The date field is a PrimeVue DatePicker (inputmode="none", typing is
// blocked by design) — it must be driven through its calendar popup rather
// than filled as a text input. `year`/`month` (3-letter abbreviation, e.g.
// "Jun") must both already be visible without further decade/month-grid
// navigation for this helper to work.
const pickDate = async (page: Page, year: string, month: string, day: string) => {
  await page.locator('input[name="date"]').click()
  await page.getByLabel('Choose Year').click()

  const yearOption = page.getByText(year, { exact: true })
  for (let i = 0; i < 20 && !(await yearOption.isVisible()); i++) {
    await page.getByLabel('Previous Decade').click()
  }
  await yearOption.click()

  // PrimeVue renders these cells as e.g. `Jun <!--placeholder-->`, so an
  // exact regex match must tolerate the trailing whitespace; months don't
  // overlap as substrings so a plain string match is unambiguous, but day
  // numbers do (e.g. "1" is a substring of "15"), hence the anchored regex.
  await page.locator('.p-datepicker-month', { hasText: month }).first().click()
  await page.locator('.p-datepicker-day', { hasText: new RegExp(`^${day}\\s*$`) }).click()
}

const addEntry = async (page: Page, year: string, month: string, day: string) => {
  await pickDate(page, year, month, day)
  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(page.locator('.body-composition-result')).toContainText('Body fat percentage')
}

// Confirms through the calculator's own dialog (group "deleteEntry", scoped
// separately from "Remove all entries"'s "clearEntries" group — see
// CalculatorForm.vue) — `exact: true` is required because "Delete entry" is
// itself a substring match for the plain "Delete" accept button.
const deleteSelectedEntry = async (page: Page) => {
  await page.getByRole('button', { name: 'Delete entry' }).click()
  await page.getByRole('button', { name: 'Delete', exact: true }).click()
}

test('an entry synced while logged in survives logout, a local clear, and re-login', async ({
  page,
  entriesStore,
}) => {
  // Start from a clean slate: a fresh visit seeds demo entries locally, and
  // we don't want them (or their sync) muddying this test.
  await page.goto('/')
  await removeAllEntries(page)

  await login(page)
  await removeAllEntries(page)

  await addEntry(page, '2020', 'Jun', '15')

  // The demo/example entries are always seeded with Gender.Male
  // (src/mocks/homepage.fixtures.ts), while the calculator form defaults to
  // Female on first mount — so filtering by gender reliably identifies the
  // entry this test just added, without depending on its exact date string
  // (submitting the form runs the picked date through `new Date(...)`, which
  // can shift it by a day depending on the runner's timezone).
  type LocalEntry = { date: string; gender: string }
  let addedEntries: LocalEntry[] = []
  await expect
    .poll(async () => {
      addedEntries = await getLocalEntries(page)
      return addedEntries.filter((entry) => entry.gender === 'female')
    })
    .toHaveLength(1)
  const entryDate = addedEntries.find((entry) => entry.gender === 'female')!.date

  // Wait for the background syncer to push the new entry to the (mocked)
  // backend before logging out, otherwise the rest of the test is racing it.
  await expect.poll(() => entriesStore.some((entry) => entry.date === entryDate)).toBe(true)

  await logout(page)

  // Simulate a fresh device/browser with no local data: clearing while
  // logged out must not touch the backend.
  await removeAllEntries(page)
  await expect.poll(() => getLocalEntries(page)).toEqual([])
  expect(entriesStore.some((entry) => entry.date === entryDate)).toBe(true)

  await login(page)

  await expect
    .poll(() => getLocalEntries(page))
    .toContainEqual(expect.objectContaining({ date: entryDate }))
  await expect(page.getByRole('button', { name: 'Remove all entries' })).toBeVisible()
})

test('removing all entries while logged in deletes them from the backend and does not resurrect them', async ({
  page,
  entriesStore,
}) => {
  await page.goto('/')
  await removeAllEntries(page)

  await login(page)
  await removeAllEntries(page)

  await addEntry(page, '2021', 'Mar', '10')

  type LocalEntry = { date: string; gender: string }
  let addedEntries: LocalEntry[] = []
  await expect
    .poll(async () => {
      addedEntries = await getLocalEntries(page)
      return addedEntries.filter((entry) => entry.gender === 'female')
    })
    .toHaveLength(1)
  const entryDate = addedEntries.find((entry) => entry.gender === 'female')!.date

  // Wait for the background syncer to push the new entry to the (mocked)
  // backend before deleting, otherwise this test could pass by accident
  // (deleting before the entry ever reached the backend).
  await expect.poll(() => entriesStore.some((entry) => entry.date === entryDate)).toBe(true)

  await removeAllEntries(page)

  await expect.poll(() => getLocalEntries(page)).toEqual([])
  expect(entriesStore.some((entry) => entry.date === entryDate)).toBe(false)

  // A later sync tick (e.g. the deep watcher on the entries store) must not
  // resurrect the deleted entry from the backend.
  await page.waitForTimeout(1000)
  await expect.poll(() => getLocalEntries(page)).toEqual([])
})

test('deleting a single entry from the calculator only removes that entry, locally and on the backend', async ({
  page,
  entriesStore,
}) => {
  await page.goto('/')
  await removeAllEntries(page)

  await login(page)
  await removeAllEntries(page)

  await addEntry(page, '2021', 'Mar', '10')
  // Give the datepicker panel time to fully close/settle before reopening it
  // for a second pick in the same test — reopening too quickly races Vue's
  // re-render of the panel and can grab a stale (about-to-detach) element.
  await page.waitForTimeout(300)
  await addEntry(page, '2022', 'Apr', '20')

  type LocalEntry = { date: string; gender: string }
  let localEntries: LocalEntry[] = []
  await expect
    .poll(async () => {
      localEntries = await getLocalEntries(page)
      return localEntries.filter((entry) => entry.gender === 'female')
    })
    .toHaveLength(2)
  const femaleEntries = localEntries.filter((entry) => entry.gender === 'female')
  const entryToDelete = femaleEntries.find((entry) => entry.date.startsWith('2021'))!
  const entryToKeep = femaleEntries.find((entry) => entry.date.startsWith('2022'))!

  // Wait for the background syncer to push both entries to the (mocked)
  // backend before deleting one, otherwise the assertions below could pass by
  // accident.
  await expect
    .poll(() => entriesStore.filter((entry) => entry.gender === 'female').length)
    .toBe(2)

  // The date field still points at the entry addEntry just submitted
  // (2022-04-20), so the button starts enabled; picking an unrelated date
  // with no entry must disable it again, and selecting the entry to delete
  // (without submitting) must re-enable it.
  const deleteButton = page.getByRole('button', { name: 'Delete entry' })
  await expect(deleteButton).toBeEnabled()

  // Same decade as the two entries above (2021/2022) so the datepicker's
  // decade view never needs to navigate — pickDate only supports going back a
  // decade, not forward.
  await page.waitForTimeout(300)
  await pickDate(page, '2023', 'Jul', '15')
  await expect(deleteButton).toBeDisabled()

  await page.waitForTimeout(300)
  await pickDate(page, '2021', 'Mar', '10')
  await expect(deleteButton).toBeEnabled()

  await deleteSelectedEntry(page)

  // deleteEntryService is async (awaits the backend DELETE before removing
  // locally), so both the local removal and the backend state settle some
  // time after the confirm click resolves — poll rather than check once.
  await expect
    .poll(async () => {
      const entries = (await getLocalEntries(page)) as LocalEntry[]
      return entries.some((entry) => entry.date === entryToDelete.date)
    })
    .toBe(false)
  await expect
    .poll(() => getLocalEntries(page))
    .toContainEqual(expect.objectContaining({ date: entryToKeep.date }))

  await expect
    .poll(() => entriesStore.some((entry) => entry.date === entryToDelete.date))
    .toBe(false)
  expect(entriesStore.some((entry) => entry.date === entryToKeep.date)).toBe(true)

  // A later sync tick must not resurrect the deleted entry from the backend,
  // and must not have touched the surviving one.
  await page.waitForTimeout(1000)
  const finalLocalEntries = (await getLocalEntries(page)) as LocalEntry[]
  expect(finalLocalEntries.some((entry) => entry.date === entryToDelete.date)).toBe(false)
  expect(finalLocalEntries.some((entry) => entry.date === entryToKeep.date)).toBe(true)

  await expect(deleteButton).toBeDisabled()
})
