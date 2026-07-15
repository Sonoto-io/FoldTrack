<template>
  <Form
    ref="formRef"
    v-slot="$form"
    :resolver="resolver"
    @submit="onFormSubmit"
    class="grid col-span-full grid-cols-1 gap-2 min-w-md card"
  >
    <div class="flex flex-col gap-2 mb-4">
      <label>Email</label>
      <InputText name="email" />

      <Message v-if="$form.email?.error" severity="error" size="small" variant="simple">
        {{ $form.email?.error.message }}
      </Message>
    </div>

    <div class="flex flex-col gap-2 mb-4">
      <label>Password</label>
      <InputText name="password" type="password" />

      <Message v-if="$form.password?.error" severity="error" size="small" variant="simple">
        {{ $form.password?.error.message }}
      </Message>
    </div>

    <div class="flex flex-col gap-2 mb-4">
      <label>Confirm Password</label>
      <InputText name="confirmPassword" type="password" />

      <Message v-if="$form.confirmPassword?.error" severity="error" size="small" variant="simple">
        {{ $form.confirmPassword?.error.message }}
      </Message>
    </div>

    <Button type="submit" label="Submit" class="mt-4 w-full col-span-full" />
    <div>
      <p>
        Already have an account? <router-link class="text-primary" to="/login">Login</router-link>
      </p>
    </div>
  </Form>
</template>

<script setup lang="ts">
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { InputText, Message, Button } from 'primevue'
import { type SignUpWithPasswordCredentials } from '@supabase/supabase-js'

import { z } from 'zod'
import { login, register } from '@/api/auth'

import { useToast } from 'primevue/usetoast'
import router from '@/router'
import { mapSupabaseAuthError } from '../auth.errors'

const toast = useToast()
const resolver = zodResolver(
  z
    .object({
      email: z.email({ message: 'Invalid email address' }),
      password: z.string().nonempty('Please enter your pasword'),
      confirmPassword: z.string().nonempty('Please enter your pasword'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
)

const onFormSubmit = async (event: FormSubmitEvent) => {
  // handle signup request + cookie storage
  if (Object.keys(event.errors).length === 0) {
    const credentials = event.values as SignUpWithPasswordCredentials
    const { data, error } = await register(credentials)
    if (error) {
      const authError = mapSupabaseAuthError(error)
      toast.add({
        severity: 'error',
        summary: 'Error when registering',
        detail: authError.userMessage,
        life: 3000,
      })
      throw authError
    }

    toast.add({
      severity: 'success',
      summary: 'Registration ongoing',
      detail:
        'If this email can be registered, check your inbox. If not, try logging in. Redirecting...',
      life: 3000,
    })

    setTimeout(() => {
      router.push('/')
    }, 3000)
  }
}
</script>
