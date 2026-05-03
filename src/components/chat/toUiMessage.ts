import type { Message, Part } from '@/lib/db/schema';
import { deriveContentSummary } from '@/lib/db/contentSummary';

export interface UIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: Part[];
  metadata?: { requestedModel?: string; resolvedModel?: string };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizePart(p: any): Part | null {
  if (!p || typeof p.type !== 'string') return null;
  if (p.type === 'text' && typeof p.text === 'string') {
    return { type: 'text', text: p.text };
  }
  if (p.type === 'image' && typeof p.dataUrl === 'string') {
    return { type: 'image', dataUrl: p.dataUrl, mimeType: p.mimeType ?? '', width: p.width, height: p.height };
  }
  if (p.type === 'tool-call' && p.toolCallId) {
    return { type: 'tool-call', toolCallId: p.toolCallId, toolName: p.toolName ?? '', input: p.input };
  }
  if (p.type === 'tool-result' && p.toolCallId) {
    return { type: 'tool-result', toolCallId: p.toolCallId, toolName: p.toolName ?? '', output: p.output, isError: p.isError };
  }
  if (p.type === 'tool-invocation' && p.toolInvocation?.toolCallId) {
    const inv = p.toolInvocation;
    return { type: 'tool-call', toolCallId: inv.toolCallId, toolName: inv.toolName ?? '', input: inv.args };
  }
  return null; // skip step-start, reasoning, source, file, etc.
}

export function toUiMessage(m: Message): UIMessage {
  return {
    id: m.id,
    role: m.role,
    parts: m.parts,
    metadata: {
      requestedModel: m.requestedModel,
      resolvedModel: m.resolvedModel,
    },
  };
}

export function fromUiMessage(ui: UIMessage, conversationId: string): Message {
  const parts = (ui.parts as unknown[]).map(normalizePart).filter((p): p is Part => p !== null);
  const safeParts = parts.length > 0 ? parts : [{ type: 'text' as const, text: '' }];
  return {
    id: ui.id,
    conversationId,
    role: ui.role,
    parts: safeParts,
    contentSummary: deriveContentSummary(safeParts),
    timestamp: Date.now(),
    requestedModel: ui.metadata?.requestedModel,
    resolvedModel: ui.metadata?.resolvedModel,
    status: 'complete',
  };
}
