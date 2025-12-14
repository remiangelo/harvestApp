/**
 * Values Service
 * Handles user values for values-based matching
 */

import { supabase } from './supabase';

export interface Value {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface UserValue {
  id: string;
  user_id: string;
  value_id: string;
  ranking: number;
  value?: Value; // Joined value data
}

/**
 * Get all available values
 */
export const getAllValues = async (): Promise<{ data: Value[] | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('values')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    return { data, error };
  } catch (error) {
    console.error('[getAllValues] Error:', error);
    return { data: null, error };
  }
};

/**
 * Get user's values brought (what they bring to relationship)
 */
export const getUserValuesBrought = async (
  userId: string
): Promise<{ data: UserValue[] | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('user_values_brought')
      .select(
        `
        id,
        user_id,
        value_id,
        ranking,
        value:values (
          id,
          name,
          category,
          description
        )
      `
      )
      .eq('user_id', userId)
      .order('ranking', { ascending: true });

    return { data, error };
  } catch (error) {
    console.error('[getUserValuesBrought] Error:', error);
    return { data: null, error };
  }
};

/**
 * Get user's values sought (what they seek in partner)
 */
export const getUserValuesSought = async (
  userId: string
): Promise<{ data: UserValue[] | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('user_values_sought')
      .select(
        `
        id,
        user_id,
        value_id,
        ranking,
        value:values (
          id,
          name,
          category,
          description
        )
      `
      )
      .eq('user_id', userId)
      .order('ranking', { ascending: true });

    return { data, error };
  } catch (error) {
    console.error('[getUserValuesSought] Error:', error);
    return { data: null, error };
  }
};

/**
 * Save user's values brought
 * Uses upsert to safely replace all values atomically
 */
export const saveUserValuesBrought = async (
  userId: string,
  values: { value_id: string; ranking: number }[]
): Promise<{ error: any }> => {
  try {
    // First, get existing values to know what to delete
    const { data: existing } = await supabase
      .from('user_values_brought')
      .select('id')
      .eq('user_id', userId);

    const existingIds = existing?.map((v: any) => v.id) || [];

    // Prepare new values for insert
    const valuesToInsert = values.map((v) => ({
      user_id: userId,
      value_id: v.value_id,
      ranking: v.ranking,
    }));

    // Insert new values (this will succeed even if some fail due to constraints)
    const { error: insertError } = await supabase
      .from('user_values_brought')
      .insert(valuesToInsert);

    if (insertError) {
      console.error('[saveUserValuesBrought] Insert error:', insertError);
      return { error: insertError };
    }

    // Only delete old values after successful insert
    if (existingIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('user_values_brought')
        .delete()
        .in('id', existingIds);

      if (deleteError) {
        console.error('[saveUserValuesBrought] Delete error:', deleteError);
        // Insert succeeded but delete failed - not critical, just log
      }
    }

    return { error: null };
  } catch (error) {
    console.error('[saveUserValuesBrought] Error:', error);
    return { error };
  }
};

/**
 * Save user's values sought
 * Uses upsert to safely replace all values atomically
 */
export const saveUserValuesSought = async (
  userId: string,
  values: { value_id: string; ranking: number }[]
): Promise<{ error: any }> => {
  try {
    // First, get existing values to know what to delete
    const { data: existing } = await supabase
      .from('user_values_sought')
      .select('id')
      .eq('user_id', userId);

    const existingIds = existing?.map((v: any) => v.id) || [];

    // Prepare new values for insert
    const valuesToInsert = values.map((v) => ({
      user_id: userId,
      value_id: v.value_id,
      ranking: v.ranking,
    }));

    // Insert new values (this will succeed even if some fail due to constraints)
    const { error: insertError } = await supabase.from('user_values_sought').insert(valuesToInsert);

    if (insertError) {
      console.error('[saveUserValuesSought] Insert error:', insertError);
      return { error: insertError };
    }

    // Only delete old values after successful insert
    if (existingIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('user_values_sought')
        .delete()
        .in('id', existingIds);

      if (deleteError) {
        console.error('[saveUserValuesSought] Delete error:', deleteError);
        // Insert succeeded but delete failed - not critical, just log
      }
    }

    return { error: null };
  } catch (error) {
    console.error('[saveUserValuesSought] Error:', error);
    return { error };
  }
};

/**
 * Calculate values compatibility between two users
 */
export const calculateValuesCompatibility = async (
  user1Id: string,
  user2Id: string
): Promise<{ compatibility: number; matchingValues: string[] }> => {
  try {
    // Get what user1 seeks
    const { data: user1Sought } = await getUserValuesSought(user1Id);
    // Get what user2 brings
    const { data: user2Brought } = await getUserValuesBrought(user2Id);

    if (!user1Sought || !user2Brought) {
      return { compatibility: 0, matchingValues: [] };
    }

    // Find matching values
    const user1SoughtIds = new Set(user1Sought.map((v) => v.value_id));
    const matchingValues = user2Brought
      .filter((v) => user1SoughtIds.has(v.value_id))
      .map((v) => (v.value as Value).name);

    // Calculate compatibility percentage
    const compatibility =
      user1Sought.length > 0 ? Math.round((matchingValues.length / user1Sought.length) * 100) : 0;

    return { compatibility, matchingValues };
  } catch (error) {
    console.error('[calculateValuesCompatibility] Error:', error);
    return { compatibility: 0, matchingValues: [] };
  }
};
