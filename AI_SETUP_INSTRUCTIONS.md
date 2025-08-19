# AI Safety System Setup Instructions

## Quick Start - You Only Need an API Key!

The AI safety system for Harvest is fully implemented and ready to use. All you need to do is add your OpenAI API key.

## Step 1: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (it starts with `sk-`)

## Step 2: Add API Key to Your Environment

Add this to your `.env` file in the project root:

```bash
EXPO_PUBLIC_OPENAI_API_KEY=your-api-key-here
```

Replace `your-api-key-here` with your actual OpenAI API key.

## Step 3: Run Database Migration

Execute this SQL in your Supabase dashboard:

```sql
-- Run the safety tables migration
-- File: supabase/migrations/007_safety_tables.sql
```

This creates all necessary tables for:

- Safety analyses
- Red flag reports
- User safety settings
- Ready-to-move tracking

## That's It! 🎉

The AI safety system will now:

- ✅ Analyze messages in real-time for red flags
- ✅ Detect financial scams, catfishing, and manipulation
- ✅ Show safety warnings when concerns are detected
- ✅ Gate the "ready to move off app" feature with safety checks
- ✅ Provide a safety dashboard for users
- ✅ Allow users to customize their safety settings

## What's Included

### 1. **Configuration** (`lib/ai/safetyConfig.ts`)

- Pre-configured OpenAI settings
- Red flag detection thresholds
- Keyword detection for immediate alerts
- Safety scoring system

### 2. **OpenAI Service** (`lib/ai/openaiService.ts`)

- Message analysis with GPT-4
- Conversation safety scoring
- Red flag detection across multiple categories
- Ready-to-move safety checks

### 3. **Safety Analysis Service** (`lib/ai/safetyAnalysisService.ts`)

- Real-time message monitoring
- Database integration for persistence
- User safety settings management
- Safety dashboard data aggregation

### 4. **UI Components**

- **ReadyToMoveGate**: Modal that appears when users want to share contact info
- **SafetyWarning**: Alert dialog for detected red flags
- **SafetyDashboard**: Comprehensive safety overview for users

### 5. **API Endpoints** (Ready for backend integration)

- `/api/safety/analyze-message` - Real-time message analysis
- `/api/safety/ready-to-move-check` - Pre-contact sharing safety check
- `/api/safety/report` - User reporting system
- `/api/safety/dashboard` - Safety metrics dashboard

## Features That Work Immediately

### Without API Key (Keyword Detection Only)

- Basic red flag detection using keywords
- Safety recommendations
- UI components and flow

### With API Key (Full AI Features)

- Advanced GPT-4 analysis
- Context-aware red flag detection
- Personalized safety recommendations
- Behavioral pattern analysis
- Manipulation and gaslighting detection

## Testing the System

1. **Test Keyword Detection** (Works without API key):
   - Send a message containing "send money" or "bitcoin"
   - System will flag it as a financial scam

2. **Test AI Analysis** (Requires API key):
   - Have a conversation in the chat
   - Toggle "Ready to move off app"
   - See comprehensive safety analysis

## Customization Options

All settings are in `lib/ai/safetyConfig.ts`:

```typescript
// Adjust thresholds
thresholds: {
  immediateBlock: 20,  // Block contact sharing below this
  warning: 50,         // Show warning
  caution: 70,         // Show caution
  safe: 80,           // Safe to proceed
}

// Adjust time requirements
minimums: {
  hoursBeforeSharing: 24,      // Min chat duration
  messagesBeforeSharing: 20,   // Min messages
  daysBeforeOffApp: 3,         // Min days
}

// Toggle features
features: {
  aiMonitoring: true,           // Enable/disable AI
  autoWarnings: true,           // Auto show warnings
  contentBlurring: true,        // Blur inappropriate content
  videoVerification: false,     // Require video (Phase 2)
}
```

## Cost Estimates

With GPT-4 Turbo:

- ~$0.01 per 1000 tokens
- Average message analysis: ~500 tokens
- Cost per analysis: ~$0.005
- For 10,000 users with 100 messages/day each: ~$50/day

## Security Notes

- API key is only used client-side in development
- For production, move OpenAI calls to backend
- Messages are not stored by OpenAI
- Analysis results are encrypted in database

## Troubleshooting

### "AI features disabled" message

- Check that `.env` file exists
- Verify API key is correctly formatted
- Restart Expo after adding environment variable

### Safety warnings not appearing

- Check user safety settings in database
- Verify `ai_monitoring_enabled` is true
- Check console for API errors

### Database errors

- Run migration script in Supabase
- Check RLS policies are enabled
- Verify user authentication

## Next Steps (Optional Enhancements)

1. **Move to Backend** (Recommended for production)
   - Create Edge Functions in Supabase
   - Move API key to server environment
   - Add rate limiting

2. **Add Video Verification**
   - Integrate video call SDK
   - Add verification badges
   - Update safety scoring

3. **Community Reporting**
   - Add user reporting UI
   - Create moderation dashboard
   - Implement ban system

4. **Advanced ML**
   - Train custom model on reported conversations
   - Add image analysis for profile photos
   - Implement behavioral pattern detection

## Support

If you encounter any issues:

1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure database migrations have run
4. Test with sample messages first

The system is designed to fail gracefully - if AI is unavailable, keyword detection still works to maintain basic safety.
