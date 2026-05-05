'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorInput,
  ModelSelectorList,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorItem,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from '@/components/ai-elements/model-selector';
import { Button } from '@/components/ui/button';
import { getModels } from '@/lib/models/cache';
import type { ModelInfo } from '@/lib/models/types';
import { useChatStore } from '@/stores/chat';

interface Props {
  currentModel: string;
  onSelect: (modelId: string) => void;
  restricted?: boolean;
}

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

export function ModelPicker({ currentModel, onSelect, restricted = false }: Props) {
  const [open, setOpen] = useState(false);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const setSettingsOpen = useChatStore((s) => s.setSettingsOpen);

  useEffect(() => {
    getModels().then(({ models: m }) => setModels(m));
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

  const displayName = useMemo(() => {
    const found = models.find((m) => m.id === currentModel);
    if (found) return shortName(found);
    const parts = currentModel.split('/');
    return parts[parts.length - 1] ?? currentModel;
  }, [models, currentModel]);

  const handleSelect = (modelId: string) => {
    onSelect(modelId);
    setOpen(false);
  };

  return (
    <ModelSelector open={open} onOpenChange={setOpen}>
      <ModelSelectorTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 max-w-[180px] text-muted-foreground hover:text-foreground"
            aria-label="Select model"
          />
        }
      >
        <ModelSelectorLogo provider={providerSlug(currentModel)} className="shrink-0" />
        <span className="truncate text-xs">{displayName}</span>
        <ChevronDown className="size-3 shrink-0 opacity-60" />
      </ModelSelectorTrigger>

      <ModelSelectorContent
        className="sm:max-w-md"
        title="Select model"
        showCloseButton={false}
      >
        <ModelSelectorInput placeholder="Search models…" />
        <ModelSelectorList className="max-h-80">
          <ModelSelectorEmpty>No models found</ModelSelectorEmpty>
          {restricted && (
            <div className="px-3 py-2 text-xs text-muted-foreground border-b">
              <button
                type="button"
                className="underline underline-offset-2 text-primary hover:text-primary/80 transition-colors cursor-pointer"
                onClick={() => { setOpen(false); setSettingsOpen(true); }}
              >
                Add your API key
              </button>
              {' '}to access paid models.
            </div>
          )}
          {pinned && (
            <ModelSelectorGroup heading="Free">
              <ModelSelectorItem
                value={pinned.id}
                keywords={[shortName(pinned), pinned.name]}
                onSelect={() => handleSelect(pinned.id)}
                className="gap-2"
              >
                <ModelSelectorLogo provider={providerSlug(pinned.id)} />
                <ModelSelectorName>{shortName(pinned)}</ModelSelectorName>
                <span className="ml-auto text-xs text-muted-foreground shrink-0">
                  {formatContext(pinned.contextLength)}
                </span>
                {pinned.id === currentModel && (
                  <span className="size-1.5 rounded-full bg-primary shrink-0" />
                )}
              </ModelSelectorItem>
            </ModelSelectorGroup>
          )}
          {groups.map(([provider, items]) => (
            <ModelSelectorGroup key={provider} heading={provider}>
              {items.map((m) => (
                <ModelSelectorItem
                  key={m.id}
                  value={m.id}
                  keywords={[shortName(m), m.name]}
                  onSelect={() => handleSelect(m.id)}
                  className="gap-2"
                >
                  <ModelSelectorLogo provider={provider} />
                  <ModelSelectorName>{shortName(m)}</ModelSelectorName>
                  <span className="ml-auto text-xs text-muted-foreground shrink-0">
                    {formatContext(m.contextLength)}
                  </span>
                  {m.id === currentModel && (
                    <span className="size-1.5 rounded-full bg-primary shrink-0" />
                  )}
                </ModelSelectorItem>
              ))}
            </ModelSelectorGroup>
          ))}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  );
}
