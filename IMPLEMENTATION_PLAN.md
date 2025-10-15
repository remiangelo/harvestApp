# Harvest Bug Fixes & Feature Implementation Plan

**Date**: January 21, 2025
**Version**: 1.3.8, Build 23

## Overview

Comprehensive implementation plan for onboarding improvements, profile enhancements, and new features.

---

## Phase 1: Onboarding Restructuring (Priority: CRITICAL)

### 1.1 Gender & Sexuality Separation

**Current State**:

- `gender.tsx` incorrectly uses sexual orientations (Asexual, Bisexual, Gay, etc.)
- `preferences.tsx` also uses sexual orientations

**Required Changes**:

1. **Create new `gender-identity.tsx`**:
   - Options: Man, Woman, Non-binary, Prefer not to say, Other
   - Title: "Gender Identity"
   - Subtitle: "How do you identify?"

2. **Create new `sexual-orientation.tsx`**:
   - Options: Straight, Gay, Lesbian, Bisexual, Pansexual, Asexual, Queer, Questioning
   - Title: "Sexual Orientation"
   - Subtitle: "Who are you attracted to?"

3. **Create new `interested-in.tsx`**:
   - Options: Men, Women, Everyone, Non-binary people
   - Multi-select capability
   - Title: "Interested In"
   - Subtitle: "Who would you like to see on Harvest?"
   - Smart defaults based on orientation

4. **Remove**:
   - Old `gender.tsx`
   - Old `preferences.tsx`

### 1.2 Smart Filter Defaults

**Implementation**:

- If user selects "Straight" + "Man" → default show "Women"
- If user selects "Straight" + "Woman" → default show "Men"
- If user selects "Gay" + "Man" → default show "Men"
- If user selects "Lesbian" + "Woman" → default show "Women"
- If user selects "Bisexual" → default show "Everyone"
- Always allow manual override

### 1.3 Back Button Implementation

**Files to Modify**:

- `components/OnboardingScreen.tsx` - Add back button prop
- All 11 onboarding step files - Add back navigation

**Implementation**:

```typescript
<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
  <Ionicons name="arrow-back" size={24} color="#8B1E2D" />
</TouchableOpacity>
```

### 1.4 Name Field Change

**File**: `app/onboarding/nickname.tsx`

**Changes**:

- Title: "Your Harvest Name" → "What's your name?"
- Subtitle: Remove nickname mention, ask for first name
- Placeholder: "Nickname" → "First Name"
- Field name: `nickname` → `first_name`
- Validation: Require minimum 2 characters

### 1.5 Terms of Service & Age Confirmation

**New File**: `app/onboarding/terms.tsx`

**Components**:

1. Checkbox: "I am at least 18 years old"
2. Checkbox: "I agree to the Terms of Service and Privacy Policy"
3. Links to view documents
4. Required to proceed

**New Files Needed**:

- `app/legal/terms-of-service.tsx`
- `app/legal/privacy-policy.tsx`
- `app/legal/community-guidelines.tsx`

### 1.6 Relationship Goals Multi-Select

**File**: `app/onboarding/goals.tsx`

**Changes**:

- Change from single select to multi-select
- Update state: `string | null` → `string[]`
- Update UI to show multiple selections
- Save as array in database

### 1.7 Location Enhancement

**File**: `app/onboarding/location.tsx` (already exists)

**Verify**:

- ✓ GPS functionality exists
- ✓ City + State capture

**Add**:

- Display format: "City, State" on profiles
- Distance calculation: "X miles away" based on GPS coordinates

---

## Phase 2: Profile & Swipe Improvements

### 2.1 Swipe Card Scrolling Fix

**File**: `components/HarvestSwipeCard.tsx`

**Current Issue**: Scrolling triggers superlike

**Solution**:

- Implement PanGestureHandler with directional detection
- Only trigger swipe on horizontal pan
- Allow vertical scroll for profile viewing
- Differentiate between swipe-up (superlike) and scroll-up (view profile)

### 2.2 Rename "Superlike" to "Top Pick"

**Files to Update**:

- `components/HarvestSwipeCard.tsx`
- `app/_tabs/index.tsx` (main swipe screen)
- Database schema (swipes table: 'super_like' → 'top_pick')
- All UI text references

### 2.3 Match Profile View

**File**: `app/_tabs/matches.tsx`

**Implementation**:

- Make profile photo bubbles tappable
- Navigate to full profile modal on tap
- Show full profile with all photos, bio, interests

### 2.4 Profile Editing Verification

**Files to Check**:

- `app/profile-edit.tsx`
- Verify all fields are editable
- Test save functionality

---

## Phase 3: Gardener/Coach Improvements

### 3.1 Fix Keyboard Covering Input

**File**: `components/GardenerChat.tsx` or wherever chat exists

**Solution**:

- Wrap in `KeyboardAvoidingView`
- Use `behavior="padding"` for iOS
- Add `keyboardVerticalOffset` prop
- Ensure input stays above keyboard

### 3.2 Concise Coach Responses

**File**: `lib/ai/gardenerService.ts`

**Changes**:

- Update system prompt to limit response length
- Add instruction: "Keep responses to 2-3 sentences maximum"
- Maintain wisdom but reduce verbosity

### 3.3 Coaching Style Adjustment

**File**: `lib/ai/gardenerService.ts`

**System Prompt Updates**:

- Remove: "Suggest specific things to say"
- Remove: "Provide sample messages"
- Add: "Focus on explaining principles of empathy and communication"
- Add: "Guide users to find their own authentic voice"
- Add: "Teach self-regulation and emotional intelligence"

### 3.4 Values-Based Matching

**New Feature**:

**Database Schema Addition**:

```sql
CREATE TABLE user_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  value_brought TEXT NOT NULL,
  value_sought TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**New Files**:

- `app/gardener/values-questions.tsx`
- `components/ValuesDisplay.tsx`

**Implementation**:

- Create values questionnaire in Gardener section
- Display "Top values brought" and "Top values sought" on profile
- Add toggle for visibility
- Store in database

---

## Phase 4: Mindful Messaging Feature

### 4.1 Mindful Messaging System

**New Files**:

- `lib/mindful-messaging.ts` - Detection logic
- `components/MindfulPrompt.tsx` - Warning modal
- `components/GrowthLesson.tsx` - Educational content

**Detection System**:

- Flag words: profanity, aggressive language, sexual content
- Emotional cues: ALL CAPS, excessive punctuation (!!!), anger indicators
- Context analysis: Use OpenAI for sentiment analysis

**User Flow**:

1. User types flagged message
2. Modal appears: "Would you like to rethink this message?"
3. Show relevant Growth Lesson
4. User can: Edit, Send anyway, or Cancel

**Settings**:

- Add toggle in chat settings
- Default: ON
- Store preference in database

### 4.2 Restrict Copy/Paste

**File**: `app/chat.tsx`

**Implementation**:

```typescript
<TextInput
  ...
  editable={true}
  contextMenuHidden={true} // Disables copy/paste menu
  onLongPress={() => {}} // Prevent long-press menu
/>
```

**Android**:

```typescript
// Add to TextInput props
textInputProps={{
  allowFontScaling: false,
  selectionColor: '#8B1E2D',
  autoCorrect: true,
  autoComplete: 'off',
  importantForAutofill: 'no',
}}
```

---

## Implementation Order

### Week 1: Critical Onboarding Fixes

1. ✅ Day 1-2: Separate gender identity and sexual orientation
2. ✅ Day 2-3: Add Back buttons
3. ✅ Day 3-4: Terms of Service & age checkbox
4. ✅ Day 4-5: Name field change + multi-select goals

### Week 2: Profile & UX Improvements

1. ✅ Day 1-2: Fix swipe card scrolling
2. ✅ Day 2-3: Rename Superlike → Top Pick
3. ✅ Day 3-4: Match profile view
4. ✅ Day 4-5: Gardener keyboard fix

### Week 3: Advanced Features

1. ✅ Day 1-2: Coach response improvements
2. ✅ Day 2-3: Values-based matching
3. ✅ Day 3-4: Mindful Messaging system
4. ✅ Day 4-5: Copy/paste restriction

### Week 4: Testing & Polish

1. ✅ End-to-end testing
2. ✅ Bug fixes
3. ✅ Documentation
4. ✅ TestFlight deployment

---

## Database Schema Changes Required

```sql
-- Add new columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS gender_identity TEXT,
ADD COLUMN IF NOT EXISTS sexual_orientation TEXT,
ADD COLUMN IF NOT EXISTS interested_in TEXT[],
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS age_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS goals TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS mindful_messaging_enabled BOOLEAN DEFAULT TRUE;

-- Rename swipe types
UPDATE swipes SET action = 'top_pick' WHERE action = 'super_like';

-- Create values table
CREATE TABLE IF NOT EXISTS user_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  value_brought TEXT NOT NULL,
  value_sought TEXT NOT NULL,
  display_on_profile BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_values_user_id ON user_values(user_id);
```

---

## Testing Checklist

### Onboarding Flow

- [ ] Gender identity selection works
- [ ] Sexual orientation selection works
- [ ] Interested in multi-select works
- [ ] Smart defaults apply correctly
- [ ] Back button on all steps
- [ ] Terms checkbox required
- [ ] Links open legal documents
- [ ] Name field accepts first name
- [ ] Goals multi-select works
- [ ] Location GPS works
- [ ] All data saves to database

### Profile & Swipe

- [ ] Can scroll profile without superlike
- [ ] Top Pick label appears correctly
- [ ] Match photo opens full profile
- [ ] All profile fields editable

### Coach & Messaging

- [ ] Keyboard doesn't cover input
- [ ] Coach responses concise
- [ ] Coaching style appropriate
- [ ] Values questions work
- [ ] Values display on profile
- [ ] Mindful messaging triggers
- [ ] Copy/paste disabled in chat

---

## Files to Create

1. `app/onboarding/gender-identity.tsx`
2. `app/onboarding/sexual-orientation.tsx`
3. `app/onboarding/interested-in.tsx`
4. `app/onboarding/terms.tsx`
5. `app/legal/terms-of-service.tsx`
6. `app/legal/privacy-policy.tsx`
7. `app/legal/community-guidelines.tsx`
8. `app/gardener/values-questions.tsx`
9. `components/ValuesDisplay.tsx`
10. `lib/mindful-messaging.ts`
11. `components/MindfulPrompt.tsx`
12. `components/GrowthLesson.tsx`
13. `supabase/migrations/009_user_profile_updates.sql`

## Files to Modify

1. `app/onboarding/nickname.tsx` → first name
2. `app/onboarding/goals.tsx` → multi-select
3. `components/OnboardingScreen.tsx` → back button
4. `components/HarvestSwipeCard.tsx` → scrolling + rename superlike
5. `app/_tabs/matches.tsx` → profile view on tap
6. `app/chat.tsx` → keyboard fix + copy/paste restriction
7. `lib/ai/gardenerService.ts` → concise responses + style
8. All onboarding steps → add back button

## Files to Delete

1. `app/onboarding/gender.tsx` (old version)
2. `app/onboarding/preferences.tsx` (old version)

---

**Status**: Ready for implementation
**Estimated Completion**: 3-4 weeks
**Priority**: Start with Phase 1 (Onboarding) as it affects user acquisition
