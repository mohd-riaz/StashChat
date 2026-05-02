import { streamText, tool } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';
import { unsealKey, sealKey, KEY_COOKIE_NAME, KEY_COOKIE_MAX_AGE } from '@/server/keyCookie';
import { fetchUrlReadable } from '@/server/urlFetch';
import { ChatBodySchema } from '@/server/chatBodySchema';

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

  const apiKey = await unsealKey(readCookie(request, KEY_COOKIE_NAME));
  if (!apiKey) return jsonNoStore({ error: 'no_key' }, { status: 401 });

  let raw: unknown;
  try { raw = await request.json(); } catch {
    return jsonNoStore({ error: 'bad_request', detail: 'invalid JSON' }, { status: 400 });
  }
  const parsed = ChatBodySchema.safeParse(raw);
  if (!parsed.success) {
    return jsonNoStore(
      { error: 'bad_request', detail: parsed.error.issues[0]?.message ?? 'invalid body' },
      { status: 400 },
    );
  }
  const { messages, model, toolConfig } = parsed.data;

  const openrouter = createOpenRouter({ apiKey });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tools: Record<string, any> = {};
  if (toolConfig.urlFetch) {
    tools.url_fetch = tool({
      description: 'Fetch a URL and return its main content as Markdown.',
      inputSchema: z.object({ url: z.string().url() }),
      execute: async ({ url }: { url: string }, { abortSignal }: { abortSignal?: AbortSignal }) =>
        fetchUrlReadable(url, abortSignal),
    });
  }

  const providerOptions = toolConfig.webSearch
    ? {
        openrouter: {
          tools: [{
            type: 'openrouter:web_search',
            parameters: {
              engine: toolConfig.webSearchParams?.engine ?? 'auto',
              max_results: toolConfig.webSearchParams?.max_results ?? 5,
              search_context_size: toolConfig.webSearchParams?.search_context_size ?? 'medium',
              ...(toolConfig.webSearchParams?.allowed_domains?.length && {
                allowed_domains: toolConfig.webSearchParams.allowed_domains,
              }),
              ...(toolConfig.webSearchParams?.excluded_domains?.length && {
                excluded_domains: toolConfig.webSearchParams.excluded_domains,
              }),
            },
          }],
        },
      }
    : undefined;

  const result = streamText({
    model: openrouter.chat(model),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: messages as any,
    tools,
    providerOptions,
    abortSignal: request.signal,
  });

  const sealed = await sealKey(apiKey);
  const setCookie = `${KEY_COOKIE_NAME}=${sealed}; ${SET_COOKIE_FLAGS}; Max-Age=${KEY_COOKIE_MAX_AGE}`;

  return result.toUIMessageStreamResponse({
    headers: { 'Set-Cookie': setCookie, 'Cache-Control': 'no-store' },
  });
}
