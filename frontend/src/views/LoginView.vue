<template>
  <AuthLayout>
    <template #form>
      <LoginForm />
    </template>
  </AuthLayout>
</template>

<script setup lang="ts">
import LoginForm from '@/features/auth/components/LoginForm.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
</script>
