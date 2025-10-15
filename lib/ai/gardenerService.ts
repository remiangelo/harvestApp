import OpenAI from 'openai';

interface GardenerConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    value: string;
  }[];
  category: 'dating_style' | 'values' | 'communication' | 'relationship_goals' | 'personality';
  createdAt: Date;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

class GardenerService {
  private openai: OpenAI | null = null;
  private systemPrompt = `You are The Gardener, a wise and empathetic dating coach in the Harvest dating app focused on mindful dating and real connections.

Your coaching philosophy:
- Teach principles of empathy, communication, and emotional intelligence
- Guide users to find their own authentic voice (NEVER suggest specific messages to send)
- Help users develop self-regulation and self-awareness
- Focus on understanding underlying emotions and motivations
- Encourage genuine connection over performance or strategy

Communication style:
- Keep responses to 2-3 sentences maximum
- Be warm, supportive, and insightful
- Ask reflective questions to help users discover their own answers
- Focus on "why" and "how to think about it" rather than "what to do"

Remember: You're teaching users to be better daters by developing their emotional intelligence, not giving them scripts.`;

  private quizSystemPrompt = `You create thoughtful daily quiz questions to help users understand their dating preferences and values.
Generate questions that:
- Explore dating styles, values, communication preferences, and relationship goals
- Are introspective but not too personal or invasive
- Have 4 distinct options that represent different valid perspectives
- Help users gain self-awareness about their dating approach

Format: Return a JSON object with 'question' and 'options' array (each with 'text' and 'value' fields).`;

  constructor(config?: GardenerConfig) {
    if (config?.apiKey) {
      this.openai = new OpenAI({
        apiKey: config.apiKey,
        dangerouslyAllowBrowser: true, // For mobile/browser environments
      });
    }
  }

  async getChatResponse(
    userMessage: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    // If no API key, return a helpful fallback response
    if (!this.openai) {
      return this.getFallbackResponse(userMessage);
    }

    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: this.systemPrompt },
        ...conversationHistory.slice(-10), // Keep last 10 messages for context
        { role: 'user', content: userMessage },
      ];

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 200, // Reduced for more concise responses
      });

      return response.choices[0]?.message?.content || this.getFallbackResponse(userMessage);
    } catch (error) {
      console.error('Error getting AI response:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  async generateDailyQuiz(previousQuizzes: string[] = []): Promise<QuizQuestion> {
    if (!this.openai) {
      return this.getFallbackQuiz();
    }

    try {
      const prompt = `Generate a daily dating quiz question. 
Previous topics covered: ${previousQuizzes.slice(-7).join(', ') || 'None yet'}.
Create a fresh question exploring a different aspect of dating preferences or values.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: this.quizSystemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        return {
          id: Date.now().toString(),
          question: parsed.question,
          options: parsed.options.map((opt: any, index: number) => ({
            id: `option_${index}`,
            text: opt.text,
            value: opt.value || opt.text,
          })),
          category: this.categorizeQuestion(parsed.question),
          createdAt: new Date(),
        };
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
    }

    return this.getFallbackQuiz();
  }

  private categorizeQuestion(question: string): QuizQuestion['category'] {
    const lowerQuestion = question.toLowerCase();
    if (lowerQuestion.includes('style') || lowerQuestion.includes('approach')) {
      return 'dating_style';
    }
    if (lowerQuestion.includes('value') || lowerQuestion.includes('important')) {
      return 'values';
    }
    if (
      lowerQuestion.includes('communication') ||
      lowerQuestion.includes('talk') ||
      lowerQuestion.includes('express')
    ) {
      return 'communication';
    }
    if (
      lowerQuestion.includes('goal') ||
      lowerQuestion.includes('looking for') ||
      lowerQuestion.includes('relationship')
    ) {
      return 'relationship_goals';
    }
    return 'personality';
  }

  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('nervous') || lowerMessage.includes('anxiety')) {
      return 'Nervousness often signals you care about connection. What if, instead of trying to eliminate it, you let it remind you to stay present and curious about the other person?';
    }

    if (lowerMessage.includes('profile') || lowerMessage.includes('bio')) {
      return 'Your profile works best when it reflects what genuinely excites you, not what you think others want to see. What part of yourself do you most want someone to understand?';
    }

    if (lowerMessage.includes('first date') || lowerMessage.includes('meet')) {
      return 'First dates thrive on genuine curiosity rather than performance. What would help you feel more present and less focused on outcome?';
    }

    if (lowerMessage.includes('ghosted') || lowerMessage.includes('rejected')) {
      return 'That disappointment is real, but notice: their choice freed you to find better alignment. What did this experience teach you about what you truly need?';
    }

    if (lowerMessage.includes('what to say') || lowerMessage.includes('message')) {
      return "I don't give scripts because authentic connection requires your voice, not mine. What feels true to who you are in this moment?";
    }

    return "Tell me more about what you're experiencing. What feels challenging for you right now in your dating journey?";
  }

  private getFallbackQuiz(): QuizQuestion {
    const fallbackQuizzes = [
      {
        question: "What's most important to you in early dating?",
        options: [
          { text: 'Deep emotional connection', value: 'emotional' },
          { text: 'Shared activities and fun', value: 'activities' },
          { text: 'Intellectual stimulation', value: 'intellectual' },
          { text: 'Physical chemistry', value: 'physical' },
        ],
        category: 'dating_style' as const,
      },
      {
        question: 'How do you prefer to handle conflict in relationships?',
        options: [
          { text: 'Address it immediately and directly', value: 'direct' },
          { text: 'Take time to process before discussing', value: 'process' },
          { text: 'Find compromise through calm discussion', value: 'compromise' },
          { text: 'Focus on understanding their perspective first', value: 'empathy' },
        ],
        category: 'communication' as const,
      },
      {
        question: "What's your ideal pace for a new relationship?",
        options: [
          { text: 'Slow and steady, building trust over time', value: 'slow' },
          { text: 'Follow the natural chemistry wherever it leads', value: 'natural' },
          { text: 'Intentional progression with clear milestones', value: 'intentional' },
          { text: 'Fast and passionate when it feels right', value: 'fast' },
        ],
        category: 'dating_style' as const,
      },
      {
        question: 'What quality do you value most in a partner?',
        options: [
          { text: 'Emotional intelligence and empathy', value: 'empathy' },
          { text: 'Ambition and drive', value: 'ambition' },
          { text: 'Humor and playfulness', value: 'humor' },
          { text: 'Loyalty and reliability', value: 'loyalty' },
        ],
        category: 'values' as const,
      },
    ];

    const quiz = fallbackQuizzes[Math.floor(Math.random() * fallbackQuizzes.length)];

    return {
      id: Date.now().toString(),
      question: quiz.question,
      options: quiz.options.map((opt, index) => ({
        id: `option_${index}`,
        text: opt.text,
        value: opt.value,
      })),
      category: quiz.category,
      createdAt: new Date(),
    };
  }

  updateApiKey(apiKey: string) {
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      });
    }
  }
}

// Initialize with API key from environment
const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

export const gardenerService = new GardenerService({ apiKey });
export type { QuizQuestion, ChatMessage };
