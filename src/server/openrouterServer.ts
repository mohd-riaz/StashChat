const BASE_URL = 'https://openrouter.ai/api/v1';

export type ValidateResult = 'ok' | 'invalid' | 'unreachable';

export async function validateKey(apiKey: string): Promise<ValidateResult> {
  try {
    const res = await fetch(`${BASE_URL}/key`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.ok) return 'ok';
    if (res.status === 401) return 'invalid';
    return 'unreachable';
  } catch {
    return 'unreachable';
  }
}
