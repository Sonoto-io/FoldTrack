import { beforeAll, afterEach, afterAll } from "vitest";
import { server } from "@/mocks/node";

import { vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { config } from "@vue/test-utils";
import { ref } from "vue";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";

config.global.stubs = {
  RouterLink: { template: '<a><slot /></a>', props: ['to'] }
}

beforeAll(() => {
  setActivePinia(createPinia())
  config.global.plugins = [PrimeVue, ConfirmationService];
  server.listen({ onUnhandledRequest: "error" })
})

afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
})

afterAll(() => server.close())

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  })
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    currentRoute: {},
  }),
  useRoute: () => ({
    path: '/',
    name: 'mocked-route',
    params: {},
    query: {},
    fullPath: '/',
    hash: '',
    meta: {},
  })
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
