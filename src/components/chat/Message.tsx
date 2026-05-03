'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import {
  Message as MessageEl,
  MessageContent,
  MessageActions,
  MessageAction,
  MessageResponse,
  MessageToolbar,
} from '@/components/ai-elements/message';
import { ImageLightbox } from './ImageLightbox';
import { ToolCallStep, pairToolParts } from './ToolCallSteps';
import type { Message as MessageType, Part } from '@/lib/db/schema';

export function Message({
  message,
  isStreaming = false,
}: {
  message: MessageType;
  isStreaming?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const isUser = message.role === 'user';

  const textContent = message.parts
    .filter((p): p is Extract<Part, { type: 'text' }> => p.type === 'text')
    .map((p) => p.text)
    .join('\n\n');

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  };

  return (
    <MessageEl from={message.role as 'user' | 'assistant'}>
      <MessageContent>
        {pairToolParts(message.parts).map((item, i) => {
          if ('call' in (item as object) && (item as { call?: unknown }).call) {
            return <ToolCallStep key={i} pair={item as never} />;
          }
          const part = item as Part;
          if (part.type === 'text') {
            return (
              <MessageResponse key={i} isAnimating={isStreaming}>
                {part.text}
              </MessageResponse>
            );
          }
          if (part.type === 'image') {
            return (
              <button
                key={i}
                type="button"
                className="block"
                onClick={() => setLightboxSrc(part.dataUrl)}
                aria-label="View image"
              >
                <img
                  src={part.dataUrl}
                  alt=""
                  width={part.width}
                  height={part.height}
                  loading="lazy"
                  className="rounded-md max-h-80 w-auto"
                />
              </button>
            );
          }
          return null;
        })}
      </MessageContent>

      {!isUser && (
        <MessageToolbar>
          <MessageActions>
            <MessageAction
              tooltip={copied ? 'Copied' : 'Copy'}
              onClick={onCopy}
            >
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            </MessageAction>
          </MessageActions>
          {(message.resolvedModel ?? message.requestedModel) && (
            <span className="text-xs text-muted-foreground">
              {message.resolvedModel ?? message.requestedModel}
            </span>
          )}
        </MessageToolbar>
      )}

      <ImageLightbox
        open={!!lightboxSrc}
        src={lightboxSrc}
        onClose={() => setLightboxSrc(null)}
      />
    </MessageEl>
  );
}
