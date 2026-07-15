import type { AuthResponse } from '@supabase/supabase-js'

export class AuthError extends Error {
  constructor(
    public code: string,
    public userMessage: string,
    public original?: unknown,
  ) {
    super(userMessage)
    this.name = 'AuthError'
  }
}

export function mapSupabaseAuthError(error: any): AuthError {
  const message = error?.message?.toLowerCase?.() ?? ''
  const code = error?.code ?? ''

  if (message.includes('invalid login credentials')) {
    return new AuthError('INVALID_CREDENTIALS', 'Email or password is incorrect.')
  }

  if (message.includes('email not confirmed')) {
    return new AuthError('EMAIL_NOT_CONFIRMED', 'Please confirm your email before logging in.')
  }

  if (message.includes('password should be at least')) {
    return new AuthError('WEAK_PASSWORD', 'Password is too weak. Use at least 6 characters.')
  }

  if (code === 'over_email_send_rate_limit') {
    return new AuthError(
      'MAIL_RATE_LIMIT',
      'There now seems to be a problem with our email service. Please try again later.',
    )
  }

  return new AuthError('UNKNOWN_AUTH_ERROR', 'Something went wrong. Please try again.', error)
}
