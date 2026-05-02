import * as meta from '@/lib/db/meta';
import { normalizeModels } from './capabilities';
import type { ModelInfo } from './types';

const TTL_MS = 24 * 60 * 60 * 1000;

interface Cached { models: ModelInfo[]; fetchedAt: number; }

export async function getModels(): Promise<{ models: ModelInfo[]; stale: boolean }> {
  const cached = await meta.get<Cached>('models-cache');
  const now = Date.now();
  if (cached && now - cached.fetchedAt < TTL_MS) {
    return { models: cached.models, stale: false };
  }
  try {
    const fresh = await fetch('/api/models').then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });
    const models = normalizeModels(fresh.data ?? []);
    await meta.put('models-cache', { models, fetchedAt: now });
    return { models, stale: false };
  } catch {
    if (cached) return { models: cached.models, stale: true };
    return { models: [], stale: true };
  }
}
