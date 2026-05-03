'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SquarePen, Search } from 'lucide-react';
import { ConversationItem } from './ConversationItem';
import type { Conversation } from '@/lib/db/schema';

export interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
}

export function Sidebar({ conversations, activeId, onSelect, onNew, onRename, onDelete }: SidebarProps) {
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!filter.trim()) return sorted;
    const q = filter.toLowerCase();
    return sorted.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, filter]);

  return (
    <aside className="flex h-dvh w-64 flex-col bg-sidebar border-r">
      <div className="flex items-center justify-between px-3 py-3">
        <span className="text-sm font-semibold tracking-tight">StashChat</span>
        <Button
          onClick={onNew}
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="New chat"
          title="New chat"
        >
          <SquarePen className="size-4" />
        </Button>
      </div>

      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-8 pl-8 text-sm bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {filtered.length === 0 && conversations.length === 0 && (
          <div className="text-xs text-muted-foreground px-2 py-3 text-center">
            No conversations yet
          </div>
        )}
        {filtered.length === 0 && conversations.length > 0 && (
          <div className="text-xs text-muted-foreground px-2 py-2">No matches</div>
        )}
        {filtered.map((c) => (
          <ConversationItem
            key={c.id}
            conv={c}
            active={c.id === activeId}
            onSelect={onSelect}
            onRename={onRename}
            onDelete={onDelete}
          />
        ))}
      </div>
    </aside>
  );
}
