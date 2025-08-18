# CRUSH.md

This file stores frequently used commands, code style preferences, and key project structure notes for rapid workflows with Crush.

## Commands

- Start Expo: `npm start`
- Run on iOS/Android/Web: `npm run ios` | `npm run android` | `npm run web`
- Tests (watch): `npm test`
- Lint / Fix: `npm run lint` | `npm run lint:fix`
- Format / Check: `npm run format` | `npm run format:check`
- Type-check: `npm run type-check`
- Backend preflight: `npm run preflight:backend`
- DB migrations: `npm run db:migrate`
- Husky install (once): `npm run prepare`
- Clear RN/Expo caches: `./clear-cache.sh`
- Clear Test Mode: `node clearTestMode.js`

## Env Vars

Create `.env` from `.env.example` and set:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Secrets must never be committed.

## Project Structure

- `app/` Expo Router screens (onboarding, tabs, auth, etc.)
- `components/` Reusable UI components
  - `components/liquid/*` Liquid glass primitives (must match mockups 1:1)
  - `components/HarvestSwipeCard.tsx` Active swipe card implementation
- `lib/` Services/clients (`supabase.ts`, `profiles.ts`, `swipes.ts`, etc.)
- `stores/` Zustand stores (`useAuthStore.ts`, `useUserStore.ts`)
- `hooks/`, `constants/`, `assets/`, `data/`, `context/`
- `scripts/` Tooling (`run-migrations.js`, `preflight-backend.js`)
- `supabase/` SQL schemas and fixes
- `ios/`, `android/` Native projects

## Code Style

- Language: TypeScript (strict), 2-space indent
- Components: PascalCase; hooks `useX`
- Prefer explicit interfaces for props
- Use Prettier and ESLint; no inline comments unless requested
- UI color system: primary maroon `#A0354E`
- Use liquid glass components for mockup-accurate UI

## Testing

- Framework: `jest-expo`
- Tests live in `__tests__/` or alongside files as `*.test.ts[x]`
- Snapshot updates should be intentional and reviewed

## Supabase Setup (must do)

1. Create project and run `supabase/quick_fix_schema.sql` in SQL editor
2. Create public storage bucket `profile-photos`
3. Add env vars to `.env`

## Notes

- Follow iOS 26 glassmorphism visuals exactly
- Active swipe card: `components/HarvestSwipeCard.tsx`
- Use `OptimizedImage` for photos, avoid raw Image for remote URLs
- Test Mode available via login (see TEST_MODE_GUIDE.md)
