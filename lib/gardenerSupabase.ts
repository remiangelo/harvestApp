import { supabase } from './supabase';

// Types for database tables
interface ChatMessage {
  id?: string;
  user_id: string;
  message: string;
  sender: 'user' | 'gardener';
  created_at?: string;
}

interface QuizQuestion {
  id?: string;
  question: string;
  options: any; // JSONB field
  category: string;
  created_at?: string;
}

interface QuizResponse {
  id?: string;
  user_id: string;
  question_id: string;
  selected_option_id: string;
  selected_value: string;
  answered_at?: string;
}

interface UserInsights {
  id?: string;
  user_id: string;
  dating_style?: string;
  communication_preference?: string;
  relationship_goals?: string;
  core_values?: string[];
  personality_traits?: any; // JSONB field
  last_updated?: string;
}

interface DailyQuizTracking {
  id?: string;
  user_id: string;
  quiz_date: string;
  question_id?: string;
  shown_at?: string;
  answered?: boolean;
}

// Chat History Functions
export const gardenerChatService = {
  // Save a chat message
  async saveMessage(
    userId: string,
    message: string,
    sender: 'user' | 'gardener'
  ): Promise<ChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from('gardener_chat_history')
        .insert({
          user_id: userId,
          message,
          sender,
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error saving chat message:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in saveMessage:', error);
      return null;
    }
  },

  // Get chat history for a user
  async getChatHistory(userId: string, limit = 50): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('gardener_chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching chat history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getChatHistory:', error);
      return [];
    }
  },

  // Clear chat history for a user
  async clearChatHistory(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('gardener_chat_history').delete().eq('user_id', userId);

      if (error) {
        console.error('Error clearing chat history:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in clearChatHistory:', error);
      return false;
    }
  },
};

// Quiz Functions
export const gardenerQuizService = {
  // Save or get a quiz question
  async saveOrGetQuestion(
    question: string,
    options: any,
    category: string
  ): Promise<QuizQuestion | null> {
    try {
      // First, try to get existing question
      const { data: existing, error: fetchError } = await supabase
        .from('gardener_quiz_questions')
        .select('*')
        .eq('question', question)
        .maybeSingle();

      if (existing && !fetchError) {
        return existing;
      }

      // If not exists, create new
      const { data, error } = await supabase
        .from('gardener_quiz_questions')
        .insert({
          question,
          options,
          category,
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error saving quiz question:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in saveOrGetQuestion:', error);
      return null;
    }
  },

  // Save quiz response
  async saveQuizResponse(
    userId: string,
    questionId: string,
    optionId: string,
    value: string
  ): Promise<QuizResponse | null> {
    try {
      const { data, error } = await supabase
        .from('gardener_quiz_responses')
        .upsert({
          user_id: userId,
          question_id: questionId,
          selected_option_id: optionId,
          selected_value: value,
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error saving quiz response:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in saveQuizResponse:', error);
      return null;
    }
  },

  // Get user's quiz history
  async getUserQuizHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_quiz_history', { p_user_id: userId });

      if (error) {
        console.error('Error fetching quiz history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserQuizHistory:', error);
      return [];
    }
  },

  // Track daily quiz
  async trackDailyQuiz(userId: string, questionId?: string): Promise<DailyQuizTracking | null> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('gardener_daily_quiz_tracking')
        .upsert({
          user_id: userId,
          quiz_date: today,
          question_id: questionId,
          shown_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error tracking daily quiz:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in trackDailyQuiz:', error);
      return null;
    }
  },

  // Check if quiz was shown today
  async wasQuizShownToday(userId: string): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('gardener_daily_quiz_tracking')
        .select('id')
        .eq('user_id', userId)
        .eq('quiz_date', today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found
        console.error('Error checking daily quiz:', error);
      }

      return !!data;
    } catch (error) {
      console.error('Error in wasQuizShownToday:', error);
      return false;
    }
  },

  // Mark quiz as answered
  async markQuizAnswered(userId: string): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from('gardener_daily_quiz_tracking')
        .update({ answered: true })
        .eq('user_id', userId)
        .eq('quiz_date', today);

      if (error) {
        console.error('Error marking quiz as answered:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markQuizAnswered:', error);
      return false;
    }
  },
};

// User Insights Functions
export const gardenerInsightsService = {
  // Get user insights
  async getUserInsights(userId: string): Promise<UserInsights | null> {
    try {
      const { data, error } = await supabase
        .from('gardener_user_insights')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user insights:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserInsights:', error);
      return null;
    }
  },

  // Update user insights
  async updateUserInsights(
    userId: string,
    insights: Partial<UserInsights>
  ): Promise<UserInsights | null> {
    try {
      const { data, error } = await supabase
        .from('gardener_user_insights')
        .upsert({
          user_id: userId,
          ...insights,
          last_updated: new Date().toISOString(),
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating user insights:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateUserInsights:', error);
      return null;
    }
  },

  // Add value to core values array
  async addCoreValue(userId: string, value: string): Promise<boolean> {
    try {
      // First get existing values
      const existing = await this.getUserInsights(userId);
      const currentValues = existing?.core_values || [];

      if (!currentValues.includes(value)) {
        currentValues.push(value);

        const result = await this.updateUserInsights(userId, {
          core_values: currentValues,
        });

        return !!result;
      }

      return true;
    } catch (error) {
      console.error('Error in addCoreValue:', error);
      return false;
    }
  },
};
