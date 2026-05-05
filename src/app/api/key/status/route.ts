import { unsealKey, sealKey, KEY_COOKIE_NAME, KEY_COOKIE_MAX_AGE } from '@/server/keyCookie';

const SET_COOKIE_FLAGS = 'HttpOnly; Secure; SameSite=Strict; Path=/';

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get('cookie');
  if (!header) return undefined;
  for (const part of header.split(/;\s*/)) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    if (part.slice(0, eq) === name) return part.slice(eq + 1);
  }
  return undefined;
}

export async function GET(request: Request): Promise<Response> {
  const value = readCookie(request, KEY_COOKIE_NAME);
  const apiKey = await unsealKey(value);
  const hasOwnerKey = !!process.env.OPENROUTER_API_KEY;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  if (apiKey === null) {
    return new Response(JSON.stringify({ configured: false, ownerKey: hasOwnerKey }), { status: 200, headers });
  }

  const refreshed = await sealKey(apiKey);
  headers['Set-Cookie'] = `${KEY_COOKIE_NAME}=${refreshed}; ${SET_COOKIE_FLAGS}; Max-Age=${KEY_COOKIE_MAX_AGE}`;
  return new Response(JSON.stringify({ configured: true, ownerKey: hasOwnerKey }), { status: 200, headers });
}
