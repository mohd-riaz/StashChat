'use client';

import { useState } from 'react';
import { Copy, Check, MoveRight } from 'lucide-react';
import { ModelSelectorLogo } from '@/components/ai-elements/model-selector';
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
import Image from 'next/image';

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

  const shortName = (id: string) => id.split('/').pop() ?? id;
  const providerSlug = (id: string) => id.split('/')[0] ?? 'openrouter';

  return (
    <MessageEl from={message.role as 'user' | 'assistant'}>
      {!isUser && !(message.resolvedModel ?? message.requestedModel) && isStreaming && (
        <div className="mb-1.5 flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-muted-foreground animate-pulse" />
          <div className="h-3 w-24 rounded bg-muted-foreground animate-pulse" />
        </div>
      )}
      {!isUser && (message.resolvedModel ?? message.requestedModel) && (
        <div className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          {message.requestedModel && message.resolvedModel && message.requestedModel !== message.resolvedModel ? (
            <>
            <div className='flex items-center gap-1'>
              <ModelSelectorLogo provider={providerSlug(message.requestedModel)} className="size-3 shrink-0 opacity-50" />
              <span>{shortName(message.requestedModel)}</span>
            </div>
              <MoveRight className="size-3 shrink-0" />
            <div className='flex items-center gap-1'>
              <ModelSelectorLogo provider={providerSlug(message.resolvedModel)} className="size-3 shrink-0 opacity-50" />
              <span>{shortName(message.resolvedModel)}</span>
            </div>
            </>
          ) : (
            <div className='flex items-center gap-1'>
              <ModelSelectorLogo provider={providerSlug(message.resolvedModel ?? message.requestedModel ?? '')} className="size-3 shrink-0 opacity-50" />
              <span>{shortName(message.resolvedModel ?? message.requestedModel ?? '')}</span>
            </div>
          )}
        </div>
      )}
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
                <Image
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
