# Security Fix Implementation Checklist

## Overview

This document guides you through applying security fixes to the Harvest app database.

**Total Issues Fixed**: 30 security issues

- ❌ 14 ERROR-level: Missing RLS policies
- ⚠️ 12 WARNING-level: Function search_path issues
- ⚠️ 2 WARNING-level: Auth config + Postgres version
- ⚠️ 1 WARNING-level: Extension in public schema
- ⚠️ 1 WARNING-level: Security definer view

**Files Created**:

- `migrations/010_fix_rls_policies.sql` - RLS fixes (14 tables)
- `migrations/011_fix_function_search_path.sql` - Function security (12 functions)
- `test_rls_policies.sql` - Validation queries
- `rollback_rls.sql` - Emergency rollback

---

## Pre-Flight Checklist

### ☐ 1. Backup Database

**Status**: ⚠️ CRITICAL - Do not skip!

```bash
# Option A: Supabase Dashboard
1. Go to Settings → Backups
2. Click "Create backup now"
3. Wait for completion
4. Download backup

# Option B: Export current state
# Run in Supabase SQL Editor:
```

```sql
-- Export table list
COPY (SELECT * FROM pg_tables WHERE schemaname = 'public') TO '/tmp/tables_backup.csv' CSV HEADER;

-- Export policy list
COPY (SELECT * FROM pg_policies WHERE schemaname = 'public') TO '/tmp/policies_backup.csv' CSV HEADER;
```

### ☐ 2. Document Current State

```sql
-- Run in Supabase SQL Editor and save output
SELECT
  tablename,
  rowsecurity,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;
```

### ☐ 3. Review Test Environment

- [ ] Do you have a staging/test database?
- [ ] Can you test there first?
- [ ] If not, proceed with caution on production

### ☐ 4. Schedule Maintenance Window (Optional)

Recommended for production:

- **When**: Low-traffic period (late night/early morning)
- **Duration**: 30-45 minutes
- **Notify**: Post maintenance notice in app

---

## Phase 1: Apply RLS Policies (Migration 010)

### ☐ Step 1: Review Migration File

**File**: `supabase/migrations/010_fix_rls_policies.sql`

**What it does**:

- Enables RLS on 14 tables
- Creates 15+ policies for user data protection
- Safe operation: No data modification

**Estimated time**: 5 seconds

### ☐ Step 2: Apply Migration

This was applied automatically via Supabase MCP.

**Manual alternative** (if needed):

```bash
# Option A: Via Supabase CLI
supabase db push

# Option B: Via Supabase SQL Editor
# Copy contents of 010_fix_rls_policies.sql and paste into SQL Editor
# Click "Run"
```

### ☐ Step 3: Validate RLS Applied

Run validation script:

```bash
# In Supabase SQL Editor, run:
# supabase/test_rls_policies.sql
```

**Expected results**:

- ✅ All 11 tables show "RLS ENABLED"
- ✅ 15+ policies created
- ✅ 0 tables missing RLS

### ☐ Step 4: Test App Functionality

Test these features in your app:

- [ ] User login
- [ ] View profile
- [ ] Upload photos
- [ ] Swipe on profiles
- [ ] Send messages
- [ ] Block a user
- [ ] Create a report
- [ ] Use Gardener AI

**If issues occur**:

1. Check Supabase logs (Dashboard → Logs)
2. Try rollback: `supabase/rollback_rls.sql`
3. Review error messages
4. Fix policies and retry

---

## Phase 2: Fix Function Security (Migration 011)

### ☐ Step 1: Review Migration File

**File**: `supabase/migrations/011_fix_function_search_path.sql`

**What it does**:

- Adds `SET search_path` to 12 functions
- Prevents SQL injection via schema manipulation
- Uses ALTER FUNCTION (safe, non-destructive)

**Estimated time**: 2 seconds

### ☐ Step 2: Apply Migration

This was applied automatically via Supabase MCP.

**Manual alternative** (if needed):

```bash
# In Supabase SQL Editor, run:
# Copy contents of 011_fix_function_search_path.sql
# Paste and execute
```

### ☐ Step 3: Validate Functions Fixed

```sql
-- Run this to check function security status
SELECT
  p.proname as function_name,
  CASE
    WHEN p.proconfig::text LIKE '%search_path%' THEN '✅ FIXED'
    ELSE '❌ NOT FIXED'
  END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
  'check_and_create_match',
  'get_discovery_profiles',
  'get_match_status',
  'check_mutual_match',
  'get_user_quiz_history',
  'update_match_interaction',
  'get_user_matches',
  'update_user_insights_from_quiz',
  'update_updated_at_column',
  'update_user_safety_settings_timestamp',
  'update_user_values_sought_updated_at',
  'update_user_values_brought_updated_at'
)
ORDER BY function_name;
```

**Expected**: All 12 functions show "✅ FIXED"

### ☐ Step 4: Test Functions

Test these app features:

- [ ] Swiping (uses `check_mutual_match`)
- [ ] Discovery (uses `get_discovery_profiles`)
- [ ] Matches view (uses `get_user_matches`)
- [ ] Match creation (uses `check_and_create_match`)
- [ ] Gardener quiz (uses `get_user_quiz_history`)

---

## Phase 3: Manual Configuration Changes

### ☐ 1. Enable Leaked Password Protection

**Severity**: ⚠️ WARNING
**Risk**: None (only affects new signups)

**Steps**:

1. Go to https://supabase.com/dashboard
2. Select project: **harvestApp**
3. Navigate to: **Authentication** → **Policies**
4. Find: **Password Security** section
5. Toggle ON: "Check passwords against HaveIBeenPwned"
6. Click **Save**

**Verification**:

- Try signing up with password "password123"
- Should be rejected

### ☐ 2. Upgrade PostgreSQL Version

**Severity**: ⚠️ WARNING
**Risk**: HIGH (requires maintenance window)

**⚠️ RECOMMENDED: Schedule this for a later maintenance window**

**Steps**:

1. Go to **Settings** → **Infrastructure**
2. Check if upgrade is available
3. Create full backup first
4. Click "Upgrade database"
5. Monitor upgrade progress
6. Test all functionality after upgrade

**Verification**:

```sql
SELECT version();
-- Should show newer version (17.4.1.XXX or higher)
```

### ☐ 3. Move PostGIS Extension (Optional)

**Severity**: ⚠️ WARNING
**Risk**: LOW (cosmetic issue)

**Note**: This is a non-critical warning. PostGIS in public schema is common practice.

**If you want to fix it**:

```sql
-- Not recommended unless you understand PostGIS extension management
-- ALTER EXTENSION postgis SET SCHEMA extensions;
```

### ☐ 4. Fix Security Definer View (Optional)

**View**: `user_safety_metrics`
**Severity**: ⚠️ WARNING

**Investigation needed**:

```sql
-- Check if this view exists
SELECT viewname, definition
FROM pg_views
WHERE viewname = 'user_safety_metrics';
```

**If exists**, recreate without SECURITY DEFINER:

```sql
-- Get current definition
-- Remove SECURITY DEFINER clause
-- Recreate view
```

---

## Phase 4: Final Verification

### ☐ Run Complete Test Suite

```sql
-- Run full test suite
-- In Supabase SQL Editor:
```

Copy all queries from `test_rls_policies.sql` and verify:

- ✅ 11 tables with RLS
- ✅ 15+ policies
- ✅ 12 functions with search_path
- ✅ 0 tables missing RLS

### ☐ App Integration Testing

Test all major workflows:

- [ ] New user signup → onboarding → complete
- [ ] Existing user login
- [ ] Profile editing
- [ ] Photo upload
- [ ] Swiping → matching
- [ ] Messaging → real-time
- [ ] Gardener AI → chat + quiz
- [ ] Values matching
- [ ] Block user
- [ ] Report user
- [ ] Settings changes

### ☐ Security Verification

Run Supabase advisor again:

1. Go to **Settings** → **Advisor**
2. Check **Security** tab
3. Verify issues are resolved

**Expected**:

- ❌ 0 ERROR-level RLS issues
- ⚠️ Down to 2-4 WARNING-level issues

---

## Emergency Rollback Procedure

**If critical issues occur after migration:**

### 1. Immediate Rollback

```sql
-- Run in Supabase SQL Editor:
-- Copy contents of supabase/rollback_rls.sql
-- Execute the script
-- Read the output carefully
-- Uncomment COMMIT; to confirm rollback
```

### 2. Verify Rollback

```sql
SELECT COUNT(*) as tables_with_rls
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = true;
-- Should return 0 after rollback
```

### 3. Restore App Functionality

After rollback:

- App should work (without RLS security)
- Review error logs
- Fix migration issues
- Test on staging
- Re-apply when ready

---

## Success Criteria

Migration is successful when:

- ✅ All queries in `test_rls_policies.sql` show expected results
- ✅ App functions normally for all user types
- ✅ No 5xx errors in Supabase logs
- ✅ Supabase advisor shows 0 critical RLS issues
- ✅ All automated tests pass (if you have them)

---

## Troubleshooting Common Issues

### Issue: "Could not insert row - policy violation"

**Cause**: RLS policy too restrictive
**Fix**: Review policy logic, ensure `auth.uid()` matches column

### Issue: "Function not found"

**Cause**: Function recreation failed
**Fix**: Check error in migration, manually recreate function

### Issue: "Permission denied for table"

**Cause**: Missing policy for operation
**Fix**: Add policy for INSERT/UPDATE/DELETE as needed

### Issue: "App completely broken"

**Cause**: Multiple policy issues
**Fix**: Use `rollback_rls.sql` immediately

---

## Post-Migration Monitoring

### First 24 Hours

- [ ] Monitor Supabase logs every 2 hours
- [ ] Check app crash reports
- [ ] Monitor user feedback
- [ ] Review error rates

### First Week

- [ ] Daily log review
- [ ] Monitor performance metrics
- [ ] Collect user feedback
- [ ] Plan PostgreSQL upgrade

---

## Status Tracking

**Migration 010 (RLS)**:

- [ ] Reviewed
- [ ] Applied
- [ ] Validated
- [ ] Tested

**Migration 011 (Functions)**:

- [ ] Reviewed
- [ ] Applied
- [ ] Validated
- [ ] Tested

**Manual Config**:

- [ ] Leaked password protection enabled
- [ ] PostgreSQL upgrade scheduled
- [ ] Extensions reviewed

**Final Sign-off**:

- [ ] All tests passing
- [ ] No critical errors
- [ ] Team notified
- [ ] Documentation updated

---

## Support

**If you need help:**

- Check Supabase docs: https://supabase.com/docs/guides/database/database-linter
- Review Supabase logs: Dashboard → Logs
- Check migration files for comments
- Use rollback script if critical issue
- Test on staging environment first

**Migration completed successfully!** 🎉
