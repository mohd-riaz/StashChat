import type { ModelInfo } from './types';

interface Raw {
  id?: string;
  name?: string;
  context_length?: number;
  architecture?: { input_modalities?: string[] };
  supported_parameters?: string[];
  pricing?: { prompt: string; completion: string };
}

const ALLOWED_MODALITIES: ReadonlySet<ModelInfo['inputModalities'][number]> =
  new Set(['text', 'image', 'audio', 'file']);

export function normalizeModels(raw: Raw[]): ModelInfo[] {
  return raw.flatMap((r) => {
    if (!r.id) return [];
    const modalities = (r.architecture?.input_modalities ?? ['text'])
      .filter((m): m is ModelInfo['inputModalities'][number] =>
        ALLOWED_MODALITIES.has(m as never));
    return [{
      id: r.id,
      name: r.name ?? r.id,
      contextLength: r.context_length ?? 0,
      inputModalities: modalities,
      supportsTools: (r.supported_parameters ?? []).includes('tools'),
      pricing: r.pricing,
    }];
  });
}
