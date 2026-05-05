'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import * as messagesRepo from '@/lib/db/messages';
import * as conversationsRepo from '@/lib/db/conversations';
import { useChatStore, persistUserMessage } from '@/stores/chat';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { Composer } from './Composer';
import { fromUiMessage, toUiMessage, type UIMessage } from './toUiMessage';
import type { Part } from '@/lib/db/schema';
import { deriveContentSummary } from '@/lib/db/contentSummary';

export function ChatPane({
  onOpenSettings,
}: { onOpenSettings: () => void }) {
  const activeId = useChatStore((s) => s.activeId);
  const newConversation = useChatStore((s) => s.newConversation);
  const [pendingParts, setPendingParts] = useState<Part[] | null>(null);
  const sendingRef = useRef(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const opts: any = {
    id: activeId ?? 'no-conversation',
    api: '/api/chat',
    onFinish: ({ message }: { message: unknown }) => {
      const id = useChatStore.getState().activeId;
      if (!id) return;
      const stored = fromUiMessage(message as UIMessage, id);
      void messagesRepo.upsert(id, stored);
      void conversationsRepo.touch(id);
    },
    onError: (err: Error) => {
      if (/no_key/.test(err?.message ?? '')) {
        useChatStore.setState({ keyState: 'unconfigured' });
      }
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { messages, sendMessage, status, stop, setMessages } = useChat(opts) as any;

  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    void messagesRepo.listByConversation(activeId)
      .then((rows) => setMessages(rows.map(toUiMessage) as never));
  }, [activeId, setMessages]);

  // Send pending message once a conversation is active (created by onSubmit below).
  useEffect(() => {
    if (!pendingParts || !activeId || sendingRef.current) return;
    sendingRef.current = true;
    const parts = pendingParts;
    setPendingParts(null);
    void (async () => {
      const userMsg = {
        id: crypto.randomUUID(),
        conversationId: activeId,
        role: 'user' as const,
        parts,
        contentSummary: deriveContentSummary(parts),
        timestamp: Date.now(),
      };
      await persistUserMessage(userMsg);
      const { resolveModel, resolveToolConfig } = useChatStore.getState();
      await sendMessage({ parts }, {
        body: {
          model: resolveModel(activeId),
          toolConfig: resolveToolConfig(activeId),
        },
      });
      sendingRef.current = false;
    })();
  }, [activeId, pendingParts, sendMessage]);

  const onSubmit = async (parts: Part[]) => {
    if (!activeId) {
      await newConversation();
      setPendingParts(parts);
      return;
    }
    const userMsg = {
      id: crypto.randomUUID(),
      conversationId: activeId,
      role: 'user' as const,
      parts,
      contentSummary: deriveContentSummary(parts),
      timestamp: Date.now(),
    };
    await persistUserMessage(userMsg);
    const { resolveModel, resolveToolConfig } = useChatStore.getState();
    await sendMessage({ parts }, {
      body: {
        model: resolveModel(activeId),
        toolConfig: resolveToolConfig(activeId),
      },
    });
  };

  const streaming = status === 'streaming' || status === 'submitted';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storedMessages = (messages as any[]).map((m) =>
    fromUiMessage(m as UIMessage, activeId ?? ''),
  );

  return (
    <div className="flex flex-1 flex-col h-dvh">
      <ChatHeader onOpenSettings={onOpenSettings} />
      <MessageList messages={storedMessages} streaming={streaming} />
      <Composer status={status} onSubmit={onSubmit} onStop={stop} />
    </div>
  );
}
