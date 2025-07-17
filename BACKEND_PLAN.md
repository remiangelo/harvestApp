# Harvest Dating App - Backend Architecture Plan

## Executive Summary

This document outlines the comprehensive backend architecture for Harvest, a React Native dating app designed to handle 5-10k users with potential for significant growth. The architecture prioritizes scalability, real-time features, data security, and cost-effectiveness.

## Table of Contents

1. [Technology Stack Recommendations](#technology-stack-recommendations)
2. [System Architecture](#system-architecture)
3. [Database Design](#database-design)
4. [API Design](#api-design)
5. [Authentication & Security](#authentication--security)
6. [Real-time Features](#real-time-features)
7. [File Storage & Media](#file-storage--media)
8. [Matching Algorithm](#matching-algorithm)
9. [Push Notifications](#push-notifications)
10. [Analytics & Monitoring](#analytics--monitoring)
11. [Deployment Strategy](#deployment-strategy)
12. [Scalability Considerations](#scalability-considerations)
13. [Development Timeline](#development-timeline)
14. [Cost Estimation](#cost-estimation)
15. [Risk Assessment](#risk-assessment)

## Technology Stack Recommendations

### Primary Backend Framework: **Node.js with Express.js**

**Why Node.js?**
- Perfect for real-time applications (chat, notifications)
- Excellent ecosystem for React Native integration
- Fast development cycle
- Great for handling concurrent connections (dating apps have high concurrency)
- Cost-effective for startups
- Large talent pool

**Alternative Considerations:**
- **Python (Django/FastAPI)**: Better for ML/AI features but slower for real-time
- **Go**: Excellent performance but smaller ecosystem
- **Java (Spring Boot)**: Enterprise-grade but heavier for startup needs

### Database Strategy: **Hybrid Approach**

#### Primary Database: **PostgreSQL**
- **User profiles, relationships, matches**
- ACID compliance for critical data
- Excellent JSON support for flexible schemas
- Strong consistency for user data
- Mature ecosystem

#### Secondary Database: **Redis**
- **Session management**
- **Real-time chat caching**
- **Matching algorithm cache**
- **Rate limiting**
- **Pub/Sub for real-time features**

#### Optional: **MongoDB** (for specific use cases)
- **Analytics data**
- **User activity logs**
- **Flexible schema for evolving features**

### Cloud Platform: **AWS** (Recommended)

**Why AWS?**
- Comprehensive services ecosystem
- Excellent React Native SDK support
- Cost-effective for startups with free tier
- Global CDN with CloudFront
- Mature real-time services (AppSync, IoT Core)

**Alternative:** **Google Cloud Platform**
- Better ML/AI services
- Competitive pricing
- Excellent Firebase integration

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   React Native  │    │   React Native  │
│   Mobile App    │    │   Mobile App    │    │   Mobile App    │
│   (iOS/Android) │    │   (iOS/Android) │    │   (iOS/Android) │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │     Load Balancer         │
                    │     (AWS ALB)             │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │     API Gateway           │
                    │     (AWS API Gateway)     │
                    └─────────────┬─────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
┌─────────▼───────┐    ┌─────────▼───────┐    ┌─────────▼───────┐
│   Auth Service  │    │   User Service  │    │   Match Service │
│   (Node.js)     │    │   (Node.js)     │    │   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │     Database Layer        │
                    │   PostgreSQL + Redis      │
                    └───────────────────────────┘
```

### Microservices Architecture

#### Core Services:

1. **Authentication Service**
   - User registration/login
   - JWT token management
   - Password reset
   - OAuth integration (Google, Apple)

2. **User Management Service**
   - Profile management
   - Photo upload/management
   - Preferences handling
   - Account settings

3. **Matching Service**
   - Matching algorithm execution
   - Swipe handling
   - Match creation
   - Recommendation engine

4. **Chat Service**
   - Real-time messaging
   - Message history
   - Media sharing
   - Message encryption

5. **Notification Service**
   - Push notifications
   - Email notifications
   - In-app notifications
   - Notification preferences

6. **Analytics Service**
   - User behavior tracking
   - App performance metrics
   - Business intelligence
   - A/B testing support

## Database Design

### PostgreSQL Schema

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    sexual_orientation VARCHAR(20),
    bio TEXT,
    location POINT,
    city VARCHAR(100),
    country VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_active TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### User Photos Table
```sql
CREATE TABLE user_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    photo_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### User Preferences Table
```sql
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    min_age INTEGER DEFAULT 18,
    max_age INTEGER DEFAULT 100,
    max_distance INTEGER DEFAULT 50,
    preferred_genders TEXT[], -- Array of preferred genders
    relationship_goals VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Matches Table
```sql
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user1_id, user2_id)
);
```

#### Swipes Table
```sql
CREATE TABLE swipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    swiper_id UUID REFERENCES users(id) ON DELETE CASCADE,
    swiped_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_like BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(swiper_id, swiped_id)
);
```

#### Messages Table
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    message_type VARCHAR(20) DEFAULT 'text', -- text, image, gif
    media_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Redis Schema

#### Session Management
```
user:session:{userId} -> {sessionData}
```

#### Real-time Chat
```
chat:room:{matchId} -> {activeUsers, lastActivity}
chat:typing:{matchId} -> {typingUsers}
```

#### Matching Cache
```
user:potential_matches:{userId} -> [userIds]
user:daily_likes:{userId} -> count
```

## API Design

### RESTful API Endpoints

#### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

#### User Management
```
GET    /api/users/profile
PUT    /api/users/profile
DELETE /api/users/profile
POST   /api/users/photos
DELETE /api/users/photos/:photoId
PUT    /api/users/preferences
GET    /api/users/preferences
```

#### Matching
```
GET  /api/matches/potential
POST /api/matches/swipe
GET  /api/matches/my-matches
POST /api/matches/unmatch
```

#### Chat
```
GET  /api/chat/conversations
GET  /api/chat/conversations/:matchId/messages
POST /api/chat/conversations/:matchId/messages
PUT  /api/chat/conversations/:matchId/read
```

### WebSocket Events

#### Real-time Chat
```javascript
// Client -> Server
'join_chat': { matchId }
'send_message': { matchId, content, type }
'typing_start': { matchId }
'typing_stop': { matchId }

// Server -> Client
'message_received': { message }
'user_typing': { userId }
'user_stopped_typing': { userId }
'match_created': { match }
```

## Authentication & Security

### JWT Token Strategy
- **Access Token**: Short-lived (15 minutes)
- **Refresh Token**: Long-lived (7 days)
- **Device Token**: For push notifications

### Security Measures
1. **Password Security**
   - bcrypt hashing (12 rounds)
   - Password strength requirements
   - Rate limiting on login attempts

2. **API Security**
   - Rate limiting (express-rate-limit)
   - Input validation (Joi)
   - SQL injection prevention
   - CORS configuration

3. **Data Protection**
   - HTTPS everywhere
   - Sensitive data encryption
   - GDPR compliance
   - Photo verification

### Privacy Features
- Location approximation (not exact coordinates)
- Photo blur for unmatched users
- Block/report functionality
- Data deletion on account closure

## Real-time Features

### WebSocket Implementation
```javascript
// Socket.io server setup
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  const user = await verifyToken(token);
  socket.userId = user.id;
  next();
});
```

### Real-time Features
1. **Instant Messaging**
2. **Typing Indicators**
3. **Online Status**
4. **Match Notifications**
5. **Live Location Updates**

## File Storage & Media

### AWS S3 Strategy
```
bucket-structure/
├── users/
│   ├── {userId}/
│   │   ├── photos/
│   │   │   ├── original/
│   │   │   ├── thumbnail/
│   │   │   └── compressed/
│   │   └── documents/
└── chat/
    └── media/
        ├── images/
        └── videos/
```

### Image Processing Pipeline
1. **Upload** → S3 (original)
2. **Process** → Lambda function
3. **Generate** → Multiple sizes (thumbnail, compressed)
4. **Store** → S3 different folders
5. **CDN** → CloudFront distribution

### Content Moderation
- AWS Rekognition for inappropriate content
- Manual review queue for flagged content
- Automated NSFW detection

## Matching Algorithm

### Core Algorithm Components

#### 1. Distance-Based Filtering
```javascript
function getUsersInRadius(userLocation, radius) {
  return db.query(`
    SELECT * FROM users 
    WHERE ST_DWithin(location, ST_Point($1, $2), $3)
    AND is_active = true
  `, [userLocation.lat, userLocation.lng, radius]);
}
```

#### 2. Preference Matching
```javascript
function matchesPreferences(user1, user2) {
  const ageMatch = user2.age >= user1.preferences.min_age && 
                   user2.age <= user1.preferences.max_age;
  const genderMatch = user1.preferences.preferred_genders.includes(user2.gender);
  return ageMatch && genderMatch;
}
```

#### 3. Compatibility Score
```javascript
function calculateCompatibilityScore(user1, user2) {
  let score = 0;
  
  // Shared interests
  const sharedHobbies = user1.hobbies.filter(h => user2.hobbies.includes(h));
  score += sharedHobbies.length * 10;
  
  // Similar relationship goals
  if (user1.relationship_goals === user2.relationship_goals) {
    score += 20;
  }
  
  // Activity level
  const activityScore = calculateActivityCompatibility(user1, user2);
  score += activityScore;
  
  return score;
}
```

#### 4. Machine Learning Enhancement (Future)
- User behavior analysis
- Swipe pattern recognition
- Success rate optimization
- Collaborative filtering

## Push Notifications

### Firebase Cloud Messaging (FCM)
```javascript
const admin = require('firebase-admin');

async function sendMatchNotification(userId, matchedUser) {
  const message = {
    notification: {
      title: 'New Match! 💕',
      body: `You matched with ${matchedUser.firstName}!`
    },
    data: {
      type: 'match',
      matchId: matchedUser.id
    },
    token: userDeviceToken
  };
  
  await admin.messaging().send(message);
}
```

### Notification Types
1. **New Match** - Immediate
2. **New Message** - Immediate
3. **Daily Recommendations** - Scheduled
4. **Inactive User** - Weekly reminder
5. **Special Events** - Promotional

## Analytics & Monitoring

### Key Metrics to Track
1. **User Engagement**
   - Daily/Monthly Active Users
   - Session duration
   - Swipe patterns
   - Message response rates

2. **Business Metrics**
   - Match success rate
   - Conversation conversion
   - User retention
   - Revenue per user

3. **Technical Metrics**
   - API response times
   - Error rates
   - Database performance
   - Real-time message latency

### Tools
- **Application Monitoring**: New Relic / DataDog
- **Error Tracking**: Sentry
- **Analytics**: Mixpanel / Amplitude
- **Logs**: AWS CloudWatch

## Deployment Strategy

### Development Environment
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:pass@db:5432/harvest_dev
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=harvest_dev
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### Production Deployment (AWS)

#### Infrastructure as Code (Terraform)
```hcl
# ECS Cluster for API services
resource "aws_ecs_cluster" "harvest_cluster" {
  name = "harvest-production"
}

# RDS PostgreSQL instance
resource "aws_db_instance" "harvest_db" {
  identifier = "harvest-production"
  engine     = "postgres"
  engine_version = "14.9"
  instance_class = "db.t3.medium"
  allocated_storage = 100
  storage_encrypted = true
}

# ElastiCache Redis cluster
resource "aws_elasticache_cluster" "harvest_cache" {
  cluster_id = "harvest-redis"
  engine     = "redis"
  node_type  = "cache.t3.micro"
  num_cache_nodes = 1
}
```

#### CI/CD Pipeline (GitHub Actions)
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Build and push Docker image
        run: |
          docker build -t harvest-api .
          docker tag harvest-api:latest $ECR_REGISTRY/harvest-api:latest
          docker push $ECR_REGISTRY/harvest-api:latest
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster harvest-production --service harvest-api --force-new-deployment
```

## Scalability Considerations

### For 5-10K Users (Current Target)

#### Infrastructure Sizing
- **API Servers**: 2-3 ECS tasks (t3.medium)
- **Database**: RDS t3.medium (2 vCPU, 4GB RAM)
- **Cache**: ElastiCache t3.micro
- **Storage**: S3 with CloudFront CDN

#### Expected Load
- **Concurrent Users**: ~500-1000
- **API Requests**: ~10,000/hour
- **Messages**: ~50,000/day
- **Photo Uploads**: ~1,000/day

### Scaling Strategy (10K+ Users)

#### Horizontal Scaling
1. **Load Balancing**: Multiple API instances
2. **Database Sharding**: User-based partitioning
3. **CDN**: Global content distribution
4. **Caching**: Multi-layer caching strategy

#### Performance Optimizations
1. **Database Indexing**
   ```sql
   CREATE INDEX idx_users_location ON users USING GIST(location);
   CREATE INDEX idx_swipes_swiper_created ON swipes(swiper_id, created_at);
   CREATE INDEX idx_messages_match_created ON messages(match_id, created_at);
   ```

2. **Query Optimization**
   - Pagination for large datasets
   - Eager loading for related data
   - Database connection pooling

3. **Caching Strategy**
   - Redis for session management
   - Application-level caching
   - Database query result caching

## Development Timeline

### Phase 1: Foundation (Weeks 1-4)
- [ ] Project setup and infrastructure
- [ ] Database schema implementation
- [ ] Authentication system
- [ ] Basic user management
- [ ] Photo upload functionality

### Phase 2: Core Features (Weeks 5-8)
- [ ] Matching algorithm implementation
- [ ] Swipe functionality
- [ ] Basic chat system
- [ ] Push notifications
- [ ] Location services

### Phase 3: Enhanced Features (Weeks 9-12)
- [ ] Real-time messaging
- [ ] Advanced matching preferences
- [ ] Profile verification
- [ ] Analytics implementation
- [ ] Content moderation

### Phase 4: Polish & Launch (Weeks 13-16)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Load testing
- [ ] App store preparation
- [ ] Production deployment

## Cost Estimation

### Monthly Costs (5K Users)

#### AWS Infrastructure
- **ECS (API)**: $50-100/month
- **RDS (PostgreSQL)**: $80-120/month
- **ElastiCache (Redis)**: $20-40/month
- **S3 Storage**: $10-30/month
- **CloudFront CDN**: $5-15/month
- **API Gateway**: $10-20/month

#### Third-party Services
- **Firebase (Push Notifications)**: $0-25/month
- **Monitoring (New Relic)**: $50-100/month
- **Email Service (SendGrid)**: $10-30/month

**Total Estimated Cost**: $235-480/month

### Scaling Costs (10K Users)
- **Infrastructure**: $400-800/month
- **Third-party Services**: $100-200/month
- **Total**: $500-1000/month

## Risk Assessment

### Technical Risks
1. **Scalability Bottlenecks**
   - Mitigation: Load testing, performance monitoring
   
2. **Real-time Performance**
   - Mitigation: WebSocket optimization, message queuing

3. **Data Privacy Compliance**
   - Mitigation: Legal review, GDPR implementation

### Business Risks
1. **User Acquisition Cost**
   - Mitigation: Organic growth features, referral system

2. **Competition**
   - Mitigation: Unique features, superior UX

3. **Content Moderation**
   - Mitigation: Automated + manual review system

## Recommended Implementation Approach

### 1. Start with MVP Backend
- Focus on core features: auth, profiles, basic matching
- Use managed services (RDS, ElastiCache) for reliability
- Implement basic real-time chat

### 2. Technology Stack Priority
1. **Node.js + Express** for API
2. **PostgreSQL** for primary database
3. **Redis** for caching and sessions
4. **AWS** for infrastructure
5. **Socket.io** for real-time features

### 3. Development Strategy
- Build microservices gradually
- Start with monolith, extract services as needed
- Implement comprehensive testing
- Focus on security from day one

### 4. Launch Strategy
- Beta test with 100-500 users
- Gather feedback and iterate
- Gradual rollout to full user base
- Monitor performance and scale accordingly

This architecture provides a solid foundation for 5-10K users with clear scaling paths for future growth. The technology choices balance development speed, operational simplicity, and cost-effectiveness while maintaining the flexibility to evolve with your user base. 