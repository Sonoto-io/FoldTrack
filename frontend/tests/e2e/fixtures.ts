import { test as base } from '@playwright/test'
import { TEST_USER } from '@/mocks/auth.handlers'

// Mocks the Supabase auth/rest endpoints via Playwright's own network
// interception rather than relying on the app's in-browser MSW Service Worker.
// The Service Worker approach is flaky across browser engines in headless CI —
// Firefox and WebKit don't reliably guarantee interception of a page's very
// first requests after the worker activates, causing e2e requests to
// intermittently leak through to the real Supabase backend. Route-level
// interception happens at the browser-automation layer instead, so it doesn't
// depend on Service Worker activation timing at all.

const authUser = {
  id: TEST_USER.id,
  aud: 'authenticated',
  role: 'authenticated',
  email: TEST_USER.email,
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: {},
  created_at: new Date().toISOString(),
}

const session = {
  access_token: 'mock-access-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: 'mock-refresh-token',
  user: authUser,
}

export const test = base.extend({
  // Routes are registered on the browser CONTEXT, not the page, and BEFORE any
  // page is created — Playwright only guarantees interception of a page's very
  // first requests when routing is set up at this level ahead of navigation.
  context: async ({ context }, use) => {
    await context.route('**/auth/v1/signup', async (route) => {
      const body = route.request().postDataJSON() as { email: string; password: string }
      await route.fulfill({
        json: {
          ...authUser,
          id: `signup-${Date.now()}`,
          email: body.email,
          confirmation_sent_at: new Date().toISOString(),
        },
      })
    })

    await context.route('**/auth/v1/token**', async (route) => {
      const grantType = new URL(route.request().url()).searchParams.get('grant_type')
      if (grantType === 'refresh_token') {
        await route.fulfill({ json: session })
        return
      }

      const body = route.request().postDataJSON() as { email: string; password: string }
      if (body.email === TEST_USER.email && body.password === TEST_USER.password) {
        await route.fulfill({ json: session })
      } else {
        await route.fulfill({
          status: 400,
          json: { error: 'invalid_grant', error_description: 'Invalid login credentials' },
        })
      }
    })

    await context.route('**/auth/v1/logout', (route) => route.fulfill({ status: 204 }))
    await context.route('**/auth/v1/recover', (route) => route.fulfill({ json: {} }))
    await context.route('**/auth/v1/user', (route) => route.fulfill({ json: authUser }))
    await context.route('**/rest/v1/subscriptions**', (route) => route.fulfill({ json: [] }))
    await context.route('**/rest/v1/body_composition_entries**', (route) => {
      switch (route.request().method()) {
        case 'GET':
          return route.fulfill({ json: [] })
        case 'POST':
          return route.fulfill({ status: 201 })
        case 'DELETE':
          return route.fulfill({ status: 204 })
        default:
          return route.continue()
      }
    })

    await use(context)
  },
})

export { expect } from '@playwright/test'
