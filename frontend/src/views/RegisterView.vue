<template>
  <AuthLayout>
    <template #form>
      <RegisterForm />
    </template>
  </AuthLayout>
</template>

<script setup lang="ts">
import RegisterForm from '@/features/auth/components/RegisterForm.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
</script>
