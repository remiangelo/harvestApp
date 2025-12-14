// AI Safety Configuration
// To enable AI features, add your OpenAI API key to .env file:
// EXPO_PUBLIC_OPENAI_API_KEY=your-api-key-here

export const SAFETY_CONFIG = {
  // OpenAI Configuration
  openai: {
    apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
    model: 'gpt-4-turbo-preview',
    temperature: 0.3, // Lower for consistent safety detection
    maxTokens: 500,
  },

  // Safety Score Thresholds
  thresholds: {
    immediateBlock: 20, // Block contact sharing below this score
    warning: 50, // Show strong warning
    caution: 70, // Show caution message
    safe: 80, // Safe to proceed
  },

  // Time Requirements
  minimums: {
    hoursBeforeSharing: 24, // Min chat duration before sharing contact
    messagesBeforeSharing: 20, // Min messages exchanged
    daysBeforeOffApp: 3, // Min days before moving off app
  },

  // Red Flag Categories
  redFlagCategories: {
    FINANCIAL: { severity: 'critical', weight: 30 },
    PERSONAL_INFO: { severity: 'critical', weight: 30 },
    CATFISHING: { severity: 'high', weight: 25 },
    MANIPULATION: { severity: 'high', weight: 20 },
    HARASSMENT: { severity: 'high', weight: 20 },
    INAPPROPRIATE: { severity: 'medium', weight: 15 },
    SPAM: { severity: 'low', weight: 10 },
  },

  // Red Flag Keywords (for immediate detection)
  redFlagKeywords: {
    financial: [
      'send money',
      'wire transfer',
      'bitcoin',
      'crypto',
      'investment',
      'bank account',
      'credit card',
      'financial help',
      'emergency funds',
      'western union',
      'gift card',
      'cashapp',
      'venmo',
      'zelle',
    ],
    personalInfo: [
      'social security',
      'ssn',
      'password',
      'pin code',
      'security question',
      'mother maiden name',
      'bank details',
      'routing number',
      'account number',
    ],
    catfishing: [
      'cant video call',
      'camera broken',
      'traveling abroad',
      'military deployment',
      'oil rig',
      'surgeon overseas',
      'UN mission',
      'peacekeeping',
    ],
    urgency: [
      'urgent',
      'emergency',
      'hurry',
      'right now',
      'immediately',
      'dont have time',
      'last chance',
      'limited time',
    ],
  },

  // Feature Flags
  features: {
    aiMonitoring: true, // Enable AI message analysis
    autoWarnings: true, // Show automatic warnings
    contentBlurring: true, // Blur inappropriate content
    videoVerification: false, // Require video before sharing (Phase 2)
    communityReporting: false, // Community safety network (Phase 3)
  },

  // System Prompts
  prompts: {
    safetyAnalysis: `You are a safety AI for the Harvest dating app. Analyze conversations for red flags and user safety.

Your role is to:
1. Detect financial scams, requests for money, or investment schemes
2. Identify attempts to harvest personal information
3. Spot catfishing indicators and inconsistent stories
4. Recognize manipulative or controlling behavior
5. Flag inappropriate content or harassment
6. Identify pressure tactics or boundary violations

Context will include:
- User profiles
- Conversation duration and message count
- Recent messages

Return a JSON response with:
{
  "safetyScore": 0-100,
  "redFlags": [
    {
      "type": "FINANCIAL|PERSONAL_INFO|CATFISHING|MANIPULATION|HARASSMENT|INAPPROPRIATE|SPAM",
      "severity": "critical|high|medium|low",
      "message": "Brief description of the concern",
      "evidence": "Quote from conversation if applicable"
    }
  ],
  "recommendations": ["Actionable safety advice"],
  "allowContactSharing": true|false,
  "requiresHumanReview": true|false
}

Be protective but not overly cautious. Focus on genuine safety concerns.`,

    readyToMove: `Analyze if this conversation is safe to move off the Harvest app.

Consider:
1. Conversation duration and depth
2. Consistency in stories and information
3. Respect for boundaries
4. Any red flags or concerning behavior
5. Whether video verification has occurred

Return JSON with specific safety recommendations for moving the conversation off-app.`,
  },
};

// Helper function to check if AI is configured
export const isAIConfigured = (): boolean => {
  return !!SAFETY_CONFIG.openai.apiKey && SAFETY_CONFIG.openai.apiKey !== '';
};

// Helper to get safety level from score
export const getSafetyLevel = (score: number): 'safe' | 'caution' | 'warning' | 'danger' => {
  if (score >= SAFETY_CONFIG.thresholds.safe) return 'safe';
  if (score >= SAFETY_CONFIG.thresholds.caution) return 'caution';
  if (score >= SAFETY_CONFIG.thresholds.warning) return 'warning';
  return 'danger';
};

// Helper to get safety color
export const getSafetyColor = (score: number): string => {
  const level = getSafetyLevel(score);
  switch (level) {
    case 'safe':
      return '#4CAF50';
    case 'caution':
      return '#FFC107';
    case 'warning':
      return '#FF9800';
    case 'danger':
      return '#F44336';
  }
};
