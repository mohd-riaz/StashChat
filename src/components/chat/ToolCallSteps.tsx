'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Markdown } from './Markdown';
import type { Part } from '@/lib/db/schema';

interface Pair {
  call: Extract<Part, { type: 'tool-call' }>;
  result?: Extract<Part, { type: 'tool-result' }>;
}

function labelFor(call: Pair['call']): string {
  if (call.toolName === 'web_search') {
    const q = (call.input as { query?: string } | undefined)?.query ?? '';
    return `🔍 Searched: "${q}"`;
  }
  if (call.toolName === 'url_fetch') {
    const u = (call.input as { url?: string } | undefined)?.url ?? '';
    return `🌐 Fetched: ${u.length > 60 ? u.slice(0, 60) + '…' : u}`;
  }
  return `🔧 ${call.toolName}`;
}

function ResultBody({ pair }: { pair: Pair }) {
  if (!pair.result) {
    return <div className="text-xs text-muted-foreground italic">…streaming</div>;
  }
  const out = pair.result.output as Record<string, unknown>;
  if (pair.result.isError || (typeof out === 'object' && (out as { error?: string }).error)) {
    return <div className="text-xs text-destructive">{(out as { error?: string }).error ?? 'Error'}</div>;
  }
  if (pair.call.toolName === 'web_search') {
    const results = (out as { results?: Array<{ title?: string; url?: string; snippet?: string }> }).results ?? [];
    return (
      <ol className="list-decimal pl-5 text-sm space-y-1">
        {results.map((r, i) => (
          <li key={i}>
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="underline">
              {r.title ?? r.url}
            </a>
            {r.snippet ? <> — <span className="text-muted-foreground">{r.snippet}</span></> : null}
          </li>
        ))}
      </ol>
    );
  }
  if (pair.call.toolName === 'url_fetch') {
    const r = out as { title?: string; byline?: string; url?: string; content_markdown?: string; truncated?: boolean };
    const preview = (r.content_markdown ?? '').slice(0, 600);
    return (
      <div className="text-sm">
        {r.title && <div className="font-medium">{r.title}</div>}
        {r.byline && <div className="text-xs text-muted-foreground">{r.byline}</div>}
        <Markdown source={preview} />
        {r.truncated && <div className="text-xs text-muted-foreground">[truncated]</div>}
        {r.url && (
          <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs underline">
            Open original ↗
          </a>
        )}
      </div>
    );
  }
  return <pre className="text-xs overflow-x-auto">{JSON.stringify(out, null, 2)}</pre>;
}

export function ToolCallStep({ pair }: { pair: Pair }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="my-2 rounded border bg-muted/30">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-1 p-2 text-left text-sm"
        aria-expanded={open}
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <span>{labelFor(pair.call)}</span>
        {!pair.result && <span className="ml-2 text-xs text-muted-foreground italic">searching…</span>}
      </button>
      {open && <div className="px-3 pb-3"><ResultBody pair={pair} /></div>}
    </div>
  );
}

export function pairToolParts(parts: Part[]): Array<Part | Pair> {
  const out: Array<Part | Pair> = [];
  const calls = new Map<string, number>();
  for (const part of parts) {
    if (part.type === 'tool-call') {
      const idx = out.length;
      calls.set(part.toolCallId, idx);
      out.push({ call: part });
    } else if (part.type === 'tool-result') {
      const idx = calls.get(part.toolCallId);
      if (idx !== undefined) {
        (out[idx] as Pair).result = part;
      } else {
        out.push(part);
      }
    } else {
      out.push(part);
    }
  }
  return out;
}
