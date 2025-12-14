import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple, local Gardener logic with deterministic daily reflection
const REFLECTIONS = [
  'Focus on connection, not performance. Ask, listen, reflect.',
  'Kindness scales. Offer one genuine compliment today.',
  'Be specific. Share one story that reveals your values.',
  'Curiosity first. Replace advice with questions that invite depth.',
  'Choose presence over perfection. Small warmth beats big polish.',
  'State a boundary kindly. Clarity builds trust and safety.',
  'Slow is smooth. Quality attention > quantity of matches.',
];

const STORAGE_LAST_REFLECTION = 'gardener:last_reflection';

function seededIndex(seed: string, max: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % Math.max(1, max);
}

export async function getDailyReflection(date = new Date()): Promise<string> {
  const key = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
  const idx = seededIndex(key, REFLECTIONS.length);
  const text = REFLECTIONS[idx];
  await AsyncStorage.setItem(STORAGE_LAST_REFLECTION, text);
  return text;
}

export async function getLastReflection(): Promise<string | null> {
  try {
    return (await AsyncStorage.getItem(STORAGE_LAST_REFLECTION)) as string | null;
  } catch {
    return null;
  }
}

export function conversationStarters(profile: { bio?: string; interests?: string[] } = {}) {
  const starters = [
    'What’s been the highlight of your week so far?',
    'I’m curious — what’s something small that made you smile today?',
    'Your photos give me a “story behind the picture” vibe — what’s one?',
  ];
  if (profile.interests && profile.interests.length) {
    starters.unshift(`You mentioned ${profile.interests[0]} — what do you love about it?`);
  }
  if (profile.bio && profile.bio.length > 0) {
    starters.unshift('Your bio stood out — what sparked that perspective?');
  }
  return starters.slice(0, 3);
}

export function nudgeForChatStall(minutesIdle: number) {
  if (minutesIdle < 60) return null;
  return 'You could revive the convo with a playful “would you rather” or a specific follow-up from earlier.';
}
