'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ModelSelectorLogo, ModelSelectorName } from '@/components/ai-elements/model-selector';
import { getModels } from '@/lib/models/cache';
import type { ModelInfo } from '@/lib/models/types';
import { useChatStore } from '@/stores/chat';
import { CheckIcon } from 'lucide-react';

function providerSlug(modelId: string): string {
  return modelId.split('/')[0] ?? 'openrouter';
}

function shortName(model: ModelInfo): string {
  const parts = model.id.split('/');
  return parts[parts.length - 1] ?? model.name;
}

function formatContext(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function ModelPanel({ onGoToKey }: { onGoToKey?: () => void }) {
  const defaultModel = useChatStore((s) => s.defaultModel);
  const setDefaultModel = useChatStore((s) => s.setDefaultModel);
  const keyState = useChatStore((s) => s.keyState);
  const restricted = keyState !== 'configured';
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getModels().then(({ models: m }) => { setModels(m); setLoading(false); });
  }, []);

  const PINNED_ID = 'openrouter/free';

  const { pinned, groups } = useMemo(() => {
    const visible = restricted
      ? models.filter((m) => m.id === PINNED_ID || m.id.endsWith(':free'))
      : models;
    const pinnedModel = visible.find((m) => m.id === PINNED_ID);
    const rest = visible.filter((m) => m.id !== PINNED_ID);
    const map = new Map<string, ModelInfo[]>();
    for (const m of rest) {
      const p = providerSlug(m.id);
      if (!map.has(p)) map.set(p, []);
      map.get(p)!.push(m);
    }
    return {
      pinned: pinnedModel,
      groups: Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)),
    };
  }, [models, restricted]);

  const current = models.find((m) => m.id === defaultModel);
  const currentDisplay = current ? shortName(current) : (defaultModel.split('/').pop() ?? defaultModel);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
        <ModelSelectorLogo provider={providerSlug(defaultModel)} className="shrink-0" />
        <span className="flex-1 truncate text-sm font-medium">{currentDisplay}</span>
        <span className="text-xs text-muted-foreground shrink-0">default</span>
      </div>

      {loading ? (
        <div className="rounded-lg border overflow-hidden">
          <div className="border-b px-3 py-2">
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          </div>
          <div className="p-1 space-y-0.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5">
                <div className="size-3 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="h-3.5 rounded bg-muted animate-pulse" style={{ width: `${45 + (i * 17) % 35}%` }} />
                <div className="ml-auto h-3 w-6 rounded bg-muted animate-pulse shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Command className="rounded-lg border">
          <CommandInput placeholder="Search models…" className="h-8 text-sm" />
          <CommandList className="max-h-70">
            <CommandEmpty>No models found</CommandEmpty>
            {restricted && (
              <div className="px-3 py-2 text-xs text-muted-foreground border-b">
                <button
                  type="button"
                  className="underline underline-offset-2 text-primary hover:text-primary/80 transition-colors cursor-pointer"
                  onClick={onGoToKey}
                >
                  Add your API key
                </button>
                {' '}to access paid models.
              </div>
            )}
            {pinned && (
              <CommandGroup heading="Free">
                <CommandItem
                  value={pinned.id}
                  keywords={[shortName(pinned), pinned.name]}
                  onSelect={() => setDefaultModel(pinned.id)}
                  className="gap-2"
                >
                  <ModelSelectorLogo provider={providerSlug(pinned.id)} />
                  <ModelSelectorName>{shortName(pinned)}</ModelSelectorName>
                  <span className="ml-auto text-xs text-muted-foreground shrink-0">
                    {formatContext(pinned.contextLength)}
                  </span>
                  {pinned.id === defaultModel && (
                    <CheckIcon className="size-3.5 shrink-0 text-primary" />
                  )}
                </CommandItem>
              </CommandGroup>
            )}
            {groups.map(([provider, items]) => (
              <CommandGroup key={provider} heading={provider}>
                {items.map((m) => (
                  <CommandItem
                    key={m.id}
                    value={m.id}
                    keywords={[shortName(m), m.name]}
                    onSelect={() => setDefaultModel(m.id)}
                    className="gap-2"
                  >
                    <ModelSelectorLogo provider={provider} />
                    <ModelSelectorName>{shortName(m)}</ModelSelectorName>
                    <span className="ml-auto text-xs text-muted-foreground shrink-0">
                      {formatContext(m.contextLength)}
                    </span>
                    {m.id === defaultModel && (
                      <CheckIcon className="size-3.5 shrink-0 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      )}
    </div>
  );
}
