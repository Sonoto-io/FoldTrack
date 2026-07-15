import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'

import './assets/styles/styles.css'
import './assets/styles/global.css'

import App from './App.vue'
import router from './router'
import { worker } from './mocks/browser'
import { PrimevuePreset } from './PrimevuePreset'
import { printError } from './features/shared/shared.services.ts'

const main = async () => {
  const app = createApp(App)
  app.use(ToastService)

  // Start MSW worker in development mode if mocks are enabled. Not used for
  // Playwright e2e (see tests/e2e/fixtures.ts) — a Service Worker's fetch
  // interception is unreliable in headless Firefox/WebKit (races on first
  // activation, and idle workers can be torn down mid-response), so e2e tests
  // mock Supabase via Playwright's own network interception instead.
  const mocksEnabled = import.meta.env.VITE_MOCKS_ENABLED == 'true'
  if (import.meta.env.DEV && mocksEnabled) {
    console.log('Starting MSW worker in development mode')
    await worker.start()
  }

  app.use(PrimeVue, {
    theme: {
      preset: PrimevuePreset,
    },
  })

  app.use(ConfirmationService)
  app.use(createPinia())
  app.directive('tooltip', Tooltip)
  app.use(router)

  app.mount('#app')
}

try {
  await main()
} catch (e) {
  console.error('Fatal error:')
  printError(e)
}
