/**
 * Mindful Messaging Service
 * Analyzes messages for potentially harmful or emotionally charged content
 * Provides growth lessons to encourage healthier communication
 */

interface SentimentAnalysisResult {
  needsReview: boolean;
  severity: 'low' | 'medium' | 'high';
  reason: string;
  growthLesson: string;
  flaggedWords?: string[];
}

/**
 * Problematic keywords and emotional cues to detect
 */
const FLAGGED_KEYWORDS = {
  aggressive: [
    'hate',
    'stupid',
    'idiot',
    'dumb',
    'pathetic',
    'loser',
    'worthless',
    'disgusting',
    'ugly',
  ],
  possessive: ['you belong', "you're mine", 'no one else', "can't talk to", 'not allowed to'],
  pressuring: ['you have to', 'you must', 'you better', 'or else', "don't make me", 'you owe'],
  manipulative: ['if you loved me', 'prove it', 'you never', 'you always', 'everyone else'],
  sexual_pressure: ['send pics', 'show me', 'prove yourself', 'blue balls', 'tease'],
  excessive_intensity: [
    'obsessed',
    "can't live without",
    'die without you',
    'my everything',
    'only you',
  ],
};

const GROWTH_LESSONS = {
  aggressive: {
    title: 'Mindful Communication',
    message: `Words have power. When we express frustration or anger, it's important to focus on our feelings rather than attacking the other person. Try: "I feel hurt when..." instead of name-calling.`,
  },
  possessive: {
    title: 'Respecting Autonomy',
    message: `Healthy relationships are built on mutual respect and freedom. Everyone deserves independence and personal boundaries. Try expressing your feelings without controlling language.`,
  },
  pressuring: {
    title: 'Consent & Choice',
    message: `Pressure removes choice. In healthy connections, both people feel free to make their own decisions. Try: "I'd love if you could..." instead of "You have to..."`,
  },
  manipulative: {
    title: 'Authentic Expression',
    message: `Manipulation creates distance. Share your genuine feelings without guilt-tripping. Try: "I feel..." statements instead of "If you really..." comparisons.`,
  },
  sexual_pressure: {
    title: 'Respecting Boundaries',
    message: `Intimacy should never feel pressured. Moving at a pace that feels comfortable for both people builds trust and connection. Express interest without pressure.`,
  },
  excessive_intensity: {
    title: 'Balanced Connection',
    message: `While strong feelings are natural, placing someone as "your everything" can be overwhelming. Healthy relationships include individual identity alongside connection.`,
  },
  general: {
    title: 'Pause & Reflect',
    message: `Taking a moment to consider how our words might land can deepen understanding. How might the other person receive this message?`,
  },
};

/**
 * Analyze message using keyword detection (fallback method)
 */
function analyzeWithKeywords(message: string): SentimentAnalysisResult {
  const lowerMessage = message.toLowerCase();
  const flaggedWords: string[] = [];
  let category: keyof typeof GROWTH_LESSONS | null = null;
  let severity: 'low' | 'medium' | 'high' = 'low';

  // Check each category
  for (const [cat, keywords] of Object.entries(FLAGGED_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        flaggedWords.push(keyword);
        category = cat as keyof typeof GROWTH_LESSONS;

        // Determine severity
        if (cat === 'aggressive' || cat === 'sexual_pressure') {
          severity = 'high';
        } else if (cat === 'possessive' || cat === 'pressuring') {
          severity = 'medium';
        } else {
          severity = 'low';
        }
        break;
      }
    }
    if (category) break;
  }

  // Check for excessive capitalization (SHOUTING)
  const capsRatio = (message.match(/[A-Z]/g) || []).length / message.length;
  if (capsRatio > 0.5 && message.length > 10) {
    flaggedWords.push('EXCESSIVE CAPS');
    category = 'aggressive';
    severity = 'medium';
  }

  // Check for excessive punctuation
  if (message.match(/!{3,}/) || message.match(/\?{3,}/)) {
    flaggedWords.push('excessive punctuation');
    if (!category) {
      category = 'general';
      severity = 'low';
    }
  }

  if (!category) {
    return {
      needsReview: false,
      severity: 'low',
      reason: '',
      growthLesson: '',
    };
  }

  const lesson = GROWTH_LESSONS[category] || GROWTH_LESSONS.general;

  return {
    needsReview: true,
    severity,
    reason: `This message contains language that might be ${category === 'aggressive' ? 'hurtful' : category === 'possessive' ? 'controlling' : category === 'pressuring' ? 'pressuring' : 'concerning'}`,
    growthLesson: `${lesson.title}\n\n${lesson.message}`,
    flaggedWords,
  };
}

/**
 * Analyze message using OpenAI GPT-4 (premium method)
 */
async function analyzeWithOpenAI(message: string): Promise<SentimentAnalysisResult> {
  try {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
      console.log('[MindfulMessaging] No OpenAI API key, falling back to keywords');
      return analyzeWithKeywords(message);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a dating app safety AI. Analyze messages for potentially harmful content including:
- Aggressive or abusive language
- Possessive or controlling language
- Pressuring or manipulative language
- Sexual pressure
- Excessive intensity or codependency
- Disrespectful communication

Respond with JSON:
{
  "needsReview": boolean,
  "severity": "low" | "medium" | "high",
  "reason": "brief explanation",
  "category": "aggressive" | "possessive" | "pressuring" | "manipulative" | "sexual_pressure" | "excessive_intensity" | "general",
  "growthLesson": "helpful guidance for better communication"
}`,
          },
          {
            role: 'user',
            content: `Analyze this message: "${message}"`,
          },
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      console.error('[MindfulMessaging] OpenAI API error:', response.status);
      return analyzeWithKeywords(message);
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    // Use predefined growth lessons if available
    const category = analysis.category as keyof typeof GROWTH_LESSONS;
    const lesson = GROWTH_LESSONS[category] || GROWTH_LESSONS.general;

    return {
      needsReview: analysis.needsReview,
      severity: analysis.severity,
      reason: analysis.reason,
      growthLesson: `${lesson.title}\n\n${lesson.message}`,
    };
  } catch (error) {
    console.error('[MindfulMessaging] OpenAI analysis error:', error);
    return analyzeWithKeywords(message);
  }
}

/**
 * Main function to analyze a message for mindful messaging
 * Uses OpenAI if API key available, otherwise falls back to keyword detection
 */
export async function analyzeMessage(message: string): Promise<SentimentAnalysisResult> {
  console.log('[MindfulMessaging] Analyzing message...');

  // Try OpenAI first (will fall back to keywords if no API key)
  const result = await analyzeWithOpenAI(message);

  console.log(
    `[MindfulMessaging] Analysis complete - needsReview: ${result.needsReview}, severity: ${result.severity}`
  );

  return result;
}

/**
 * Check if user has mindful messaging enabled
 * Reads from AsyncStorage
 */
export async function isMindfulMessagingEnabled(): Promise<boolean> {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const value = await AsyncStorage.getItem('mindful_messaging_enabled');

    // Default to enabled if not set
    if (value === null) {
      return true;
    }

    return value === 'true';
  } catch (error) {
    console.error('[MindfulMessaging] Error checking setting:', error);
    // Default to enabled on error
    return true;
  }
}

/**
 * Set mindful messaging preference
 */
export async function setMindfulMessagingEnabled(enabled: boolean): Promise<void> {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.setItem('mindful_messaging_enabled', enabled ? 'true' : 'false');
    console.log(`[MindfulMessaging] Setting updated: ${enabled}`);
  } catch (error) {
    console.error('[MindfulMessaging] Error saving setting:', error);
  }
}
