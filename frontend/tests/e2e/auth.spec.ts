import { test, expect } from './fixtures'
import { TEST_USER } from '@/mocks/auth.handlers'

// These tests run against Supabase auth/rest endpoints mocked via Playwright
// route interception (see ./fixtures.ts) rather than a real Supabase project.

test.describe('login', () => {
  test('shows an error toast for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[name="email"]').fill('wrong@foldtrack.test')
    await page.locator('input[name="password"]').fill('wrongpassword')
    await page.getByRole('button', { name: 'Submit' }).click()

    await expect(page.getByText('Email or password is incorrect.')).toBeVisible()
    await expect(page).toHaveURL(/login/)
  })

  test('logs in and back out successfully', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[name="email"]').fill(TEST_USER.email)
    await page.locator('input[name="password"]').fill(TEST_USER.password)
    await page.getByRole('button', { name: 'Submit' }).click()

    await expect(page.getByText('Successfully logged in, redirecting...')).toBeVisible()
    await expect(page).toHaveURL('/', { timeout: 5000 })
    await expect(page.getByText(`Connected with ${TEST_USER.email}`)).toBeVisible()

    await page.getByRole('button', { name: 'Logout' }).click()

    await expect(page.getByText('You have been logged out.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
  })
})

test.describe('register', () => {
  test('shows a validation error when passwords do not match', async ({ page }) => {
    await page.goto('/register')
    await page.locator('input[name="email"]').fill('new-user@foldtrack.test')
    await page.locator('input[name="password"]').fill('Test1234!')
    await page.locator('input[name="confirmPassword"]').fill('Different1234!')
    await page.getByRole('button', { name: 'Submit' }).click()

    await expect(page.getByText('Passwords do not match')).toBeVisible()
    await expect(page).toHaveURL(/register/)
  })

  test('registers successfully', async ({ page }) => {
    await page.goto('/register')
    await page.locator('input[name="email"]').fill('new-user@foldtrack.test')
    await page.locator('input[name="password"]').fill('Test1234!')
    await page.locator('input[name="confirmPassword"]').fill('Test1234!')
    await page.getByRole('button', { name: 'Submit' }).click()

    await expect(
      page.getByText(
        'If this email can be registered, check your inbox. If not, try logging in. Redirecting...',
      ),
    ).toBeVisible()
  })
})
