<template>
  <Form
    ref="formRef"
    v-slot="$form"
    :resolver="resolver"
    @submit="onFormSubmit"
    class="grid col-span-full grid-cols-1 gap-2 card"
  >
    <div class="flex flex-col gap-2 mb-4">
      <label>Email</label>
      <InputText name="email" :disabled="isDisabled" />

      <Message v-if="$form.email?.error" severity="error" size="small" variant="simple">
        {{ $form.email?.error.message }}
      </Message>
    </div>

    <div class="flex flex-col gap-2 mb-4">
      <label>Password</label>
      <InputText name="password" type="password" :disabled="isDisabled" />

      <Message v-if="$form.password?.error" severity="error" size="small" variant="simple">
        {{ $form.password?.error.message }}
      </Message>
    </div>

    <Button type="submit" :disabled="isDisabled" label="Submit" class="mt-4 w-full col-span-full" />
    <div>
      <p>
        Don't have an account?
        <router-link class="text-primary" to="/register">Register</router-link>
      </p>
    </div>
    <div>
      <p>
        Forgot your password?
        <router-link class="text-primary" to="/reset-password">Reset Password</router-link>
      </p>
    </div>
  </Form>
</template>

<script setup lang="ts">
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { InputText, Message, Button } from 'primevue'
import { z } from 'zod'
import { type SignInWithPasswordCredentials } from '@supabase/supabase-js'
import { login } from '@/api/auth'
import { useToast } from 'primevue/usetoast'
import { ref } from 'vue'
import { mapSupabaseAuthError } from '../auth.errors'
import router from '@/router'

const toast = useToast()

const isDisabled = ref(false)

const resolver = zodResolver(
  z.object({
    email: z.email({ message: 'Invalid email address' }),
    password: z.string().nonempty('Please enter your pasword'),
  }),
)

const onFormSubmit = async (event: FormSubmitEvent) => {
  // handle login request and premium verify + cookie storage
  if (Object.keys(event.errors).length === 0) {
    isDisabled.value = true
    const credentials = event.values as SignInWithPasswordCredentials
    const { data, error } = await login(credentials)
    if (error) {
      const authError = mapSupabaseAuthError(error)
      toast.add({
        severity: 'error',
        summary: 'Error when logging in',
        detail: authError.userMessage,
        life: 3000,
      })
      isDisabled.value = false
      throw authError
    }

    toast.add({
      severity: 'success',
      summary: 'Logged in',
      detail: 'Successfully logged in, redirecting...',
      life: 3000,
    })

    setTimeout(() => {
      router.push('/')
    }, 3000)
  }
}
</script>
