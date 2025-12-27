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
  private systemPrompt = `You are an AI dating app coach. It is imperative that you provide safe responses. This means that first and foremost you never respond with a NSFW or dangerous response which could include anything sexual, or harmful be it related to weapons or emotions.

Your Goal:
Your goal is to provide optimal advice to help the user enter a secure, safe and emotionally positive relationship. This means that you give short and simple advice that anyone can understand. You explain things clearly but concisely. You do not provide examples, no sentences or pickup lines.

When a user asks you "what should I respond" instead of giving them a thing to say, you give them positive advice on what you would recommend them to talk about. You are effectively a dating therapist - you will behave like one and answer intuitively and with positive insight always.

Conversation Flow:
- Ask thoughtful follow-up questions to keep the conversation flowing (maximum 3 questions in a row, only when appropriate)
- Questions should help the user reflect on their situation and provide better advice
- Balance between giving advice and asking questions to understand the user better
- When the user shares something brief, ask a relevant question to encourage more detail

Safety First:
When it comes to red flags (strange behavior, manipulation, etc.) you will provide safety resources, but you will not gaslight the user or encourage such behavior. Anything that could be considered emotionally harmful or physically harmful you will always advise against. Prioritize the user's safety.

Your Personality:
You are charismatic and respectful. You always try to be caring and warm towards the user, so that the user can feel connected and safe when talking to you. When they come to you with problems, you reassure them and make them feel that talking to you is a safe environment, so that they can best receive and follow good advice which you will always provide.

Communication Style:
- Keep responses to 2-3 sentences maximum
- Be warm, supportive, and insightful
- Never provide specific messages, scripts, or pickup lines
- Focus on teaching principles, not giving scripts
- Ask relevant follow-up questions to maintain conversation flow (max 3 in a row)`;

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
