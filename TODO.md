# Harvest App - TODO List

## 🚀 Expo SDK 54 Upgrade (2-3 Months Post-Launch)

**Target Timeline**: 2-3 months after initial launch
**Current Status**: App stable on Expo SDK 53.0.20, React Native 0.79.5
**Risk Level**: HIGH (Major breaking changes)

---

### Pre-Upgrade Checklist

- [ ] **App is live and stable** for at least 2 months
- [ ] **Gather baseline metrics**:
  - [ ] Current crash rate (should be <0.1%)
  - [ ] Average app load time
  - [ ] Animation performance (60fps confirmed)
  - [ ] User engagement metrics
  - [ ] API response times
- [ ] **Create backup**:
  - [ ] Tag current release: `git tag -a v1.3.8-stable -m "Stable release before SDK 54 upgrade"`
  - [ ] Push tag: `git push origin v1.3.8-stable`
  - [ ] Create backup branch: `git checkout -b backup/pre-sdk54`
- [ ] **Create feature branch**: `git checkout -b feature/expo-sdk-54-upgrade`
- [ ] **Backup Supabase database** (full export)
- [ ] **Document all custom native modifications** in ios/ and android/ folders
- [ ] **Review SDK 54 changelog**: https://expo.dev/changelog/2024/11-12-sdk-54

---

### Step-by-Step Upgrade Process

#### 1. Update Expo SDK (Terminal)

```bash
# Install latest Expo CLI
npm install -g expo-cli@latest

# Update to SDK 54 (will update many dependencies)
npx expo install expo@^54.0.0 --fix

# Check what will be updated (don't upgrade yet)
npx expo-doctor
```

#### 2. Review Breaking Changes

**Critical Breaking Changes to Address:**

##### A. React Native Reanimated v3 → v4 Migration

**Problem**: Your app heavily uses Reanimated v3 for swipe cards and animations. Reanimated v4 has breaking API changes.

**Files to Update**:

- `components/HarvestSwipeCard.tsx` - Swipe animations
- `components/gardener/GardenerChat.tsx` - Scroll animations
- `app/_tabs/two.tsx` - Profile scroll animations
- Any other files using `useAnimatedStyle`, `useSharedValue`, `withTiming`, `withSpring`

**Migration Steps**:

```bash
# Install Reanimated v4
npx expo install react-native-reanimated@^4.0.0

# Install worklets (required for Reanimated v4)
npx expo install react-native-worklets-core
```

**Code Changes Required**:

```typescript
// OLD (Reanimated v3)
const animatedStyle = useAnimatedStyle(() => {
  return {
    transform: [{ translateX: offset.value }],
  };
});

// NEW (Reanimated v4) - Add 'worklet' directive
const animatedStyle = useAnimatedStyle(() => {
  'worklet';
  return {
    transform: [{ translateX: offset.value }],
  };
});
```

**Testing Required**:

- [ ] Swipe cards work smoothly
- [ ] No animation jank or crashes
- [ ] Haptic feedback still works
- [ ] All gesture handlers work correctly

##### B. expo-file-system API Changes

**Problem**: Legacy API moved to `/legacy` export.

**Files to Check**:

```bash
# Search for expo-file-system usage
grep -r "expo-file-system" app/ components/ lib/
```

**Migration Steps**:

```typescript
// If using legacy API:
// OLD
import * as FileSystem from 'expo-file-system';

// NEW
import * as FileSystem from 'expo-file-system/legacy';
```

##### C. Metro Internal Imports

**Problem**: Metro config may have internal imports that break.

**File to Check**: `metro.config.js`

**Action**: Review and update if using internal Metro APIs.

##### D. React Native 0.81 Changes

**Problem**: JSC (JavaScriptCore) support removed, must use Hermes.

**File to Check**: `app.json`

**Ensure**:

```json
{
  "expo": {
    "jsEngine": "hermes"
  }
}
```

#### 3. Update Dependencies

```bash
# Update all Expo packages to SDK 54 compatible versions
npx expo install --fix

# Update Supabase (check compatibility)
npm install @supabase/supabase-js@latest

# Update gesture handler
npx expo install react-native-gesture-handler@latest

# Update other critical dependencies
npx expo install expo-router@latest expo-notifications@latest expo-location@latest
```

#### 4. Update Native Projects

```bash
# Regenerate iOS project
npx expo prebuild --clean --platform ios

# Regenerate Android project
npx expo prebuild --clean --platform android
```

#### 5. Fix TypeScript Errors

```bash
# Run type check
npm run type-check

# Expected errors: API changes in Reanimated, expo-file-system, router
# Fix all errors before testing
```

#### 6. Testing Phase

##### Local Testing

- [ ] `npx expo start --clear` - Dev mode works
- [ ] `npx expo run:ios` - iOS simulator works
- [ ] `npx expo run:android` - Android emulator works
- [ ] All features tested manually

##### Build Testing

```bash
# Build development client
npx eas build --profile development --platform ios
npx eas build --profile development --platform android

# Install on real devices and test
```

##### Comprehensive Testing Checklist

- [ ] **Authentication**
  - [ ] Email signup works
  - [ ] Google OAuth works
  - [ ] Logout works
- [ ] **Onboarding**
  - [ ] All 11 steps complete
  - [ ] Data saves to Supabase
  - [ ] Photos upload correctly
  - [ ] No crashes at completion
- [ ] **Swipe Cards**
  - [ ] Smooth animations (60fps)
  - [ ] Like/nope/super like work
  - [ ] Haptic feedback works
  - [ ] Photos load correctly
- [ ] **Chat**
  - [ ] Messages send/receive
  - [ ] Real-time updates work
  - [ ] Mindful messaging works
  - [ ] Input not blocked by keyboard
- [ ] **Profile**
  - [ ] Edit mode works
  - [ ] Photo uploads work
  - [ ] Values questionnaire works
- [ ] **Gardener AI**
  - [ ] Chat responds correctly
  - [ ] Daily quiz works
  - [ ] Tips display correctly
- [ ] **Settings**
  - [ ] All toggles work
  - [ ] Logout works
  - [ ] Filters apply correctly

##### Performance Testing

- [ ] App load time < 3 seconds
- [ ] Animations run at 60fps
- [ ] No memory leaks (use Xcode Instruments)
- [ ] No crash reports in development

#### 7. Gradual Rollout

```bash
# Build preview (TestFlight)
npx eas build --clear-cache --platform ios --profile preview
npx eas submit --platform ios --profile preview

# Submit to TestFlight
# Test with 10-20 beta users for 1 week
```

**Beta Testing Period**: 1-2 weeks

- [ ] Monitor crash reports daily
- [ ] Track user feedback
- [ ] Fix critical bugs immediately
- [ ] Compare metrics to baseline

#### 8. Production Deployment

**Only proceed if**:

- [ ] Zero critical bugs in beta
- [ ] Crash rate < 0.1%
- [ ] User feedback is positive
- [ ] All features work correctly

```bash
# Build production
npx eas build --clear-cache --platform ios --profile production
npx eas build --clear-cache --platform android --profile production

# Submit to app stores
npx eas submit --platform ios --profile production
npx eas submit --platform android --profile production
```

---

### Rollback Plan

**If upgrade fails or introduces critical bugs:**

1. **Revert to stable tag**:

```bash
git checkout v1.3.8-stable
git checkout -b hotfix/rollback-sdk54
```

2. **Rebuild with SDK 53**:

```bash
npx eas build --clear-cache --platform ios --profile production
npx eas submit --platform ios --profile production
```

3. **Revert database changes** (if any migrations were run)

4. **Notify users** via in-app announcement

---

### Estimated Timeline

| Phase                | Duration      | Details                                     |
| -------------------- | ------------- | ------------------------------------------- |
| Pre-upgrade prep     | 1 week        | Backups, documentation, review changelog    |
| Upgrade & fix errors | 1-2 weeks     | SDK update, fix TypeScript/build errors     |
| Local testing        | 1 week        | Comprehensive testing on simulators/devices |
| Beta testing         | 1-2 weeks     | TestFlight with 10-20 users                 |
| Production deploy    | 1 day         | App store submission                        |
| **TOTAL**            | **4-6 weeks** | Full upgrade timeline                       |

---

### Success Criteria

**Upgrade is considered successful if**:

- ✅ All features work as before
- ✅ Crash rate remains < 0.1%
- ✅ Performance matches or exceeds baseline
- ✅ No user complaints about bugs
- ✅ App passes App Store review
- ✅ Real-time features work correctly
- ✅ No Supabase connectivity issues

---

### Risk Mitigation

**High Risk Areas**:

1. **Reanimated v4 Migration** - Most complex change
   - Mitigation: Allocate 1 week for migration, test extensively
2. **Supabase Compatibility** - Unknown compatibility with RN 0.81
   - Mitigation: Test auth, database, storage on day 1
3. **Native Module Conflicts** - Gesture handler, notifications, location
   - Mitigation: Test each module independently

**Medium Risk Areas**:

1. Expo Router API changes
2. Build configuration changes
3. iOS/Android platform-specific issues

**Low Risk Areas**:

1. UI components (mostly React Native core)
2. Business logic (JavaScript-only code)

---

### Notes

- **DO NOT UPGRADE** until app has been stable in production for 2-3 months
- **DO NOT UPGRADE** during holiday seasons or peak usage times
- **DO NOT UPGRADE** if major features are being developed
- **ALWAYS TEST** on real devices before deploying to production
- **ALWAYS HAVE** a rollback plan ready

---

### Resources

- [Expo SDK 54 Changelog](https://expo.dev/changelog/2024/11-12-sdk-54)
- [React Native 0.81 Release Notes](https://reactnative.dev/blog)
- [Reanimated v4 Migration Guide](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/)
- [Expo Upgrade Guide](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)

---

**Last Updated**: January 21, 2025
**Next Review**: After 2 months in production (March 2025)
