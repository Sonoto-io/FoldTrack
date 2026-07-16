import { test as base } from './fixtures'

// Extends the auth-mocking fixtures with a stateful, in-memory
// body_composition_entries "table" so sync tests can verify that data
// actually survives a round trip through the (mocked) backend — the base
// fixtures always answer GET with `[]`, which can't detect whether a write
// really persisted. Routes registered here run on top of (and before) the
// base fixtures' routes for the same context, since Playwright matches the
// most-recently-registered handler first.
//
// `entriesStore` is exposed as a fixture (not just an internal variable) so
// tests can assert on the mocked backend's actual state directly — e.g.
// `expect.poll(() => entriesStore.some(...))` — without guessing at network
// timing.

export interface StoredEntry {
  id: string
  user_id: string
  date: string
  [key: string]: unknown
}

export const test = base.extend<{ entriesStore: StoredEntry[] }>({
  entriesStore: async ({}, use) => {
    await use([])
  },

  context: async ({ context, entriesStore }, use) => {
    let nextId = 1

    await context.route('**/rest/v1/body_composition_entries**', async (route) => {
      const request = route.request()
      const url = new URL(request.url())

      if (request.method() === 'GET') {
        const userIdFilter = url.searchParams.get('user_id')
        const results = userIdFilter
          ? entriesStore.filter((entry) => `eq.${entry.user_id}` === userIdFilter)
          : [...entriesStore]
        results.sort((a, b) => a.date.localeCompare(b.date))
        await route.fulfill({ json: results })
        return
      }

      if (request.method() === 'POST') {
        const rows = request.postDataJSON() as Record<string, unknown>[]
        const isUpsert = (request.headers()['prefer'] ?? '').includes('resolution=merge-duplicates')
        for (const row of rows) {
          const existingIndex = isUpsert
            ? entriesStore.findIndex(
                (entry) => entry.user_id === row.user_id && entry.date === row.date,
              )
            : -1
          if (existingIndex !== -1) {
            entriesStore[existingIndex] = {
              ...entriesStore[existingIndex],
              ...row,
            } as StoredEntry
          } else {
            entriesStore.push({ ...row, id: String(nextId++) } as StoredEntry)
          }
        }
        await route.fulfill({ status: 201, json: [] })
        return
      }

      if (request.method() === 'DELETE') {
        const idFilter = url.searchParams.get('id')
        const userIdFilter = url.searchParams.get('user_id')
        const dateFilter = url.searchParams.get('date')
        if (idFilter?.startsWith('in.(')) {
          const ids = idFilter.slice(4, -1).split(',')
          for (const id of ids) {
            const index = entriesStore.findIndex((entry) => entry.id === id)
            if (index !== -1) entriesStore.splice(index, 1)
          }
        } else if (userIdFilter?.startsWith('eq.') && dateFilter?.startsWith('eq.')) {
          // Single-entry delete (deleteEntryByDate) — must only remove the row
          // matching both user_id AND date, not every row for the user.
          const userId = userIdFilter.slice(3)
          const date = dateFilter.slice(3)
          for (let i = entriesStore.length - 1; i >= 0; i--) {
            if (entriesStore[i]?.user_id === userId && entriesStore[i]?.date === date) {
              entriesStore.splice(i, 1)
            }
          }
        } else if (userIdFilter?.startsWith('eq.')) {
          const userId = userIdFilter.slice(3)
          for (let i = entriesStore.length - 1; i >= 0; i--) {
            if (entriesStore[i]?.user_id === userId) entriesStore.splice(i, 1)
          }
        }
        await route.fulfill({ status: 204 })
        return
      }

      await route.continue()
    })

    await use(context)
  },
})

export { expect } from '@playwright/test'
