# Harvest App - Claude Memory

## Project Overview

**Harvest** is a React Native dating app built with Expo and TypeScript, focused on "Mindful Dating, Real Connections". Production-ready app with comprehensive onboarding, swipe-based matching, real-time chat, and AI-powered features.

## Current Status

**Version**: 1.3.8
**Build**: 25
**Status**: ✅ **READY FOR TESTFLIGHT SUBMISSION**
**Last Updated**: January 21, 2025

## CRITICAL Requirements

**UI Design**: The liquid glass UI implementation MUST follow the UI mockups in the `Harvest Screens SVG:PNG/` folder **EXACTLY 1:1**. No deviations from mockup designs.

## Tech Stack

### Core

- **Framework**: Expo SDK 53.0.20, React Native 0.79.5, React 19.0.0
- **Language**: TypeScript
- **Navigation**: Expo Router ~5.1.4 (file-based routing)
- **State Management**: Zustand + AsyncStorage
- **Styling**: StyleSheet with liquid glass design system
- **Backend**: Supabase (auth, database, storage, real-time)

### Key Dependencies

- **Animations**: React Native Reanimated ~3.17.4
- **Gestures**: React Native Gesture Handler v2
- **UI**: Expo Vector Icons, expo-image, expo-blur, expo-linear-gradient
- **Auth**: @supabase/supabase-js
- **AI**: OpenAI GPT-4 (optional, with fallbacks)
- **Dev Tools**: ESLint, Prettier, Husky, lint-staged

### Build Configuration

- **iOS Bundle ID**: com.harvest.harvestdating
- **Apple Team ID**: L3P46Q9398
- **App Store Connect ID**: 6749823296
- **EAS Project ID**: 4bf484c4-576a-4d5a-8373-1c854bb46ea7

## Project Structure

```
Root Files (7 files only):
├── CLAUDE.md                 ← This file (project memory)
├── FAQ.mdx                   ← User-facing help
├── HARVEST_NEXT_STEPS.mdx    ← Feature roadmap
├── TODO.md                   ← SDK 54 upgrade plan
├── app.config.js             ← Expo configuration
├── babel.config.js           ← Babel configuration
└── metro.config.js           ← Metro bundler

Organized Folders:
├── docs/                     ← 6 reference documents
├── utility-scripts/          ← 2 development utilities
├── app/                      ← Application code
│   ├── _layout.tsx           ← Root layout with auth
│   ├── auth.tsx              ← Welcome screen
│   ├── login.tsx             ← Login/signup
│   ├── onboarding/           ← 11-step onboarding
│   ├── _tabs/                ← Main app (swipe, matches, chat, gardener, profile)
│   ├── chat.tsx              ← Chat detail screen
│   └── settings.tsx          ← Settings screen
├── components/               ← Reusable UI components
│   ├── ui/                   ← Core UI (Button, Input, Card, etc.)
│   ├── liquid/               ← Liquid glass components
│   ├── safety/               ← AI safety modals
│   └── gardener/             ← Gardener AI components
├── lib/                      ← Services and utilities
│   ├── supabase.ts           ← Supabase client
│   ├── profiles.ts           ← Profile management
│   ├── profileHelpers.ts     ← Profile utilities
│   ├── onboarding.ts         ← Onboarding persistence
│   ├── values.ts             ← Values-based matching
│   └── ai/                   ← AI services
├── stores/                   ← Zustand state management
│   ├── useUserStore.ts       ← User state
│   ├── useAuthStore.ts       ← Authentication state
│   └── useGardenerStore.ts   ← Gardener AI state
├── hooks/                    ← Custom React hooks
├── constants/                ← Theme and configuration
└── supabase/                 ← Database migrations
```

## Features

### Authentication

- ✅ Email/password signup and login
- ✅ Google OAuth integration
- ✅ Test mode for development
- ✅ Session persistence
- ✅ Profile creation on signup

### Onboarding (11 Steps)

- ✅ Age verification
- ✅ Preferences (orientation)
- ✅ Bio creation
- ✅ Nickname
- ✅ Photo upload (Supabase storage)
- ✅ Hobbies selection
- ✅ Distance preferences
- ✅ Relationship goals
- ✅ Gender identity
- ✅ Sexual orientation
- ✅ Interested in
- ✅ Location (with GPS)
- ✅ Terms acceptance
- ✅ Progress restoration (resume where left off)

### Core Features

- ✅ **Swipe Cards**: Gesture-based swiping with haptic feedback
- ✅ **Profile Editing**: Update bio, photos, interests
- ✅ **Matches**: View matched users
- ✅ **Real-time Chat**: Supabase channels with typing indicators
- ✅ **Filters**: Age range, distance, gender preferences
- ✅ **Settings**: Account management, notifications, privacy

### AI Features

- ✅ **Gardener AI Coach**: GPT-4 powered dating advice (with fallback)
- ✅ **Daily Quiz**: Personality insights
- ✅ **Values Questionnaire**: 5 values you bring + 5 values you seek
- ✅ **Mindful Messaging**: AI checks for red flags before sending
- ✅ **AI Safety System**: Conversation analysis for user protection

### UI/UX

- ✅ Liquid glass design system (maroon #8B1E2D theme)
- ✅ Smooth 60fps animations
- ✅ Proper safe area handling (70px tab bar)
- ✅ Loading states and skeleton loaders
- ✅ Error handling with user-friendly messages
- ✅ Haptic feedback throughout

## Setup Requirements

### Environment Variables

Create `.env` file:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://jutzlxdboayvmcuqwodn.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key  # Optional
```

### Database Setup

1. Run `/supabase/quick_fix_schema.sql` in Supabase SQL editor
2. Run `/supabase/migrations/007_safety_tables_safe.sql` (AI safety)
3. Run `/supabase/migrations/008_gardener_tables_safe.sql` (Gardener AI)
4. Create `profile-photos` public storage bucket

### Credentials (Already Configured)

- ✅ Supabase URL and keys in `eas.json`
- ✅ Apple Team ID and App Store Connect ID
- ✅ Bundle identifier configured
- ✅ EAS build profiles (preview, production)

## Key Implementation Details

### Critical Files

**Profile Management** (CRITICAL):

- `lib/profileHelpers.ts` - Contains `ensureProfileExists()` which prevents save failures
- `lib/profiles.ts` - User profile CRUD operations
- `lib/onboarding.ts` - Onboarding progress persistence

**Authentication**:

- `stores/useAuthStore.ts` - Auth state with Supabase integration
- `components/AuthGuard.tsx` - Route protection with navigation locks

**Swipe Cards**:

- `components/HarvestSwipeCard.tsx` - Main swipe implementation (iOS 26 glassmorphism)
- Uses Animated API (not Reanimated) for stability

**Database Schema**:

- Uses `users` table (NOT `profiles`)
- Messages use `conversation_id` (NOT `match_id`)
- Swipes use `action` column (NOT `swipe_type`)
- All critical columns: email (NOT NULL), photo_url (NOT avatar_url)

### Design System

```typescript
const COLORS = {
  primary: '#8B1E2D',      // Maroon
  text: '#222',            // Dark gray
  textSecondary: '#555',   // Medium gray
  white: '#fff',           // White
  background: '#F5F5F5',   // Light gray
};

// Standard button styling
borderRadius: 28px
height: 56px
elevation: 3 (unselected), 6 (selected)
shadowOpacity: 0.1 (unselected), 0.3 (selected)
```

### Important Constants

- **Tab bar height**: 70px (always account for this in bottom padding)
- **Safe area**: Use `useSafeAreaInsets()` for dynamic spacing
- **Bottom padding**: 90-110px for components near tab bar
- **Blur intensity**: 60-70 for optimal performance

## Known Issues & Solutions

### Fixed Issues

- ✅ Onboarding crashes: Fixed with `ensureProfileExists()` helper
- ✅ OAuth profile creation: Auto-creates profile on OAuth callback
- ✅ Race conditions: Navigation locks in AuthGuard
- ✅ Test mode crashes: Check `isTestMode` before database operations
- ✅ UI consistency: All screens follow design system (Build 24)

### Current Workarounds

- **Expo Go doesn't work**: Normal - app uses custom native modules. Use development builds or TestFlight.
- **iOS Simulator OAuth**: "Page not found" is expected. Test OAuth on real devices only.

## Best Practices

### Always Check

- Backend table/column names match code (users not profiles, photo_url not avatar_url)
- Build numbers synchronized across all 6 config files
- Email field included in all profile operations (NOT NULL constraint)
- `ensureProfileExists()` called before save operations
- Test mode checked before database calls

### Git Workflow

- Never commit API keys directly
- Use environment variables or eas.json
- Create comprehensive commit messages
- Test on real devices before pushing

## TestFlight Deployment

### Build Commands

```bash
# Preview profile (for TestFlight)
npx eas build --clear-cache --platform ios --profile preview
npx eas submit --platform ios --profile preview

# Production profile (for App Store)
npx eas build --clear-cache --platform ios --profile production
npx eas submit --platform ios --profile production
```

### Pre-Flight Checklist

- [x] Version 1.3.8, Build 25 synchronized
- [x] Bundle ID: com.harvest.harvestdating
- [x] Supabase credentials in eas.json
- [x] All TypeScript errors fixed (0 errors)
- [x] Test scripts removed
- [x] Documentation organized
- [x] Git repository clean

## Future TODO

### SDK 54 Upgrade (2-3 Months Post-Launch)

See `TODO.md` for comprehensive upgrade plan.

**DO NOT UPGRADE** until:

- App stable in production for 2-3 months
- Baseline metrics established
- User feedback collected

**Breaking Changes**:

- React Native Reanimated v4 (requires worklet rewrites)
- React Native 0.81 (JSC removed)
- expo-file-system API changes
- Metro internal import changes

**Safe Alternative Now**: `npx expo install --fix` for patch updates

## Latest Session Summary

### January 21, 2025 - Project Cleanup & TestFlight Preparation

**Changes**:

1. ✅ Created TODO.md with SDK 54 upgrade plan
2. ✅ Organized documentation (47 files → 10 files, 79% reduction)
3. ✅ Deleted 37 redundant .md files
4. ✅ Deleted 11 test/debug scripts
5. ✅ Moved utility scripts to utility-scripts/ folder
6. ✅ Verified build configuration (all 6 files synchronized)
7. ✅ Committed and pushed to GitHub

**Status**: Ready for TestFlight submission

**Files Committed**: 58 files changed, 714 insertions(+), 12,353 deletions(-)

## Notes

- App is production-ready with zero known critical bugs
- All features tested and working
- Database fully configured with proper RLS
- OAuth ready (Google configured)
- AI features ready (works with/without API keys)
- Clean codebase with professional structure
- Comprehensive documentation in docs/ folder
- Future upgrade path documented in TODO.md

---

**Last Memory Update**: January 21, 2025 - Build 25
**Next Review**: After TestFlight beta testing (2-4 weeks)
