'use client';

import { MessageSquare } from 'lucide-react';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message } from './Message';
import type { Message as MessageType } from '@/lib/db/schema';

interface Props {
  messages: MessageType[];
  streaming: boolean;
}

export function MessageList({ messages, streaming }: Props) {
  return (
    <Conversation className="flex-1">
      <ConversationContent className="max-w-3xl mx-auto w-full">
        {messages.length === 0 ? (
          <ConversationEmptyState
            title="How can I help you?"
            description="Start a conversation, attach images, or enable web search from the toolbar."
            icon={<MessageSquare className="size-8" />}
          />
        ) : (
          messages.map((msg, idx) => (
            <Message
              key={msg.id}
              message={msg}
              isStreaming={
                streaming &&
                idx === messages.length - 1 &&
                msg.role === 'assistant'
              }
            />
          ))
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
