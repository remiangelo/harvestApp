import { supabase } from './supabase';

export type SwipeAction = 'like' | 'nope' | 'super_like';

interface SwipeResult {
  success: boolean;
  isMatch?: boolean;
  matchId?: string;
  error?: any;
}

/**
 * Save a swipe action to the database
 * Automatically checks for mutual match via database trigger
 */
export const saveSwipe = async (
  swiperId: string,
  swipedId: string,
  action: SwipeAction
): Promise<SwipeResult> => {
  try {
    // Insert the swipe
    const { data: swipeData, error: swipeError } = await supabase
      .from('swipes')
      .insert({
        swiper_id: swiperId,
        swiped_id: swipedId,
        action,
      })
      .select()
      .single();

    if (swipeError) {
      // Handle duplicate swipe error gracefully
      if (swipeError.code === '23505') {
        return { 
          success: false, 
          error: 'You have already swiped on this profile' 
        };
      }
      throw swipeError;
    }

    // If it's a like or super_like, check if a match was created
    if (action === 'like' || action === 'super_like') {
      const { data: matchData } = await supabase
        .rpc('get_match_status', {
          user_a: swiperId,
          user_b: swipedId,
        })
        .single();

      if (matchData?.is_matched) {
        return {
          success: true,
          isMatch: true,
          matchId: matchData.match_id,
        };
      }
    }

    return { success: true, isMatch: false };
  } catch (error) {
    console.error('Error saving swipe:', error);
    return { success: false, error };
  }
};

/**
 * Get swipe history for a user
 */
export const getSwipeHistory = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('swipes')
      .select(`
        id,
        swiped_id,
        action,
        created_at,
        swiped:users!swiped_id (
          id,
          nickname,
          age,
          photos
        )
      `)
      .eq('swiper_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching swipe history:', error);
    return { data: null, error };
  }
};

/**
 * Check if user has already swiped on another user
 */
export const hasUserSwiped = async (
  swiperId: string,
  swipedId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('swipes')
      .select('id')
      .eq('swiper_id', swiperId)
      .eq('swiped_id', swipedId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is fine
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking swipe status:', error);
    return false;
  }
};

/**
 * Get swipe statistics for a user
 */
export const getSwipeStats = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('swipes')
      .select('action')
      .eq('swiper_id', userId);

    if (error) throw error;

    const stats = {
      total: data.length,
      likes: data.filter((s: any) => s.action === 'like').length,
      nopes: data.filter((s: any) => s.action === 'nope').length,
      superLikes: data.filter((s: any) => s.action === 'super_like').length,
    };

    return { stats, error: null };
  } catch (error) {
    console.error('Error fetching swipe stats:', error);
    return { stats: null, error };
  }
};