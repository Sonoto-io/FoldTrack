import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'
import './assets/styles/styles.css'
import './assets/styles/global.css'

import App from './App.vue'
import router from './router'
import { worker } from './mocks/browser'
import { PrimevuePreset } from './PrimevuePreset'

const app = createApp(App)

// Start MSW worker in development mode if mocks are enabled
const mocksEnabled =
  import.meta.env.VITE_MOCKS_ENABLED == 'true' || import.meta.env.VITE_PLAYWRIGHT_TEST == 'true'
if (import.meta.env.DEV && mocksEnabled) {
  console.log('Starting MSW worker in development mode')
  await worker.start()
}

app.use(PrimeVue, {
  theme: {
    preset: PrimevuePreset,
  },
})

app.use(createPinia())
app.directive('tooltip', Tooltip)
app.use(router)

app.mount('#app')
