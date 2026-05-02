import { sealKey, KEY_COOKIE_NAME, KEY_COOKIE_MAX_AGE } from '@/server/keyCookie';
import { validateKey } from '@/server/openrouterServer';

const COOKIE_BASE = `${KEY_COOKIE_NAME}=`;
const SET_COOKIE_FLAGS = 'HttpOnly; Secure; SameSite=Strict; Path=/';

function jsonNoStore(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...(init.headers ?? {}),
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  const ct = request.headers.get('content-type') ?? '';
  if (!ct.includes('application/json'))
    return jsonNoStore({ error: 'unsupported_media_type' }, { status: 415 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return jsonNoStore({ error: 'bad_request' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || typeof (body as { apiKey?: unknown }).apiKey !== 'string')
    return jsonNoStore({ error: 'bad_request', detail: 'apiKey required' }, { status: 400 });

  const apiKey = (body as { apiKey: string }).apiKey.trim();
  if (apiKey.length === 0 || apiKey.length > 200 || !apiKey.startsWith('sk-or-'))
    return jsonNoStore({ error: 'bad_request', detail: 'invalid key format' }, { status: 400 });

  const result = await validateKey(apiKey);
  if (result === 'invalid') return jsonNoStore({ error: 'invalid_key' }, { status: 401 });
  if (result === 'unreachable') return jsonNoStore({ error: 'openrouter_unreachable' }, { status: 502 });

  const sealed = await sealKey(apiKey);
  const setCookie = `${COOKIE_BASE}${sealed}; ${SET_COOKIE_FLAGS}; Max-Age=${KEY_COOKIE_MAX_AGE}`;
  return jsonNoStore({ ok: true }, { status: 200, headers: { 'Set-Cookie': setCookie } });
}

export async function DELETE(_request: Request): Promise<Response> {
  const setCookie = `${COOKIE_BASE}; ${SET_COOKIE_FLAGS}; Max-Age=0`;
  return jsonNoStore({ ok: true }, { status: 200, headers: { 'Set-Cookie': setCookie } });
}
