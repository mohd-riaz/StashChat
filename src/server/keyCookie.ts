import { sealData, unsealData } from 'iron-session';

export const KEY_COOKIE_NAME = 'stashchat_key';
export const KEY_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function getSecret(): string {
  const s = process.env.STASHCHAT_COOKIE_SECRET;
  if (!s || s.length < 32) {
    throw new Error('STASHCHAT_COOKIE_SECRET must be set to a string of length >= 32');
  }
  return s;
}

export async function sealKey(apiKey: string): Promise<string> {
  return sealData({ apiKey }, { password: getSecret(), ttl: KEY_COOKIE_MAX_AGE });
}

export async function unsealKey(value: string | undefined): Promise<string | null> {
  if (!value) return null;
  try {
    const { apiKey } = await unsealData<{ apiKey: string }>(value, { password: getSecret() });
    return typeof apiKey === 'string' ? apiKey : null;
  } catch {
    return null;
  }
}
