import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'gardener';
  timestamp: Date;
}

interface QuizResponse {
  questionId: string;
  question: string;
  answer: string;
  category: string;
  timestamp: Date;
}

interface GardenerStore {
  // Chat state
  chatHistory: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatHistory: () => void;

  // Quiz state
  lastQuizShown: Date | null;
  quizResponses: QuizResponse[];
  shouldShowDailyQuiz: () => boolean;
  markQuizShown: () => void;
  addQuizResponse: (response: Omit<QuizResponse, 'timestamp'>) => void;

  // API key management
  openAiApiKey: string | null;
  setOpenAiApiKey: (key: string) => void;

  // User insights from quizzes
  userInsights: {
    datingStyle?: string;
    communicationPreference?: string;
    relationshipGoals?: string;
    coreValues?: string[];
  };
  updateUserInsights: (insights: Partial<GardenerStore['userInsights']>) => void;
}

export const useGardenerStore = create<GardenerStore>()(
  persist(
    (set, get) => ({
      // Chat state
      chatHistory: [],
      addChatMessage: (message) =>
        set((state) => ({
          chatHistory: [
            ...state.chatHistory,
            {
              ...message,
              id: Date.now().toString(),
              timestamp: new Date(),
            },
          ].slice(-50), // Keep last 50 messages
        })),
      clearChatHistory: () => set({ chatHistory: [] }),

      // Quiz state
      lastQuizShown: null,
      quizResponses: [],
      shouldShowDailyQuiz: () => {
        const { lastQuizShown } = get();
        if (!lastQuizShown) return true;

        const now = new Date();
        const last = new Date(lastQuizShown);

        // Show if it's a new day
        return (
          now.getDate() !== last.getDate() ||
          now.getMonth() !== last.getMonth() ||
          now.getFullYear() !== last.getFullYear()
        );
      },
      markQuizShown: () => set({ lastQuizShown: new Date() }),
      addQuizResponse: (response) =>
        set((state) => {
          const newResponse = {
            ...response,
            timestamp: new Date(),
          };

          // Update user insights based on category
          const insights = { ...state.userInsights };

          switch (response.category) {
            case 'dating_style':
              insights.datingStyle = response.answer;
              break;
            case 'communication':
              insights.communicationPreference = response.answer;
              break;
            case 'relationship_goals':
              insights.relationshipGoals = response.answer;
              break;
            case 'values':
              if (!insights.coreValues) insights.coreValues = [];
              if (!insights.coreValues.includes(response.answer)) {
                insights.coreValues.push(response.answer);
              }
              break;
          }

          return {
            quizResponses: [...state.quizResponses, newResponse].slice(-30), // Keep last 30 responses
            userInsights: insights,
          };
        }),

      // API key management
      openAiApiKey: null,
      setOpenAiApiKey: (key) => {
        set({ openAiApiKey: key });
        // Update the gardener service with the new key
        import('../lib/ai/gardenerService').then(({ gardenerService }) => {
          gardenerService.updateApiKey(key);
        });
      },

      // User insights
      userInsights: {},
      updateUserInsights: (insights) =>
        set((state) => ({
          userInsights: { ...state.userInsights, ...insights },
        })),
    }),
    {
      name: 'gardener-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        chatHistory: state.chatHistory.slice(-20), // Only persist last 20 messages
        lastQuizShown: state.lastQuizShown,
        quizResponses: state.quizResponses.slice(-10), // Only persist last 10 responses
        openAiApiKey: state.openAiApiKey,
        userInsights: state.userInsights,
      }),
    }
  )
);
