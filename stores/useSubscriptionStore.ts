import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export type TierName = 'seed' | 'green' | 'gold';

export interface TierDetails {
  tier_name: TierName;
  tier_display_name: string;
  matches_per_week: number | null;
  max_distance_miles: number | null;
  gardener_conversations_per_day: number | null;
  has_values_matching: boolean;
  has_advanced_filters: boolean;
  has_full_filters: boolean;
  can_see_likes: boolean;
  can_disable_mindful_messaging: boolean;
}

export interface UsageStats {
  matches_count: number;
  gardener_conversations_today: number;
  week_start_date: string;
}

interface SubscriptionState {
  tier: TierName;
  tierDetails: TierDetails | null;
  usage: UsageStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSubscription: (userId: string) => Promise<void>;
  fetchUsage: (userId: string) => Promise<void>;

  // Usage tracking
  incrementMatchCount: (userId: string) => Promise<boolean>;
  incrementGardenerUsage: (userId: string) => Promise<boolean>;

  // Feature checks
  canMatch: () => boolean;
  canUseGardener: () => boolean;
  hasValuesMatching: () => boolean;
  hasAdvancedFilters: () => boolean;
  hasFullFilters: () => boolean;
  canSeeLikes: () => boolean;
  canDisableMindfulMessaging: () => boolean;
  getMaxDistance: () => number;

  // Tier info
  getTierDisplayName: () => string;
  isFreeTier: () => boolean;
  isPremiumTier: () => boolean;

  // Reset
  reset: () => void;
}

const DEFAULT_TIER_DETAILS: TierDetails = {
  tier_name: 'seed',
  tier_display_name: 'Seed',
  matches_per_week: 5,
  max_distance_miles: 100,
  gardener_conversations_per_day: 1,
  has_values_matching: false,
  has_advanced_filters: false,
  has_full_filters: false,
  can_see_likes: false,
  can_disable_mindful_messaging: false,
};

// Helper to get start of current week (Monday)
const getWeekStartDate = (): string => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
};

const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      tier: 'seed',
      tierDetails: DEFAULT_TIER_DETAILS,
      usage: null,
      isLoading: false,
      error: null,

      fetchSubscription: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.rpc('get_user_tier', { p_user_id: userId });

          if (error) throw error;

          if (data && data.length > 0) {
            const tierData = data[0] as TierDetails;
            set({
              tier: tierData.tier_name,
              tierDetails: tierData,
              isLoading: false,
            });
          } else {
            // Default to Seed tier
            set({
              tier: 'seed',
              tierDetails: DEFAULT_TIER_DETAILS,
              isLoading: false,
            });
          }
        } catch (error: any) {
          console.error('[SubscriptionStore] Error fetching subscription:', error);
          set({
            error: error.message,
            isLoading: false,
            tier: 'seed',
            tierDetails: DEFAULT_TIER_DETAILS,
          });
        }
      },

      fetchUsage: async (userId: string) => {
        try {
          const weekStart = getWeekStartDate();

          const { data, error } = await supabase
            .from('user_usage')
            .select('*')
            .eq('user_id', userId)
            .eq('week_start_date', weekStart)
            .single();

          if (error && error.code !== 'PGRST116') {
            throw error;
          }

          if (data) {
            // Check if gardener needs daily reset
            const today = new Date().toISOString().split('T')[0];
            if (data.gardener_last_reset_date !== today) {
              // Reset daily gardener count
              await supabase
                .from('user_usage')
                .update({
                  gardener_conversations_today: 0,
                  gardener_last_reset_date: today,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', data.id);

              set({
                usage: {
                  matches_count: data.matches_count,
                  gardener_conversations_today: 0,
                  week_start_date: weekStart,
                },
              });
            } else {
              set({
                usage: {
                  matches_count: data.matches_count,
                  gardener_conversations_today: data.gardener_conversations_today,
                  week_start_date: weekStart,
                },
              });
            }
          } else {
            // Create new usage record for this week
            const { data: newData, error: insertError } = await supabase
              .from('user_usage')
              .insert({
                user_id: userId,
                week_start_date: weekStart,
                matches_count: 0,
                gardener_conversations_today: 0,
                gardener_last_reset_date: new Date().toISOString().split('T')[0],
              })
              .select()
              .single();

            if (insertError) throw insertError;

            set({
              usage: {
                matches_count: 0,
                gardener_conversations_today: 0,
                week_start_date: weekStart,
              },
            });
          }
        } catch (error: any) {
          console.error('[SubscriptionStore] Error fetching usage:', error);
        }
      },

      incrementMatchCount: async (userId: string) => {
        const { tierDetails, usage } = get();

        // Check if user can match
        if (tierDetails?.matches_per_week !== null) {
          const currentCount = usage?.matches_count || 0;
          if (currentCount >= (tierDetails?.matches_per_week || 5)) {
            return false; // Limit reached
          }
        }

        try {
          const weekStart = getWeekStartDate();
          const newCount = (usage?.matches_count || 0) + 1;

          await supabase.from('user_usage').upsert(
            {
              user_id: userId,
              week_start_date: weekStart,
              matches_count: newCount,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'user_id,week_start_date',
            }
          );

          set({
            usage: {
              ...usage,
              matches_count: newCount,
              gardener_conversations_today: usage?.gardener_conversations_today || 0,
              week_start_date: weekStart,
            },
          });

          return true;
        } catch (error) {
          console.error('[SubscriptionStore] Error incrementing match count:', error);
          return false;
        }
      },

      incrementGardenerUsage: async (userId: string) => {
        const { tierDetails, usage } = get();

        // Check if user can use gardener
        if (tierDetails?.gardener_conversations_per_day !== null) {
          const currentCount = usage?.gardener_conversations_today || 0;
          if (currentCount >= (tierDetails?.gardener_conversations_per_day || 1)) {
            return false; // Limit reached
          }
        }

        try {
          const weekStart = getWeekStartDate();
          const newCount = (usage?.gardener_conversations_today || 0) + 1;

          await supabase.from('user_usage').upsert(
            {
              user_id: userId,
              week_start_date: weekStart,
              gardener_conversations_today: newCount,
              gardener_last_reset_date: new Date().toISOString().split('T')[0],
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'user_id,week_start_date',
            }
          );

          set({
            usage: {
              ...usage,
              matches_count: usage?.matches_count || 0,
              gardener_conversations_today: newCount,
              week_start_date: weekStart,
            },
          });

          return true;
        } catch (error) {
          console.error('[SubscriptionStore] Error incrementing gardener usage:', error);
          return false;
        }
      },

      canMatch: () => {
        const { tierDetails, usage } = get();
        if (tierDetails?.matches_per_week === null) return true; // Unlimited
        const currentCount = usage?.matches_count || 0;
        return currentCount < (tierDetails?.matches_per_week || 5);
      },

      canUseGardener: () => {
        const { tierDetails, usage } = get();
        if (tierDetails?.gardener_conversations_per_day === null) return true; // Unlimited
        const currentCount = usage?.gardener_conversations_today || 0;
        return currentCount < (tierDetails?.gardener_conversations_per_day || 1);
      },

      hasValuesMatching: () => {
        const { tierDetails } = get();
        return tierDetails?.has_values_matching || false;
      },

      hasAdvancedFilters: () => {
        const { tierDetails } = get();
        return tierDetails?.has_advanced_filters || false;
      },

      hasFullFilters: () => {
        const { tierDetails } = get();
        return tierDetails?.has_full_filters || false;
      },

      canSeeLikes: () => {
        const { tierDetails } = get();
        return tierDetails?.can_see_likes || false;
      },

      canDisableMindfulMessaging: () => {
        const { tierDetails } = get();
        return tierDetails?.can_disable_mindful_messaging || false;
      },

      getMaxDistance: () => {
        const { tierDetails } = get();
        return tierDetails?.max_distance_miles || 100;
      },

      getTierDisplayName: () => {
        const { tierDetails } = get();
        return tierDetails?.tier_display_name || 'Seed';
      },

      isFreeTier: () => {
        const { tier } = get();
        return tier === 'seed';
      },

      isPremiumTier: () => {
        const { tier } = get();
        return tier === 'gold';
      },

      reset: () => {
        set({
          tier: 'seed',
          tierDetails: DEFAULT_TIER_DETAILS,
          usage: null,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        tier: state.tier,
        tierDetails: state.tierDetails,
      }),
    }
  )
);

export default useSubscriptionStore;
