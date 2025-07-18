# Harvest Dating App - Next Steps Plan

## Executive Summary

Your Harvest dating app has a solid foundation with completed onboarding flow, working image upload, and professional UI. The next phase focuses on backend implementation, core dating features, and preparing for launch to 5-10k users.

## Backend Decision: Supabase vs Custom Solution

### Recommended: **Supabase** ✅

Based on your preference and project needs, Supabase is the optimal choice:

**Why Supabase is Perfect for Harvest:**

- **Rapid Development**: 3-4x faster than custom backend
- **Cost-Effective**: ~$25/month for 5k users, ~$100/month for 10k users
- **Real-time Built-in**: Perfect for chat and live updates
- **React Native SDK**: Excellent integration with your existing stack
- **Authentication**: Built-in auth with social logins
- **File Storage**: Integrated storage for profile photos
- **Postgres**: Powerful relational database with JSON support
- **Edge Functions**: Serverless functions for matching algorithms

**Cost Comparison:**

- **Supabase**: $25-100/month (5-10k users)
- **Custom AWS**: $300-1000/month (5-10k users)
- **Savings**: 75-90% cost reduction

## Phase 1: Backend Setup & Core Features (Weeks 1-4)

### Week 1: Supabase Foundation

**Priority: High**

#### 1.1 Supabase Project Setup

```bash
# Install Supabase CLI and dependencies
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-react-native
```

#### 1.2 Database Schema Design

Create tables in Supabase Dashboard:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  first_name TEXT,
  bio TEXT,
  age INTEGER,
  gender TEXT,
  sexual_identity TEXT,
  location POINT,
  city TEXT,
  max_distance INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  min_age INTEGER,
  max_age INTEGER,
  interested_in TEXT[],
  relationship_goals TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photos table
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hobbies/Interests
CREATE TABLE user_hobbies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  hobby TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 1.3 Authentication Integration

- Set up Supabase Auth in your app
- Replace placeholder login with real authentication
- Add email/phone verification
- Implement social login (Google, Apple)

**Files to Update:**

- `app/login.tsx` - Real authentication
- `app/_layout.tsx` - Auth state management
- Create `lib/supabase.ts` - Supabase client configuration

### Week 2: User Profile & Data Management

**Priority: High**

#### 2.1 Profile Management

- Connect onboarding flow to Supabase
- Save user data from all onboarding screens
- Implement profile editing functionality
- Add photo upload to Supabase Storage

#### 2.2 Location Services

- Implement location-based features
- Add city/region detection
- Set up geolocation permissions
- Create location update functions

**Files to Update:**

- All onboarding screens to save to Supabase
- `app/_tabs/two.tsx` - Connect to real user data
- Create `lib/userService.ts` - User data operations

### Week 3: Core Matching System

**Priority: High**

#### 3.1 Matching Algorithm (Supabase Edge Function)

Create matching logic considering:

- Age preferences
- Distance
- Sexual identity compatibility
- Relationship goals alignment
- Mutual interests

#### 3.2 Swipe Functionality

```sql
-- Swipes table
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID REFERENCES users(id) ON DELETE CASCADE,
  swiped_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_like BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(swiper_id, swiped_id)
);

-- Matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);
```

#### 3.3 Discovery Screen Implementation

- Update `app/_tabs/index.tsx` with real user cards
- Implement swipe gestures
- Add match notifications
- Create user card component

### Week 4: Real-time Chat Foundation

**Priority: Medium**

#### 4.1 Chat Schema

```sql
-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4.2 Basic Chat Interface

- Create chat screen
- Implement message sending
- Add real-time message updates using Supabase Realtime
- Add to tab navigation

## Phase 2: Enhanced Features (Weeks 5-8)

### Week 5: Advanced Matching & Filters

- Implement advanced filters
- Add "Super Like" functionality
- Create match quality scoring
- Add mutual friends detection

### Week 6: Enhanced Chat Features

- Add photo sharing in chat
- Implement message reactions
- Add typing indicators
- Create chat list/inbox

### Week 7: Push Notifications

- Set up Expo notifications
- Integrate with Supabase Edge Functions
- Add match notifications
- Implement message notifications

### Week 8: Profile Enhancements

- Add profile verification
- Implement profile boost features
- Add more photo options
- Create profile insights

## Phase 3: Polish & Launch Prep (Weeks 9-12)

### Week 9: Testing & Bug Fixes

- Comprehensive testing
- Performance optimization
- Security audit
- Bug fixes

### Week 10: App Store Preparation

- Create app store assets
- Write app descriptions
- Set up app store accounts
- Prepare marketing materials

### Week 11: Beta Testing

- Internal testing
- Friend/family beta
- TestFlight/Play Console setup
- Feedback incorporation

### Week 12: Launch

- App store submission
- Marketing campaign launch
- User acquisition strategy
- Monitoring and analytics

## Technical Implementation Priority

### Immediate (This Week)

1. **Set up Supabase project** - 2 hours
2. **Install Supabase dependencies** - 1 hour
3. **Create database schema** - 4 hours
4. **Set up authentication** - 6 hours

### Week 1 Goals

- Working Supabase authentication
- User registration saving to database
- Basic profile viewing from database
- Photo upload to Supabase Storage

### Week 2 Goals

- Complete onboarding data flow
- Working profile editing
- Location services integration
- User discovery preparation

## Cost Breakdown (Supabase)

### 5,000 Users

- **Supabase Pro**: $25/month
- **Storage**: ~$10/month (photos)
- **Edge Functions**: ~$5/month
- **Total**: ~$40/month

### 10,000 Users

- **Supabase Pro**: $25/month
- **Additional Database**: ~$50/month
- **Storage**: ~$20/month
- **Edge Functions**: ~$10/month
- **Total**: ~$105/month

## Development Tools & Resources

### Required Installations

```bash
# Supabase CLI
npm install -g supabase
# React Native dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-react-native
npm install react-native-url-polyfill
# Additional utilities
npm install expo-location expo-notifications
```

### Recommended VS Code Extensions

- Supabase
- PostgreSQL
- React Native Tools
- Expo Tools

## Risk Mitigation

### Technical Risks

- **Supabase limits**: Monitor usage, have scaling plan
- **Real-time performance**: Implement efficient queries
- **Image storage costs**: Optimize image sizes

### Business Risks

- **User acquisition**: Prepare marketing strategy
- **Retention**: Focus on core matching quality
- **Monetization**: Plan premium features

## Success Metrics

### Week 4 Targets

- User registration working
- Basic matching functional
- Profile management complete
- 50+ test users onboarded

### Week 8 Targets

- Full feature set complete
- Chat functionality working
- Push notifications active
- Beta testing initiated

### Week 12 Targets

- App store approval
- 100+ active users
- Core metrics tracking
- User feedback integration

## Next Immediate Action Items

1. **Today**: Set up Supabase project and get API keys
2. **Tomorrow**: Install dependencies and create database schema
3. **This Week**: Implement authentication and user registration
4. **Next Week**: Connect onboarding flow to database

This plan prioritizes rapid development with Supabase while maintaining quality and scalability for your 5-10k user target. The cost savings compared to custom backend allows more budget for marketing and user acquisition.

Would you like me to start with the Supabase setup immediately?
