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
// Note: while logged in, this does NOT reliably leave the store empty. The
// sync watcher (src/features/sync/sync.service.ts) only ever unions backend
// and local entries — it never propagates deletions — so if the backend
// already holds synced data, the very next sync tick after clearing merges
// it straight back into local storage. This helper is only used to drive the
// UI action described in the test scenario; assertions in this file
// deliberately don't depend on the store staying empty afterwards while
// authenticated.
const removeAllEntries = async (page: Page) => {
  const removeButton = page.getByRole('button', { name: 'Remove all entries' })
  if (await removeButton.isVisible().catch(() => false)) {
    await removeButton.click()
    await page.getByRole('button', { name: 'Delete' }).click()
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
