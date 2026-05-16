import { mergeConfig } from "vitest/config";
import baseViteConfig from "./vite.config";

export default mergeConfig(baseViteConfig, {
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ['./vitest.setup.ts'],
    include: ["**/__tests__/*.{test,spec}.{ts,js}"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    isolate: false,
  },
})
