import { supabase } from './supabase';
import { TierName, TierDetails } from '../stores/useSubscriptionStore';

export interface SubscriptionTier {
  id: string;
  name: TierName;
  display_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  matches_per_week: number | null;
  max_distance_miles: number | null;
  gardener_conversations_per_day: number | null;
  gardener_character_limit: number;
  has_values_matching: boolean;
  has_basic_filters: boolean;
  has_advanced_filters: boolean;
  has_full_filters: boolean;
  can_see_likes: boolean;
  can_disable_mindful_messaging: boolean;
  sort_order: number;
}

/**
 * Fetch all available subscription tiers
 */
export async function getSubscriptionTiers(): Promise<SubscriptionTier[]> {
  const { data, error } = await supabase
    .from('subscription_tiers')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[Subscription] Error fetching tiers:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get user's current tier details
 */
export async function getUserTier(userId: string): Promise<TierDetails | null> {
  const { data, error } = await supabase.rpc('get_user_tier', { p_user_id: userId });

  if (error) {
    console.error('[Subscription] Error getting user tier:', error);
    throw error;
  }

  return data?.[0] || null;
}

/**
 * Get user's subscription status
 */
export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(
      `
      *,
      subscription_tiers (*)
    `
    )
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[Subscription] Error getting subscription:', error);
    throw error;
  }

  return data;
}

/**
 * Initialize user with default Seed tier (called after registration)
 */
export async function initializeUserSubscription(userId: string): Promise<void> {
  try {
    // Get Seed tier
    const { data: seedTier } = await supabase
      .from('subscription_tiers')
      .select('id')
      .eq('name', 'seed')
      .single();

    if (!seedTier) {
      console.error('[Subscription] Seed tier not found');
      return;
    }

    // Check if user already has a subscription
    const { data: existingSub } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingSub) {
      console.log('[Subscription] User already has subscription');
      return;
    }

    // Create subscription
    await supabase.from('user_subscriptions').insert({
      user_id: userId,
      tier_id: seedTier.id,
      status: 'active',
    });

    console.log('[Subscription] Initialized user with Seed tier');
  } catch (error) {
    console.error('[Subscription] Error initializing subscription:', error);
  }
}

/**
 * Upgrade user to a new tier
 */
export async function upgradeSubscription(
  userId: string,
  tierName: TierName,
  paymentProvider: 'apple' | 'google' | 'stripe',
  paymentId: string
): Promise<boolean> {
  try {
    // Get the target tier
    const { data: tier } = await supabase
      .from('subscription_tiers')
      .select('id')
      .eq('name', tierName)
      .single();

    if (!tier) {
      console.error('[Subscription] Tier not found:', tierName);
      return false;
    }

    // Update or insert subscription
    const { error } = await supabase.from('user_subscriptions').upsert(
      {
        user_id: userId,
        tier_id: tier.id,
        status: 'active',
        payment_provider: paymentProvider,
        payment_id: paymentId,
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    );

    if (error) throw error;

    console.log('[Subscription] Upgraded to:', tierName);
    return true;
  } catch (error) {
    console.error('[Subscription] Error upgrading subscription:', error);
    return false;
  }
}

/**
 * Cancel user's subscription
 */
export async function cancelSubscription(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) throw error;

    console.log('[Subscription] Cancelled subscription');
    return true;
  } catch (error) {
    console.error('[Subscription] Error cancelling subscription:', error);
    return false;
  }
}

/**
 * Get tier feature comparison for upgrade modal
 */
export function getTierComparison(): {
  feature: string;
  seed: string;
  green: string;
  gold: string;
}[] {
  return [
    {
      feature: 'Matches per week',
      seed: '5',
      green: 'Unlimited',
      gold: 'Unlimited',
    },
    {
      feature: 'Distance range',
      seed: '100 miles',
      green: '250 miles',
      gold: 'Unlimited (US)',
    },
    {
      feature: 'Gardener conversations',
      seed: '1 free',
      green: '1 per day',
      gold: 'Unlimited',
    },
    {
      feature: 'Values-based matching',
      seed: '-',
      green: 'Yes',
      gold: 'Yes',
    },
    {
      feature: 'Advanced filters',
      seed: '-',
      green: 'Age, Height',
      gold: 'All filters',
    },
    {
      feature: 'See who liked you',
      seed: '-',
      green: '-',
      gold: 'Yes',
    },
    {
      feature: 'Disable mindful messaging',
      seed: '-',
      green: 'Yes',
      gold: 'Yes',
    },
  ];
}

/**
 * Format tier limits message for UI
 */
export function formatLimitMessage(
  type: 'matches' | 'gardener',
  tierName: TierName,
  remaining: number
): string {
  if (type === 'matches') {
    if (tierName === 'seed') {
      return `${remaining} matches left this week. Upgrade to Green for unlimited matching!`;
    }
    return 'Unlimited matches';
  }

  if (type === 'gardener') {
    if (tierName === 'seed') {
      if (remaining > 0) {
        return 'You have 1 free conversation with The Gardener.';
      }
      return "You've used your free conversation. Upgrade to continue chatting with The Gardener!";
    }
    if (tierName === 'green') {
      if (remaining > 0) {
        return 'You have 1 conversation with The Gardener today.';
      }
      return "You've used your conversation for today. Upgrade to Gold to continue chatting. Otherwise, I'll be here for another conversation tomorrow!";
    }
    return 'Unlimited conversations with The Gardener';
  }

  return '';
}
