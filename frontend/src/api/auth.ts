import type {
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from '@supabase/supabase-js'
import { api } from './client.ts'

export const register = async (creds: SignUpWithPasswordCredentials) => {
  const { data, error } = await api.auth.signUp(creds)

  return { data, error }
}

export const login = async (credentials: SignInWithPasswordCredentials) => {
  const { data, error } = await api.auth.signInWithPassword(credentials)
  return { data, error }
}

export const resetPassword = async (email: string) => {
  const origin = window.location.origin
  const { data, error } = await api.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/update-password`,
  })
  return { data, error }
}

export const logout = async () => {
  const { error } = await api.auth.signOut()
  return { error }
}

export const resetPasswordWithToken = async (newPassword: string) => {
  const { data, error } = await api.auth.updateUser({
    password: newPassword,
  })
  return { data, error }
}

export const getSession = async () => {
  const { data } = await api.auth.getSession()
  return data ?? null
}
