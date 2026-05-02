const ALLOWED = new Set(['http:', 'https:', 'mailto:']);

export function sanitizeUrl(href: string | undefined): string {
  if (!href || !href.trim()) return '#';
  try {
    const u = new URL(href);
    return ALLOWED.has(u.protocol) ? u.toString() : '#';
  } catch {
    return '#';
  }
}
