import OpenAI from 'openai';
import { SAFETY_CONFIG, isAIConfigured } from './safetyConfig';

// Types
export interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
}

export interface SafetyAnalysisResult {
  safetyScore: number;
  redFlags: RedFlag[];
  recommendations: string[];
  allowContactSharing: boolean;
  requiresHumanReview: boolean;
}

export interface RedFlag {
  type:
    | 'FINANCIAL'
    | 'PERSONAL_INFO'
    | 'CATFISHING'
    | 'MANIPULATION'
    | 'HARASSMENT'
    | 'INAPPROPRIATE'
    | 'SPAM';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  evidence?: string;
}

export interface ConversationContext {
  conversationId: string;
  userId: string;
  matchId: string;
  userProfile: any;
  matchProfile: any;
  conversationDuration: number; // hours
  messageCount: number;
  messages: Message[];
}

// OpenAI Client (initialized only when API key is provided)
let openaiClient: OpenAI | null = null;

export const initializeOpenAI = (): OpenAI | null => {
  if (!isAIConfigured()) {
    // AI features will use fallback responses
    return null;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: SAFETY_CONFIG.openai.apiKey,
      dangerouslyAllowBrowser: true, // For React Native
    });
  }

  return openaiClient;
};

// Analyze a single message for immediate red flags
export const analyzeMessage = async (
  message: string,
  context?: Partial<ConversationContext>
): Promise<SafetyAnalysisResult> => {
  // First, do quick keyword detection
  const quickFlags = detectRedFlagKeywords(message);

  // If no API key, return keyword-based analysis only
  if (!isAIConfigured()) {
    return {
      safetyScore: quickFlags.length > 0 ? 40 : 100,
      redFlags: quickFlags,
      recommendations:
        quickFlags.length > 0
          ? ['Be cautious with this conversation', 'Do not share personal information']
          : [],
      allowContactSharing: quickFlags.length === 0,
      requiresHumanReview: quickFlags.some((f) => f.severity === 'critical'),
    };
  }

  // If API key is configured, do full AI analysis
  const client = initializeOpenAI();
  if (!client) {
    return getKeywordBasedResult(quickFlags);
  }

  try {
    const systemPrompt = SAFETY_CONFIG.prompts.safetyAnalysis;
    const userPrompt = formatAnalysisPrompt(message, context);

    const completion = await client.chat.completions.create({
      model: SAFETY_CONFIG.openai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: SAFETY_CONFIG.openai.temperature,
      max_tokens: SAFETY_CONFIG.openai.maxTokens,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    // Merge AI results with keyword detection for comprehensive coverage
    return {
      ...result,
      redFlags: [...quickFlags, ...(result.redFlags || [])],
    };
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    // Fallback to keyword-based detection
    return getKeywordBasedResult(quickFlags);
  }
};

// Analyze full conversation for "ready to move off app" decision
export const analyzeReadyToMove = async (
  context: ConversationContext
): Promise<SafetyAnalysisResult & { canMoveOffApp: boolean; requiredActions: string[] }> => {
  // Check minimum requirements
  const meetsMinimums =
    context.conversationDuration >= SAFETY_CONFIG.minimums.hoursBeforeSharing &&
    context.messageCount >= SAFETY_CONFIG.minimums.messagesBeforeSharing;

  if (!meetsMinimums) {
    return {
      safetyScore: 50,
      redFlags: [],
      recommendations: [
        `Continue chatting for at least ${SAFETY_CONFIG.minimums.hoursBeforeSharing} hours`,
        `Exchange at least ${SAFETY_CONFIG.minimums.messagesBeforeSharing} messages before sharing contact info`,
      ],
      allowContactSharing: false,
      requiresHumanReview: false,
      canMoveOffApp: false,
      requiredActions: ['More conversation time needed', 'Build trust gradually'],
    };
  }

  // Analyze recent messages
  const recentMessages = context.messages.slice(-20); // Last 20 messages
  const messageAnalysis = await analyzeConversation(recentMessages, context);

  // Determine if safe to move off app
  const canMoveOffApp =
    messageAnalysis.safetyScore >= SAFETY_CONFIG.thresholds.safe &&
    messageAnalysis.redFlags.filter((f) => f.severity === 'critical').length === 0;

  const requiredActions: string[] = [];

  if (messageAnalysis.safetyScore < SAFETY_CONFIG.thresholds.safe) {
    requiredActions.push('Address safety concerns first');
  }

  if (!context.userProfile.videoVerified && SAFETY_CONFIG.features.videoVerification) {
    requiredActions.push('Complete video verification');
  }

  return {
    ...messageAnalysis,
    canMoveOffApp,
    requiredActions,
  };
};

// Analyze a full conversation
export const analyzeConversation = async (
  messages: Message[],
  context: Partial<ConversationContext>
): Promise<SafetyAnalysisResult> => {
  // Combine all messages for analysis
  const conversationText = messages
    .map((m) => `[${m.senderId === context.userId ? 'You' : 'Match'}]: ${m.content}`)
    .join('\n');

  return analyzeMessage(conversationText, context);
};

// Helper: Detect red flag keywords
const detectRedFlagKeywords = (text: string): RedFlag[] => {
  const redFlags: RedFlag[] = [];
  const lowerText = text.toLowerCase();

  // Check financial keywords
  for (const keyword of SAFETY_CONFIG.redFlagKeywords.financial) {
    if (lowerText.includes(keyword)) {
      redFlags.push({
        type: 'FINANCIAL',
        severity: 'critical',
        message: 'Potential financial scam detected',
        evidence: keyword,
      });
      break;
    }
  }

  // Check personal info keywords
  for (const keyword of SAFETY_CONFIG.redFlagKeywords.personalInfo) {
    if (lowerText.includes(keyword)) {
      redFlags.push({
        type: 'PERSONAL_INFO',
        severity: 'critical',
        message: 'Attempt to collect personal information',
        evidence: keyword,
      });
      break;
    }
  }

  // Check catfishing keywords
  for (const keyword of SAFETY_CONFIG.redFlagKeywords.catfishing) {
    if (lowerText.includes(keyword)) {
      redFlags.push({
        type: 'CATFISHING',
        severity: 'high',
        message: 'Potential catfishing indicator',
        evidence: keyword,
      });
      break;
    }
  }

  // Check urgency keywords
  const urgencyCount = SAFETY_CONFIG.redFlagKeywords.urgency.filter((keyword) =>
    lowerText.includes(keyword)
  ).length;

  if (urgencyCount >= 2) {
    redFlags.push({
      type: 'MANIPULATION',
      severity: 'medium',
      message: 'High-pressure tactics detected',
      evidence: 'Multiple urgency keywords',
    });
  }

  return redFlags;
};

// Helper: Format analysis prompt
const formatAnalysisPrompt = (message: string, context?: Partial<ConversationContext>): string => {
  let prompt = `Analyze this message for safety concerns:\n\n"${message}"`;

  if (context) {
    prompt += '\n\nContext:';
    if (context.conversationDuration) {
      prompt += `\n- Conversation duration: ${context.conversationDuration} hours`;
    }
    if (context.messageCount) {
      prompt += `\n- Messages exchanged: ${context.messageCount}`;
    }
    if (context.userProfile) {
      prompt += `\n- User: ${context.userProfile.name}, ${context.userProfile.age}`;
    }
    if (context.matchProfile) {
      prompt += `\n- Match: ${context.matchProfile.name}, ${context.matchProfile.age}`;
    }
  }

  return prompt;
};

// Helper: Get keyword-based result
const getKeywordBasedResult = (redFlags: RedFlag[]): SafetyAnalysisResult => {
  // Calculate safety score based on red flags
  let safetyScore = 100;

  for (const flag of redFlags) {
    const category = SAFETY_CONFIG.redFlagCategories[flag.type];
    if (category) {
      safetyScore -= category.weight;
    }
  }

  safetyScore = Math.max(0, safetyScore);

  return {
    safetyScore,
    redFlags,
    recommendations:
      redFlags.length > 0
        ? [
            'Be cautious with this conversation',
            'Do not share personal or financial information',
            'Consider reporting if behavior continues',
          ]
        : ['Continue building trust naturally'],
    allowContactSharing: safetyScore >= SAFETY_CONFIG.thresholds.caution,
    requiresHumanReview: redFlags.some((f) => f.severity === 'critical'),
  };
};
