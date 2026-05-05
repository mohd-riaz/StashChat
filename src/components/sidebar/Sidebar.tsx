'use client';

import { useMemo, useState } from 'react';
import { Bot, SquarePen, Search } from 'lucide-react';
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInput,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ConversationItem } from './ConversationItem';
import type { Conversation } from '@/lib/db/schema';
import stashChatLight from '../../../public/stash-chat-light.svg'
import stashChatDark from '../../../public/stash-chat-dark.svg'
import Image from 'next/image';
import { useTheme } from 'next-themes';

export interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
}

function SearchDialog({ open, onClose, conversations, activeId, onSelect }: {
  open: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!filter.trim()) return sorted;
    const q = filter.toLowerCase();
    return sorted.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, filter]);

  const handleSelect = (id: string) => {
    onSelect(id);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md gap-3">
        <DialogHeader>
          <DialogTitle>Search conversations</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            autoFocus
            placeholder="Search…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="overflow-y-auto max-h-72 flex flex-col gap-0.5">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No conversations found</p>
          )}
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleSelect(c.id)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                c.id === activeId
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-muted',
              )}
            >
              {c.title}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SidebarContents({ conversations, activeId, onSelect, onNew, onRename, onDelete }: SidebarProps) {
  const { state, isMobile } = useSidebar();
  const collapsed = !isMobile && state === 'collapsed';
  const [filter, setFilter] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const {resolvedTheme} = useTheme()

  const filtered = useMemo(() => {
    const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!filter.trim()) return sorted;
    const q = filter.toLowerCase();
    return sorted.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, filter]);

  return (
    <>
      <SidebarHeader className="gap-2 p-2">
        <SidebarMenuButton tooltip="New chat" className="font-semibold pointer-events-none">
          {/* <Bot className="size-4 shrink-0" /> */}
          <Image src={resolvedTheme==='dark' ? stashChatDark : stashChatLight} alt='StashChat' className='size-4 shrink-0 translate-y-[0.05rem]'/>
          <span>
            Stash<span className='text-primary'>
              Chat
            </span>
          </span>
        </SidebarMenuButton>

        <SidebarMenuButton onClick={onNew} tooltip="New chat" className="font-normal">
          <SquarePen className="size-4 shrink-0" />
          <span>New chat</span>
        </SidebarMenuButton>

        {/* Search — cross-fade between icon button (collapsed) and input (expanded) */}
        <div className="relative h-8">
          <div className={cn('absolute inset-0 transition-opacity duration-200', collapsed ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}>
            <SidebarMenuButton onClick={() => setSearchOpen(true)} tooltip="Search conversations" className="font-normal h-full">
              <Search className="size-4 shrink-0" />
            </SidebarMenuButton>
          </div>
          <div className={cn('absolute inset-0 px-1 transition-opacity duration-200', collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto')}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <SidebarInput
              placeholder="Search…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-8 h-full"
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className={cn('transition-opacity duration-200', collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100')}>
        <SidebarMenu className="px-2 pb-2">
          {filtered.length === 0 && conversations.length === 0 && (
            <li className="text-xs text-muted-foreground px-2 py-3 text-center list-none">
              No conversations yet
            </li>
          )}
          {filtered.length === 0 && conversations.length > 0 && (
            <li className="text-xs text-muted-foreground px-2 py-2 list-none">No matches</li>
          )}
          {filtered.map((c) => (
            <SidebarMenuItem key={c.id}>
              <ConversationItem
                conv={c}
                active={c.id === activeId}
                onSelect={onSelect}
                onRename={onRename}
                onDelete={onDelete}
              />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        conversations={conversations}
        activeId={activeId}
        onSelect={onSelect}
      />
    </>
  );
}

export function AppSidebar(props: SidebarProps) {
  return (
    <SidebarPrimitive collapsible="icon">
      <SidebarContents {...props} />
    </SidebarPrimitive>
  );
}
