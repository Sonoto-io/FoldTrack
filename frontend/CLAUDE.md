# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (see `pnpm-lock.yaml`, `pnpm-workspace.yaml`, and the Dockerfile which installs via pnpm) even though a stale `package-lock.json` also exists — use `pnpm`, not `npm`, for installs.

```sh
pnpm dev                # start Vite dev server (http://127.0.0.1:5173)
pnpm build              # type-check (vue-tsc --build) + vite build
pnpm type-check         # vue-tsc --build only
pnpm format             # prettier --write src/

pnpm test:unit                                    # run all vitest unit tests
pnpm test:unit -- src/features/calculator/__tests__/bodyCalculations.spec.ts   # single file
pnpm test:unit -- -t "should calculate body composition"                       # by test name

pnpm test:e2e                       # playwright e2e (auto-starts dev server)
pnpm test:e2e -- --project=chromium
pnpm test:e2e -- tests/e2e/vue.spec.ts
pnpm test:e2e -- --debug
```

Unit tests live in `__tests__` folders next to the code they cover and run under jsdom via Vitest, with MSW (`src/mocks/node.ts`) intercepting network calls (`onUnhandledRequest: "error"` — any request needs an explicit handler). E2e tests live in `tests/e2e` and run against a real browser via Playwright; the auth spec mocks Supabase via Playwright's own browser-context-level route interception (`tests/e2e/fixtures.ts`), not the app's MSW worker — headless WebKit's request interception is unreliable regardless of mocking strategy, so the `webkit` project is excluded on CI (`playwright.config.ts`) and only runs locally.

Environment variables (`.env.local` / `.env.prod`, Vite-style `VITE_*` prefix required for client exposure): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_MOCKS_ENABLED` (enables MSW worker in dev).

## Architecture

FoldTrack is a Vue 3 + TypeScript SPA (Vite) for tracking body composition from skinfold caliper measurements, using Supabase as the backend (auth + Postgres) and PrimeVue as the UI kit.

**Feature-folder structure**: code is organized under `src/features/<domain>/` (`auth`, `calculator`, `dataResults`, `history`, `marketing`, `shared`, `sync`), each with its own `*.service.ts` (pure logic), `*.types.ts`, `*.errors.ts`, and a `components/` subfolder. `src/api/` holds thin Supabase query wrappers (one file per table/concern: `auth.ts`, `entries.ts`, `subscriptions.ts`), all built on the single Supabase client in `src/api/client.ts`. `src/stores/` holds the two Pinia stores (`auth`, `foldEntries`) that own app-wide state; `src/views/` are route-level components wired up in `src/router/index.ts`.

**Local-first data with background sync** (`src/features/sync/sync.service.ts`): `foldEntries` (Pinia store, `src/stores/foldEntries.ts`) persists entries to `localStorage` via `@vueuse/core`'s `useStorage`, so the app is fully usable logged-out. `useEntrySyncer()` (invoked once in `App.vue`) watches both the entries store and `authStore.isAuthenticated`, and on change reconciles local state with Supabase's `body_composition_entries` table: it fetches backend entries, compares them against local ones with an order-independent deep-normalize (`normalize`/`areEntriesSynced`), merges by `date` if they differ, writes the merged result back to local storage, and pushes it to the backend (`syncEntries`). Non-premium accounts are capped to their 4 most recent entries server-side (see `updateBackendEntries` → `syncEntries` in `src/api/entries.ts`, which deletes all but the last 4 rows for non-premium users after upsert).

**Naming convention bridge**: Supabase/Postgres columns are `snake_case`; app-side `BodyCompositionEntry` objects are `camelCase`. `src/features/shared/shared.services.ts` (`transformToSnake`/`transformToCamel`, built on `camelToSnake`/`snakeToCamel`) converts at the `src/api/entries.ts` boundary — always pass through these when adding new Supabase read/write paths, don't hand-roll key mapping.

**Auth & premium gating** (`src/stores/auth.ts`): `authStore.init()` (called once in `App.vue`) restores the Supabase session and subscribes to `api.auth.onAuthStateChange`, keeping `user` in sync. Setting a user also triggers `fetchSubscription`, which populates `subscription`; `isPremium` is derived from `subscription.status` (`active`/`trialing`) plus `current_period_end` not having passed. `isPremium` currently gates the 4-entry retention limit in sync (see above) and is expected to gate other paid features.

**Body composition calculation** (`src/features/calculator/calculator.service.ts`): implements the Jackson–Pollock skinfold equations. Formula selection branches on `gender` (`Gender.Male`/`Gender.Female`) and `foldsCount` (3, 4, or 7 — the specific caliper sites used differ per branch, see `calculator.enum.ts`'s `WomenFoldsOrder`/`MenFoldsOrder`). The 4-fold case has no body-density formula and returns body-fat % directly; 3- and 7-fold cases compute body density first (`calculateBodyDensity`) then convert via the Siri equation (`495 / bodyDensity - 450`). Invalid gender/foldsCount combinations throw rather than silently defaulting — preserve that when touching this code.

**Error handling**: two parallel error types exist — `AppError` (`src/features/shared/shared.errors.ts`), a generic wrapper with `cause`/`context`, used with `wrapError`/`printError` in `shared.services.ts` for generic app errors; and `AuthError` (`src/features/auth/auth.errors.ts`), which via `mapSupabaseAuthError` translates raw Supabase auth error messages/codes into typed errors with user-facing messages. Use `mapSupabaseAuthError` for anything coming out of `src/api/auth.ts`, not raw Supabase error strings.

**Path alias**: `@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`) — use it instead of relative `../../` imports.
