import { supabase } from './supabase';

export function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

// Ensure a conversation exists for a given match id.
// Requires a valid UUID match_id (from the real matches table).
export async function ensureConversation(matchId: string) {
  if (!isUuid(matchId)) return null;
  const { data: existing, error: findErr } = await supabase
    .from('conversations')
    .select('id')
    .eq('match_id', matchId)
    .maybeSingle();
  if (findErr) {
    console.warn('ensureConversation: find error', findErr);
  }
  if (existing?.id) return existing.id as string;

  const { data: created, error: createErr } = await supabase
    .from('conversations')
    .insert([{ match_id: matchId }])
    .select('id')
    .maybeSingle();
  if (createErr) {
    console.warn('ensureConversation: create error', createErr);
    return null;
  }
  return created?.id ?? null;
}
