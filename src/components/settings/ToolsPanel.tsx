'use client';

import { LockIcon } from 'lucide-react';
import { useChatStore } from '@/stores/chat';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import type { ToolConfig } from '@/lib/db/schema';

export function ToolsPanel({ onGoToKey }: { onGoToKey?: () => void }) {
  const cfg = useChatStore((s) => s.toolConfig);
  const setToolConfig = useChatStore((s) => s.setToolConfig);
  const keyState = useChatStore((s) => s.keyState);
  const restricted = keyState !== 'configured';

  const update = (patch: Partial<ToolConfig> & { params?: Partial<NonNullable<ToolConfig['webSearchParams']>> }) => {
    const next: ToolConfig = {
      ...cfg,
      ...patch,
      webSearchParams: patch.params
        ? { ...cfg.webSearchParams, ...patch.params }
        : cfg.webSearchParams,
    };
    setToolConfig(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm">Web search</span>
        {restricted ? (
          <button
            type="button"
            onClick={onGoToKey}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Web search locked — add API key"
          >
            <LockIcon className="size-3.5" />
            <span>Requires your key</span>
          </button>
        ) : (
          <Switch
            checked={cfg.webSearch}
            onCheckedChange={(checked) => update({ webSearch: checked })}
            aria-label="Web search"
          />
        )}
      </div>

      {cfg.webSearch && (
        <div className="ml-2 space-y-3 border-l pl-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm">Engine</span>
            <Select
              value={cfg.webSearchParams?.engine ?? 'auto'}
              onValueChange={(v) => update({ params: { engine: v as never } })}
            >
              <SelectTrigger size="sm" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(['auto', 'native', 'exa', 'firecrawl', 'parallel'] as const).map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm">Context size</span>
            <Select
              value={cfg.webSearchParams?.search_context_size ?? 'medium'}
              onValueChange={(v) => update({ params: { search_context_size: v as never } })}
            >
              <SelectTrigger size="sm" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(['low', 'medium', 'high'] as const).map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm">Max results</span>
            <Input
              type="number"
              min={1}
              max={25}
              value={cfg.webSearchParams?.max_results ?? 5}
              onChange={(e) => update({ params: { max_results: Number(e.target.value) } })}
              aria-label="Max results"
              className="w-20 h-7 text-sm"
            />
          </div>

          <div className="space-y-1">
            <span className="text-sm">Allowed domains</span>
            <Input
              placeholder="example.com, another.org"
              value={(cfg.webSearchParams?.allowed_domains ?? []).join(', ')}
              onChange={(e) =>
                update({ params: { allowed_domains: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) } })
              }
              className="h-7 text-sm"
            />
          </div>

          <div className="space-y-1">
            <span className="text-sm">Excluded domains</span>
            <Input
              placeholder="ads.example.com"
              value={(cfg.webSearchParams?.excluded_domains ?? []).join(', ')}
              onChange={(e) =>
                update({ params: { excluded_domains: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) } })
              }
              className="h-7 text-sm"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm">URL fetch</span>
        <Switch
          checked={cfg.urlFetch}
          onCheckedChange={(checked) => update({ urlFetch: checked })}
          aria-label="URL fetch"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Global defaults. Each conversation can override via the toolbar.
      </p>
    </div>
  );
}
