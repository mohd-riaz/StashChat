'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import type { Conversation } from '@/lib/db/schema';

export function ConversationItem({
  conv, active, onSelect, onRename, onDelete,
}: {
  conv: Conversation;
  active: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
}) {

  return (
    <div
      className={`group flex items-center rounded-md transition-colors ${
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(conv.id)}
        className="flex-1 truncate text-left px-2 py-2 text-sm leading-tight"
      >
        {conv.title}
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-7 mr-1 opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
              aria-label="More options"
            >
              <MoreHorizontal className="size-3.5" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onRename(conv.id)}>Rename</DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(conv.id)}
            className="text-destructive focus:text-destructive"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
