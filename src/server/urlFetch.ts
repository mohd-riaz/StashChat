import { parseHTML } from 'linkedom';
import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_CONTENT_CHARS = 20_000;
const TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 5;
const USER_AGENT = 'StashChat/1.0';

const PRIVATE_V4 = [
  /^10\./, /^127\./, /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./,
  /^0\./,
  /^100\.(6[4-9]|[789]\d|1[01]\d|12[0-7])\./,
];
const PRIVATE_V6_PREFIXES = ['::1', 'fe80:', 'fc', 'fd'];

export interface UrlFetchResult {
  url: string;
  title?: string;
  byline?: string;
  content_markdown?: string;
  truncated?: boolean;
  error?: string;
}

function isPrivateAddress(ip: string): boolean {
  if (PRIVATE_V4.some((re) => re.test(ip))) return true;
  const lower = ip.toLowerCase().replace(/^\[|\]$/g, '');
  if (PRIVATE_V6_PREFIXES.some((p) => lower.startsWith(p))) return true;
  return false;
}

async function resolveSafely(input: string, maxHops: number, signal: AbortSignal): Promise<string> {
  let current = input;
  for (let hop = 0; hop <= maxHops; hop++) {
    const u = new URL(current);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      throw new Error('Only http(s) URLs allowed');
    }
    const host = u.hostname.replace(/^\[|\]$/g, '');
    const ip = isIP(host) ? host : (await lookup(host)).address;
    if (isPrivateAddress(ip)) throw new Error('Refusing to fetch private/internal address');

    const res = await fetch(current, {
      method: 'HEAD',
      redirect: 'manual',
      signal,
      headers: { 'User-Agent': USER_AGENT },
    });
    if (res.status >= 300 && res.status < 400) {
      const next = res.headers.get('location');
      if (!next) throw new Error('Redirect with no Location');
      current = new URL(next, current).toString();
      continue;
    }
    return current;
  }
  throw new Error('Too many redirects');
}

async function readCapped(stream: ReadableStream<Uint8Array>, maxBytes: number): Promise<string> {
  const reader = stream.getReader();
  let total = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      reader.cancel();
      break;
    }
    chunks.push(value);
  }
  const buffer = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) { buffer.set(c, offset); offset += c.byteLength; }
  return new TextDecoder('utf-8', { fatal: false }).decode(buffer);
}

export async function fetchUrlReadable(
  url: string,
  outerSignal: AbortSignal | undefined,
): Promise<UrlFetchResult> {
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  const signal = outerSignal ? AbortSignal.any([outerSignal, timeout]) : timeout;

  let finalUrl: string;
  try {
    finalUrl = await resolveSafely(url, MAX_REDIRECTS, signal);
  } catch (e) {
    return { url, error: (e as Error).message };
  }

  let res: Response;
  try {
    res = await fetch(finalUrl, {
      headers: { 'User-Agent': USER_AGENT, 'Accept': 'text/html,application/xhtml+xml' },
      redirect: 'manual',
      signal,
    });
  } catch (e) {
    return { url: finalUrl, error: (e as Error).message };
  }

  if (!res.ok) return { url: finalUrl, error: `HTTP ${res.status}` };
  if (!res.body) return { url: finalUrl, error: 'No response body' };

  const html = await readCapped(res.body, MAX_BYTES);
  const { document } = parseHTML(html);
  const article = new Readability(document).parse();
  if (!article) return { url: finalUrl, error: 'Could not extract main content' };

  const md = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' })
    .turndown(article.content ?? '');
  const truncated = md.length > MAX_CONTENT_CHARS;
  const content = truncated ? md.slice(0, MAX_CONTENT_CHARS) + '\n\n…[truncated]' : md;

  return {
    url: finalUrl,
    title: article.title ?? undefined,
    byline: article.byline ?? undefined,
    content_markdown: content,
    truncated,
  };
}
