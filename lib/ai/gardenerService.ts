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
  private systemPrompt = `You are The Gardener, a wise and empathetic dating coach in the Harvest dating app. 
Your role is to help users cultivate meaningful connections and grow in their dating journey. 
You provide:
- Personalized dating advice based on their experiences
- Tips for creating authentic connections
- Guidance on communication and relationship skills
- Support for dating challenges and self-improvement
- Encouragement that aligns with "Mindful Dating, Real Connections" philosophy

Keep responses warm, supportive, and actionable. Limit responses to 2-3 paragraphs unless more detail is specifically requested.`;

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
        max_tokens: 500,
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
      return "It's completely natural to feel nervous about dating! Remember, the other person is likely feeling the same way. Focus on being authentically yourself rather than trying to be perfect. Take deep breaths, prepare a few conversation topics you're genuinely interested in, and remember that each date is simply an opportunity to meet someone new and learn about them. The right person will appreciate you for who you are.";
    }

    if (lowerMessage.includes('profile') || lowerMessage.includes('bio')) {
      return "A great profile shows your authentic self! Use recent photos that show you doing things you enjoy. In your bio, be specific about your interests rather than generic - instead of 'I like music,' try 'I'm learning guitar and love discovering indie bands at small venues.' Include what you're looking for and what makes you unique. Remember, you're not trying to appeal to everyone, just the right person for you.";
    }

    if (lowerMessage.includes('first date') || lowerMessage.includes('meet')) {
      return 'First dates are about connection, not perfection! Choose an activity that allows for conversation but takes pressure off - coffee, a walk in the park, or visiting a farmers market are great options. Ask open-ended questions and really listen to their answers. Share your genuine interests and experiences. Most importantly, stay present and enjoy getting to know someone new rather than worrying about the outcome.';
    }

    if (lowerMessage.includes('ghosted') || lowerMessage.includes('rejected')) {
      return "I understand how disappointing that feels. Remember that dating is a process of finding the right match, and when someone isn't interested, they're doing you a favor by freeing you to find someone who truly values you. Their behavior says more about them than about you. Take time to process your feelings, then refocus on your own growth and the connections that do align with your values.";
    }

    return "That's a great question about dating! While everyone's journey is unique, remember that authentic connections come from being genuinely yourself. Focus on clear communication, shared values, and mutual respect. Take things at a pace that feels comfortable for you, and trust your instincts. Is there a specific aspect of dating you'd like to explore further?";
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

export const gardenerService = new GardenerService();
export type { QuizQuestion, ChatMessage };
