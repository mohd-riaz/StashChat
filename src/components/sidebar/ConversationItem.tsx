'use client';

import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { SidebarMenuButton, SidebarMenuAction } from '@/components/ui/sidebar';
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
    <>
      <SidebarMenuButton
        isActive={active}
        onClick={() => onSelect(conv.id)}
        tooltip={conv.title}
      >
        <span>{conv.title}</span>
      </SidebarMenuButton>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuAction showOnHover aria-label="More options">
              <MoreHorizontal className="size-3.5" />
            </SidebarMenuAction>
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
    </>
  );
}
