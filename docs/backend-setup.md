# Harvest Backend Setup and Verification Guide

This guide ensures the backend is configured correctly and provides a repeatable checklist to validate Supabase, schema, and integrations.

## Overview

- Backend: Supabase (Auth, Postgres, Storage, Realtime)
- Client: React Native (Expo), using @supabase/supabase-js
- Key data domains: users, swipes, matches, messages, photos, user_preferences

## Prerequisites

- Supabase project created (https://app.supabase.com/)
- Expo CLI installed
- Node 18+

## Environment Variables

Create a .env file in project root (never commit real keys):

```
EXPO_PUBLIC_SUPABASE_URL=your_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# Optional for deeper preflight checks (not used by the app itself):
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

The app uses only the anon key at runtime. The optional service key can be provided locally to let the preflight script verify Storage buckets via admin SDK.

## Database Setup

1. Apply migrations in order:

- 001_initial_schema.sql
- 002_swipes_and_matches.sql (preferred)
- 003_users_table_updates.sql
- 004_add_push_token.sql

Notes:

- There are two migration files with prefix 002. Use only one:
  - 002_swipes_and_matches.sql: references auth.users and provides a cleaner minimal set
  - 002_matching_system.sql: references users table and includes additional fields
- Recommended: 002_swipes_and_matches.sql to align with common Supabase patterns and avoid cross-schema confusion.

2. If you have previously applied 002_matching_system.sql:

- Keep it, or migrate to 002_swipes_and_matches.sql carefully:
  - Ensure swipes and matches schemas align with app code
  - Ensure get_match_status RPC signature returns is_matched and match_id
  - Reconcile differences in matches fields (user1_unmatched/user2_unmatched vs is_active)
  - Test with the preflight script and app flows before production use

3. Extra helper SQL provided (optional):

- SIMPLE_RLS_FIX.sql, COMPLETE_RLS_FIX.sql, DISABLE_RLS.sql, fix_schema.sql: run only if you encounter RLS or schema errors during onboarding. Prefer to keep RLS enabled for production.

## Storage Buckets

Create a public bucket profile-photos:

- In Supabase Dashboard → Storage → Create bucket → name: profile-photos → Public: true

Recommended policies:

- Public read for images
- Authenticated users can write/delete only their own files (path-based)
  - You can later refine with path prefix like userId/...

## Running Preflight Checks

A backend preflight script validates keys, connection, tables, RPCs, and storage:

- Ensure dependencies: npm i
- Run:
  - npm run preflight:backend

What it checks:

- EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY present
- Supabase connectivity (auth.getSession)
- Migrations present; warns if duplicate prefixes exist (e.g., 002)
- Required tables exist: users, swipes, matches, messages
- Optional tables exist: conversations, photos, user_preferences
- RPC function get_match_status exists
- Storage bucket profile-photos is accessible
- Sanity check: RLS denies anon insert into swipes

If you provide SUPABASE_SERVICE_ROLE_KEY the script can list buckets via admin SDK and provide stronger verification.

## Feature-to-Backend Mapping

- Authentication: Supabase Auth (email/password)
- Profiles: users table (single table, no separate profiles table in current code)
- Swipe actions: swipes table + trigger to auto-create matches
- Matching: matches table + get_match_status RPC
- Messaging: messages table + (optional) conversations
- Photos: Supabase Storage bucket profile-photos (file paths and public URLs)
- Push tokens: users.push_token (added in 004_add_push_token.sql)

## Test Modes

The app contains a Test Mode to bypass auth and demo the UI. Production flows require:

- Valid Supabase credentials in .env
- Migrations applied
- Storage bucket created

## Troubleshooting

- new row violates row-level security:
  - Confirm RLS policies exist for swipes, matches, messages, and users
  - Use SIMPLE_RLS_FIX.sql or COMPLETE_RLS_FIX.sql if needed (dev only)
- Storage uploads fail:
  - Confirm profile-photos bucket exists and is public (or ensure read policy is in place)
  - Check that you are uploading a Blob and a valid contentType
- Missing match status:
  - Ensure get_match_status RPC exists and signature matches usage (expects is_matched and match_id)

## Verification Steps (CI-friendly)

1. npm run type-check
2. npm run lint
3. npm run preflight:backend
4. Launch app and confirm:
   - Auth works (sign up/in/out)
   - Swipes insert rows and auto-matching works
   - Messages insert and read
   - Photos upload and display

## Safety and Secrets

- Do not commit real .env to VCS
- Use EAS Secrets or CI secrets for production builds
- Anon key only in app; service role key never shipped in binaries

## Next Actions

- Resolve duplicate 002 migrations by standardizing on 002_swipes_and_matches.sql
- Confirm RLS coverage on all tables used by the app (especially users and swipes)
- Add a small seed (optional) for dev to create a few users with photos
