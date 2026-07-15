<template>
  <AuthLayout>
    <template #form>
      <UpdatePasswordForm />
    </template>
  </AuthLayout>
</template>

<script setup lang="ts">
import UpdatePasswordForm from '@/features/auth/components/UpdatePasswordForm.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
</script>
