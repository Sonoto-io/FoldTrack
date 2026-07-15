import { api } from './client.ts'

export const fetchSubscription = async (userId: string) => {
  const { data, error } = await api
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  return { data, error }
}
