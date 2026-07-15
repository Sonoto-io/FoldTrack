<template>
  <AuthLayout>
    <template #form>
      <ResetPasswordForm />
    </template>
  </AuthLayout>
</template>

<script setup lang="ts">
import ResetPasswordForm from '@/features/auth/components/ResetPasswordForm.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
</script>
