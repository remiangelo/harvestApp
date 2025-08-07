# Harvest App - Production Deployment Checklist

## ✅ Pre-Deployment Tasks

### 1. Environment Configuration
- [x] Set up production Supabase project
- [x] Configure production environment variables in EAS Secrets
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [x] Update `app.config.js` with production values
- [ ] Set up push notification credentials (FCM for Android, APNs for iOS)

### 2. Database Setup
- [ ] Run all migrations on production Supabase
  ```sql
  -- Run in order:
  001_initial_schema.sql
  002_swipes_and_matches.sql
  003_users_table_updates.sql
  004_swipes_tracking.sql (if created)
  005_matches_table.sql (if created)
  006_messages_realtime.sql (if created)
  ```
- [ ] Set up Row Level Security (RLS) policies
- [ ] Create storage buckets for profile photos
- [ ] Set up database backups

### 3. Code Quality
- [ ] Fix all ESLint warnings
  ```bash
  npm run lint -- --fix
  ```
- [ ] Run TypeScript checks
  ```bash
  npm run type-check
  ```
- [ ] Remove all console.log statements
- [ ] Ensure error handling is in place

### 4. Performance Optimization
- [ ] Enable Hermes for Android
- [ ] Optimize image sizes and formats
- [ ] Implement lazy loading where appropriate
- [ ] Test on low-end devices

### 5. Security
- [ ] Enable certificate pinning
- [ ] Implement rate limiting on API calls
- [ ] Add input validation and sanitization
- [ ] Set up Content Security Policy
- [ ] Review and secure all API endpoints

## 📱 App Store Preparation

### iOS (App Store)
- [ ] Create App Store Connect account
- [ ] Generate App Store icons (1024x1024)
- [ ] Prepare screenshots for all required device sizes
- [ ] Write app description and keywords
- [ ] Set up TestFlight for beta testing
- [ ] Configure App Store categories
- [ ] Add privacy policy URL
- [ ] Add terms of service URL

### Android (Google Play)
- [ ] Create Google Play Console account
- [ ] Generate feature graphic (1024x500)
- [ ] Create app icon (512x512)
- [ ] Prepare screenshots for phones and tablets
- [ ] Write short and full descriptions
- [ ] Set up internal testing track
- [ ] Configure content rating questionnaire
- [ ] Add privacy policy URL

## 🚀 Deployment Steps

### 1. Build Production Apps
```bash
# iOS Production Build
eas build --platform ios --profile production

# Android Production Build
eas build --platform android --profile production
```

### 2. Submit to Stores
```bash
# Submit to App Store
eas submit --platform ios --profile production

# Submit to Google Play
eas submit --platform android --profile production
```

### 3. Post-Launch Monitoring
- [ ] Set up crash reporting (Sentry/Crashlytics)
- [ ] Configure analytics (Mixpanel/Amplitude)
- [ ] Monitor server performance
- [ ] Set up user feedback channels
- [ ] Monitor app store reviews

## 📊 Analytics & Monitoring

### Essential Metrics to Track
- User acquisition and retention
- Swipe patterns and match rates
- Message engagement
- App crashes and errors
- API response times
- Storage usage

### Tools to Set Up
- [ ] Sentry for error tracking
- [ ] Mixpanel for user analytics
- [ ] Supabase Dashboard for database monitoring
- [ ] Push notification delivery rates

## 🔄 CI/CD Pipeline

### GitHub Actions Setup
```yaml
# .github/workflows/eas-build.yml
name: EAS Build
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - uses: expo/expo-github-action@v8
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: eas build --platform all --non-interactive
```

## 📝 Legal Requirements

- [ ] Privacy Policy (GDPR/CCPA compliant)
- [ ] Terms of Service
- [ ] Cookie Policy (for web version)
- [ ] Age verification (18+ dating app requirement)
- [ ] Data deletion policy
- [ ] User consent for data processing

## 🧪 Testing Checklist

### Manual Testing
- [ ] Complete onboarding flow
- [ ] Test all swipe gestures
- [ ] Verify match notifications
- [ ] Test chat functionality
- [ ] Check filter preferences
- [ ] Verify photo upload/deletion
- [ ] Test on various network conditions
- [ ] Verify deep linking

### Device Testing
- [ ] iPhone 15 Pro
- [ ] iPhone 13 Mini
- [ ] iPhone SE
- [ ] Samsung Galaxy S24
- [ ] Google Pixel 8
- [ ] OnePlus 12

## 🎯 Launch Strategy

### Soft Launch (Week 1-2)
- Release to 100-500 beta users
- Monitor crash rates and performance
- Collect user feedback
- Fix critical bugs

### Gradual Rollout (Week 3-4)
- Increase to 1000-2000 users
- A/B test key features
- Optimize onboarding flow
- Improve match algorithm

### Full Launch (Week 5+)
- Open to all users
- Launch marketing campaign
- Monitor scaling issues
- Iterate based on feedback

## 📞 Support Setup

- [ ] Set up support email
- [ ] Create FAQ documentation
- [ ] Set up in-app feedback form
- [ ] Configure automated responses
- [ ] Train support team

## 💰 Monetization Setup

- [ ] Configure in-app purchases
- [ ] Set up subscription tiers
- [ ] Implement receipt validation
- [ ] Set up revenue tracking
- [ ] Configure payment processing

## Emergency Procedures

### Rollback Plan
1. Keep previous version APK/IPA files
2. Document rollback procedures
3. Test rollback process

### Incident Response
1. Set up status page
2. Create incident response team
3. Document escalation procedures

---

## Final Checklist Before Launch

- [ ] All features tested and working
- [ ] Performance metrics meet targets
- [ ] Security audit completed
- [ ] Legal documents in place
- [ ] Support channels ready
- [ ] Analytics configured
- [ ] Backup and recovery tested
- [ ] Team trained and ready

**Target Launch Date:** _____________

**Approved by:** _____________

**Last Updated:** August 7, 2025