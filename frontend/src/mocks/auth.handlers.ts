import { http, HttpResponse } from 'msw'

// Fixed credentials used by both e2e (Playwright) and unit (Vitest) tests
// to exercise the login flow without hitting a real Supabase project.
export const TEST_USER = {
  id: 'e2e-test-user-id',
  email: 'e2e@foldtrack.test',
  password: 'Test1234!',
}

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

export const authHandlers = [
  http.post('*/auth/v1/signup', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    return HttpResponse.json({
      ...authUser,
      id: `signup-${Date.now()}`,
      email: body.email,
      confirmation_sent_at: new Date().toISOString(),
    })
  }),

  http.post('*/auth/v1/token', async ({ request }) => {
    const grantType = new URL(request.url).searchParams.get('grant_type')

    if (grantType === 'refresh_token') {
      return HttpResponse.json(session)
    }

    const body = (await request.json()) as { email: string; password: string }
    if (body.email === TEST_USER.email && body.password === TEST_USER.password) {
      return HttpResponse.json(session)
    }

    return HttpResponse.json(
      { error: 'invalid_grant', error_description: 'Invalid login credentials' },
      { status: 400 },
    )
  }),

  http.post('*/auth/v1/logout', () => new HttpResponse(null, { status: 204 })),

  http.post('*/auth/v1/recover', () => HttpResponse.json({})),

  http.put('*/auth/v1/user', async ({ request }) => {
    await request.json()
    return HttpResponse.json(authUser)
  }),

  // Background reads/writes triggered on login (subscription lookup, entry sync) —
  // not under test here, just need to resolve without error so nothing falls
  // through to a real network call.
  http.get('*/rest/v1/subscriptions', () => HttpResponse.json([])),
  http.get('*/rest/v1/body_composition_entries', () => HttpResponse.json([])),
  http.post('*/rest/v1/body_composition_entries', () => new HttpResponse(null, { status: 201 })),
  http.delete('*/rest/v1/body_composition_entries', () => new HttpResponse(null, { status: 204 })),
]
