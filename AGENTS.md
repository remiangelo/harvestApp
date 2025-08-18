# Repository Guidelines

## Project Structure & Module Organization

- `app/`: Expo Router screens (file-based routes like `[id].tsx`, `(tabs)/home.tsx`).
- `components/`: Reusable UI; active swipe card is `components/HarvestSwipeCard.tsx`.
- `components/liquid/`: Liquid glass UI primitives (must match mockups 1:1).
- `lib/`: Services and clients (e.g., `lib/supabase.ts`, `lib/profiles.ts`).
- `stores/`: Zustand state (e.g., `useAuthStore.ts`, `useUserStore.ts`).
- `hooks/`, `constants/` (theme), `assets/`, `data/`, `context/`: Shared logic and assets.
- `scripts/`: Tools (`run-migrations.js`, `preflight-backend.js`, `clearTestMode.js`).
- `supabase/`: SQL and required fixes (see quick-fix notes below).
- `android/`, `ios/`, `docs/`: Native projects and guides.

## Build, Test, and Development Commands

- `npm start`: Run Expo dev server. `npm run ios|android|web` for targets.
- `npm test`: Jest via `jest-expo` (watch). Single file: `npm test -- path/to/file.test.tsx`.
- `npm run lint` | `lint:fix`: ESLint checks and autofix. `npm run format` to Prettier-format.
- `npm run type-check`: TypeScript (`strict: true`).
- `npm run db:migrate`: Executes `scripts/run-migrations.js` (see Supabase setup).
- `npm run preflight:backend`: Validates required env/config before running.
- `npm run prepare`: Installs Husky hooks (run once after install).

## Coding Style & Naming Conventions

- Language: TypeScript, 2-space indent. Keep props typed, prefer explicit interfaces.
- Formatting: Prettier; Linting: ESLint (React/React Native, hooks rules).
- Components: PascalCase; hooks `useX`; files co-located when practical.
- UI: Use `components/liquid/*` for glassmorphism. Follow design colors (primary `#A0354E`).
- Imports: Use `@/` alias for root paths (see `tsconfig.json`).

## Testing Guidelines

- Framework: `jest-expo`. Tests in `__tests__/` or beside files.
- Naming: `*.test.ts[x]`. Prefer focused tests; use `react-test-renderer` for components.
- Run full suite: `npm test`. Update snapshots intentionally and review diffs.

## Commit & Pull Request Guidelines

- Messages: Imperative, concise; scopes optional. Conventional style encouraged but not enforced (history mixes styles).
- PRs: Describe what/why, include test steps; attach screenshots/video for any UI change.
- Gates: Run and pass `lint`, `type-check`, and `test` before requesting review.

## Security & Configuration Tips

- Env: Copy `.env.example` → `.env`; set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Do not commit secrets.
- Supabase: Run `/supabase/quick_fix_schema.sql` in SQL editor and create `profile-photos` public bucket. Some migrations run manually.
- Test Mode: See `TEST_MODE_GUIDE.md`. Clear with `node clearTestMode.js`.
- Builds: Configure with `eas.json`; native overrides live in `ios/` and `android/`.
