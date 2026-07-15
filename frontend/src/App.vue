<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useEntrySyncer } from '@/features/sync/sync.service'

const authStore = useAuthStore()

authStore.init()
useEntrySyncer()
</script>

<template>
  <router-view />
</template>

<style scoped></style>
