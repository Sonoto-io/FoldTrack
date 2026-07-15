import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@supabase/supabase-js'
import { fetchSubscription } from '@/api/subscriptions'
import { getSession, logout } from '@/api/auth'
import { api } from '@/api/client'

interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: string | null
  price_id: string | null
  current_period_end: string | null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const subscription = ref<Subscription | null>(null)
  const loading = ref(false)

  // ─────────────────────────────
  // Computed
  // ─────────────────────────────

  const isAuthenticated = computed(() => !!user.value)

  const isPremium = computed(() => {
    if (!subscription.value) return false
    const { status, current_period_end } = subscription.value
    const isActive = status === 'active' || status === 'trialing'
    const notExpired = current_period_end ? new Date(current_period_end) > new Date() : false
    return isActive && notExpired
  })

  // ─────────────────────────────
  // Actions
  // ─────────────────────────────

  const setUser = async (newUser: User | null) => {
    user.value = newUser
    if (newUser) {
      await fetchSubscription(newUser.id)
    } else {
      subscription.value = null
    }
  }

  // Call once in App.vue — restores session on page refresh
  // and listens for login/logout events
  const init = async () => {
    loading.value = true

    // Restore existing session
    const { session } = await getSession()
    await setUser(session?.user ?? null)

    // Keep store in sync with Supabase auth events
    api.auth.onAuthStateChange(async (_event, session) => {
      await setUser(session?.user ?? null)
    })

    loading.value = false
  }

  const signOut = async () => {
    await logout()
    user.value = null
  }

  return {
    user,
    subscription,
    loading,
    isAuthenticated,
    isPremium,
    init,
    signOut,
    fetchSubscription,
  }
})
