'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings as SettingsIcon, PanelLeft } from 'lucide-react';
import { useChatStore } from '@/stores/chat';

export interface ChatHeaderProps {
  onOpenSettings: () => void;
  onOpenSidebar?: () => void;
}

export function ChatHeader({ onOpenSettings, onOpenSidebar }: ChatHeaderProps) {
  const activeId = useChatStore((s) => s.activeId);
  const conversations = useChatStore((s) => s.conversations);
  const rename = useChatStore((s) => s.renameConversation);

  const conv = conversations.find((c) => c.id === activeId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const submit = async () => {
    if (!conv) return;
    const t = draft.trim();
    if (t && t !== conv.title) await rename(conv.id, t);
    setEditing(false);
  };

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b px-3 gap-2">
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {onOpenSidebar && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden size-8 shrink-0"
            onClick={onOpenSidebar}
            aria-label="Open sidebar"
          >
            <PanelLeft className="size-4" />
          </Button>
        )}
        {conv ? (
          editing ? (
            <Input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={submit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void submit();
                if (e.key === 'Escape') setEditing(false);
              }}
              className="h-7 text-sm"
            />
          ) : (
            <button
              type="button"
              className="truncate text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              onDoubleClick={() => { setDraft(conv.title); setEditing(true); }}
              title="Double-click to rename"
            >
              {conv.title}
            </button>
          )
        ) : (
          <span className="text-sm font-semibold text-foreground/60">StashChat</span>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0"
        onClick={onOpenSettings}
        aria-label="Settings"
      >
        <SettingsIcon className="size-4" />
      </Button>
    </header>
  );
}
