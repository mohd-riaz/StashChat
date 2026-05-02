import type { Part } from './schema';

const MAX_CHARS = 160;

export function deriveContentSummary(parts: Part[]): string {
  const text = parts
    .filter((p): p is Extract<Part, { type: 'text' }> => p.type === 'text')
    .map((p) => p.text)
    .join(' ')
    .trim();
  if (text) return text.slice(0, MAX_CHARS);

  const images = parts.filter((p) => p.type === 'image');
  if (images.length > 0) {
    return images.length === 1 ? '📷 Image' : `📷 ${images.length} images`;
  }

  const search = parts.find(
    (p): p is Extract<Part, { type: 'tool-call' }> =>
      p.type === 'tool-call' && p.toolName === 'web_search',
  );
  if (search) {
    const query = (search.input as { query?: string } | undefined)?.query ?? '';
    return `🔍 Searched: "${query}"`;
  }

  const fetch = parts.find(
    (p): p is Extract<Part, { type: 'tool-call' }> =>
      p.type === 'tool-call' && p.toolName === 'url_fetch',
  );
  if (fetch) {
    const url = (fetch.input as { url?: string } | undefined)?.url;
    let host = '(unknown)';
    if (url) {
      try { host = new URL(url).host; } catch { host = url; }
    }
    return `🌐 Fetched: ${host}`;
  }

  return '';
}
