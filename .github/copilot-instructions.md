<!-- Copilot instructions for the Ailun Saúde repository -->
# Copilot / AI agent instructions — Ailun Saúde

Be concise. Produce small, focused edits. Prefer changing one file at a time and run quick validations (typecheck or lint) after edits.

Key context (what this repo is):
- React Native mobile app built with Expo + Expo Router (app/). See `package.json` scripts and `app/_layout.tsx`.
- Supabase is the primary backend via `services/supabase.ts` and several `supabase` edge functions under `supabase/functions/`.
- Rapidoc integration exists in `api/rapidoc-proxy.ts` and `config/rapidoc-config.js` (CORS proxy / adapter pattern).
- Services live in the `services/` folder (auth, orchestrator, rapidoc adapters, asaas, storage, etc.). Prefer changes here for backend integrations.

What helps you be immediately productive (concrete):
- Start commands: use `npm run start` (Expo) or `npm run ios|android|web` for device targets. See `package.json`.
- Environment: the app reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` at runtime; tests and local scripts expect these env vars to be present (README.md details).
- Types: project uses TypeScript with `tsconfig.json` and `tsconfig.app.json`. 
  - For fast app-only typecheck: run `npm run typecheck:app` (app code, components, hooks only).
  - For full typecheck: run `npx tsc --noEmit` (includes server-side Deno functions; expect Deno-related errors if unchecked).
  - See `docs/TYPECHECK_STATUS.md` for categorized TypeScript errors and how to fix them.
  - Many files use `allowJs` and `noEmit` — prefer quick type-safe edits and run `npm run lint` after changes.
- Authentication flow: `contexts/AuthContext.tsx` orchestrates Supabase session handling and beneficiary resolution (lookups in `services/*` like `beneficiary-plan-service.ts`, `userProfile.ts`, and `rapidoc-*`).

Patterns and conventions specific to this project:
- File-based navigation: screens are under `app/`; route paths map to filenames (Expo Router). When adding screens, wire them into `app/_layout.tsx` only for explicit Stack ordering or rely on file routing.
- Supabase-first data layer: CRUD is mostly done via `services/database.ts` and typed in `services/supabase.ts`. Use `supabase.from(...).select(...)` patterns and prefer using the existing typed interfaces in `services/supabase.ts`.
- Orchestration services: high-level flows (consultation, subscription) are handled by `services/orchestrator.ts` and `services/consultation-flow*`. Small UI changes should not modify orchestration logic unless fixing a bug — prefer adding feature flags.
- Rapidoc adapter: code that calls external Rapidoc API should go through `api/rapidoc-proxy.ts` or `services/rapidoc-api-adapter.*` to centralize headers and error handling (see `config/rapidoc-config.js`). Avoid hardcoding tokens; prefer using `config/*` when reading constants.
- Error handling: `services/error-handler.ts` provides common logging; follow its pattern (return { success: boolean, data?, error? }) when adding new service functions.

Important integration points and secrets handling:
- Supabase client: `services/supabase.ts` uses public env vars — do not commit secrets. Edge functions live in `supabase/functions/` and are deployed via Supabase CLI (README deploy notes).
- Rapidoc tokens are present in `config/rapidoc-config.js` in this tree — treat these as sensitive. If you need to change them, prefer moving them to env vars and update usages.

Developer workflows and tips:
- Quick checks:
  - Run `npm run start` to boot Expo.
  - Run `npm run typecheck:app` for fast app-only type validation (~2s).
  - Run `npm run lint` for linting (use `--fix` to auto-repair many issues).
  - Run `node scripts/test-supabase.js` to validate Supabase connectivity (README.md).
- When editing TypeScript types, run `npm run typecheck:app` and check `docs/TYPECHECK_STATUS.md` for known error categories.
- Edge Functions:
  - Use `supabase functions deploy` (Supabase CLI) to publish functions. See `docs/EDGE_FUNCTIONS.md`.
  - Edge Function code (in `supabase/functions/`) uses Deno; exclude from app typecheck if type errors appear.

How to produce PRs here (preferred):
- Small, focused commits. One logical change per PR.
- Include a short description of the user-visible impact and any Supabase schema migrations (link `supabase/schema.sql`) or env changes.
- If you change runtime behavior (auth, orchestration), include steps to manually test in README or docs.

Examples from the codebase:
- Auth/session handling: `contexts/AuthContext.tsx` (look for `supabase.auth.onAuthStateChange` and beneficiary resolution flows).
- External API proxy: `api/rapidoc-proxy.ts` (fetch wrapper that centralizes headers and response shape).
- Supabase types: `services/supabase.ts` (UserProfile, ConsultationLog, etc.).

Do not modify:
- Do not change Expo or package versions without tests. This repo pins many Expo/external libs; upgrades are non-trivial.
- Do not commit secrets. If you find tokens in the repo (e.g., Rapidoc), flag them in the PR and propose moving them to env.

Ask for clarifications when:
- You need to change the Supabase schema (edit `supabase/schema.sql` and document migration steps).
- You need to update Edge Functions — list the function names and the expected runtime.

If anything is missing or unclear, leave a comment on the PR and ask the maintainers to add the exact test steps or env variables. 
