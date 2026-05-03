import { streamText, tool } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';
import { unsealKey, sealKey, KEY_COOKIE_NAME, KEY_COOKIE_MAX_AGE } from '@/server/keyCookie';
import { fetchUrlReadable } from '@/server/urlFetch';
import { ChatBodySchema, type ChatBody } from '@/server/chatBodySchema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toCoreMessages(msgs: ChatBody['messages']): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any[] = [];
  for (const msg of msgs) {
    if (msg.role === 'system') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const text = msg.parts.filter((p) => p.type === 'text').map((p) => (p as any).text as string).join('\n');
      if (text) result.push({ role: 'system', content: text });
      continue;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const content: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pendingToolResults: any[] = [];
    for (const p of msg.parts) {
      if (p.type === 'text') {
        content.push({ type: 'text', text: (p as { text: string }).text });
      } else if (p.type === 'image' && msg.role === 'user') {
        const ip = p as { dataUrl: string; mimeType: string };
        content.push({ type: 'image', image: ip.dataUrl, mimeType: ip.mimeType });
      } else if (p.type === 'tool-result' && msg.role === 'user') {
        const tp = p as { toolCallId: string; toolName: string; output: unknown; isError?: boolean };
        content.push({
          type: 'tool-result',
          toolCallId: tp.toolCallId,
          toolName: tp.toolName,
          content: typeof tp.output === 'string' ? tp.output : JSON.stringify(tp.output),
          isError: tp.isError,
        });
      } else if (p.type === 'tool-call' && msg.role === 'assistant') {
        const cp = p as { toolCallId: string; toolName: string; input: unknown };
        content.push({ type: 'tool-call', toolCallId: cp.toolCallId, toolName: cp.toolName, args: cp.input });
      } else if (p.type === 'tool-invocation' && msg.role === 'assistant') {
        // AI SDK v6 UIMessage format: tool call + result embedded in one part
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const inv = (p as any).toolInvocation as { state: string; toolCallId: string; toolName: string; args?: unknown; result?: unknown } | undefined;
        if (inv?.toolCallId) {
          content.push({ type: 'tool-call', toolCallId: inv.toolCallId, toolName: inv.toolName, args: inv.args ?? {} });
          if (inv.state === 'result') {
            pendingToolResults.push({
              type: 'tool-result',
              toolCallId: inv.toolCallId,
              toolName: inv.toolName,
              content: typeof inv.result === 'string' ? inv.result : JSON.stringify(inv.result),
            });
          }
        }
      }
      // step-start, reasoning, source, file → skip
    }
    if (content.length) result.push({ role: msg.role, content });
    // Synthetic user message carrying tool results from AI SDK tool-invocation parts
    if (pendingToolResults.length) result.push({ role: 'user', content: pendingToolResults });
  }
  return result;
}

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

function logError(context: string, error: unknown, extra?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  console.error('[api/chat]', context, { ...extra, message, stack });
}

export async function POST(request: Request): Promise<Response> {
  try {
    const ct = request.headers.get('content-type') ?? '';
    if (!ct.includes('application/json'))
      return jsonNoStore({ error: 'unsupported_media_type' }, { status: 415 });

    const apiKey = await unsealKey(readCookie(request, KEY_COOKIE_NAME));
    if (!apiKey) return jsonNoStore({ error: 'no_key' }, { status: 401 });

    let raw: unknown;
    try { raw = await request.json(); } catch (err) {
      logError('JSON parse failed', err);
      return jsonNoStore({ error: 'bad_request', detail: 'invalid JSON' }, { status: 400 });
    }
    const parsed = ChatBodySchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues[0]?.message ?? 'invalid body';
      logError('Request validation failed', new Error(detail), { issues: parsed.error.issues });
      return jsonNoStore({ error: 'bad_request', detail }, { status: 400 });
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
      messages: toCoreMessages(messages),
      tools,
      providerOptions,
      abortSignal: request.signal,
      onError: ({ error }) => {
        logError('streamText error', error, { model, messageCount: messages.length });
      },
    });

    const sealed = await sealKey(apiKey);
    const setCookie = `${KEY_COOKIE_NAME}=${sealed}; ${SET_COOKIE_FLAGS}; Max-Age=${KEY_COOKIE_MAX_AGE}`;

    return result.toUIMessageStreamResponse({
      headers: { 'Set-Cookie': setCookie, 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    logError('Unhandled error', err);
    return jsonNoStore({ error: 'internal_error' }, { status: 500 });
  }
}
