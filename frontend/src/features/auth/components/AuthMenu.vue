<template>
  <div
    v-if="isConnected"
    class="flex flex-row gap-4 w-full md:flex-row md:gap-2 md:w-auto items-center justify-between"
  >
    <p class="text-sm text-gray-600">Connected with {{ authStore.user?.email }}</p>
    <button class="secondary-cta p-2" @click="handleLogout">Logout</button>
  </div>
  <div v-else>
    <div class="flex flex-row gap-3 w-full md:flex-row md:gap-2 md:w-auto">
      <button v-if="!isConnected" class="primary-cta p-2" @click="handleGetStarted">
        Get Started
      </button>
      <button v-if="!isConnected" class="secondary-cta p-2" @click="handleLogin">Login</button>
      <button v-if="isConnected" class="secondary-cta p-2" @click="handleLogout">Logout</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast'

const authStore = useAuthStore()
const toast = useToast()
const isConnected = ref(authStore.isAuthenticated)

const handleGetStarted = () => {
  // Navigate to signup/registration
  router.replace({ name: 'Register' })
}

const handleLogin = () => {
  // Navigate to login
  router.replace({ name: 'Login' })
}

const handleLogout = async () => {
  // Handle logout
  await authStore.signOut()
  toast.add({
    severity: 'success',
    summary: 'Logout Successful',
    detail: 'You have been logged out.',
    life: 3000,
  })
  isConnected.value = false
}

onMounted(() => {
  isConnected.value = authStore.isAuthenticated
})
</script>
