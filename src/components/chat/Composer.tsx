'use client';

import { useState } from 'react';
import type { ChatStatus } from 'ai';
import { Globe, GlobeLock, ImageIcon, Link } from 'lucide-react';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputHeader,
  PromptInputButton,
  usePromptInputAttachments,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input';
import {
  Attachments,
  Attachment,
  AttachmentPreview,
  AttachmentInfo,
  AttachmentRemove,
} from '@/components/ai-elements/attachments';
import { resizeDataUrl, MAX_PER_MESSAGE } from '@/lib/images/resize';
import { useChatStore } from '@/stores/chat';
import { ModelPicker } from './ModelPicker';
import type { Part } from '@/lib/db/schema';

function AddImageButton() {
  const { openFileDialog } = usePromptInputAttachments();
  return (
    <PromptInputButton tooltip="Add image" onClick={openFileDialog}>
      <ImageIcon className="size-4" />
    </PromptInputButton>
  );
}

function AttachmentPreviewRow() {
  const { files, remove } = usePromptInputAttachments();
  if (files.length === 0) return null;
  return (
    <PromptInputHeader>
      <Attachments variant="inline">
        {files.map((file) => (
          <Attachment key={file.id} data={file} onRemove={() => remove(file.id)}>
            <AttachmentPreview />
            <AttachmentInfo />
            <AttachmentRemove />
          </Attachment>
        ))}
      </Attachments>
    </PromptInputHeader>
  );
}

export interface ComposerProps {
  status: ChatStatus;
  onSubmit: (parts: Part[]) => Promise<void>;
  onStop: () => void;
}

export function Composer({ status, onSubmit, onStop }: ComposerProps) {
  const [webSearchDialogOpen, setWebSearchDialogOpen] = useState(false);
  const activeId = useChatStore((s) => s.activeId);
  const conversations = useChatStore((s) => s.conversations);
  const defaultModel = useChatStore((s) => s.defaultModel);
  const globalToolConfig = useChatStore((s) => s.toolConfig);
  const keyState = useChatStore((s) => s.keyState);
  const setSettingsOpen = useChatStore((s) => s.setSettingsOpen);
  const setConversationModel = useChatStore((s) => s.setConversationModel);
  const setDefaultModel = useChatStore((s) => s.setDefaultModel);
  const setConversationToolConfig = useChatStore((s) => s.setConversationToolConfig);
  const setToolConfig = useChatStore((s) => s.setToolConfig);

  const activeConv = activeId ? conversations.find((c) => c.id === activeId) : undefined;
  const currentModel = activeConv?.defaultModel ?? defaultModel;
  const toolConfig = activeConv?.defaultToolConfig ?? globalToolConfig;

  const handleModelSelect = (modelId: string) => {
    if (activeId) {
      void setConversationModel(activeId, modelId);
    } else {
      setDefaultModel(modelId);
    }
  };

  const toggleWebSearch = () => {
    if (keyState !== 'configured') { setWebSearchDialogOpen(true); return; }
    const next = { ...toolConfig, webSearch: !toolConfig.webSearch };
    if (activeId) void setConversationToolConfig(activeId, next);
    else setToolConfig(next);
  };

  const toggleUrlFetch = () => {
    const next = { ...toolConfig, urlFetch: !toolConfig.urlFetch };
    if (activeId) void setConversationToolConfig(activeId, next);
    else setToolConfig(next);
  };

  const handleSubmit = async ({ text, files }: PromptInputMessage) => {
    const parts: Part[] = [];
    if (text.trim()) parts.push({ type: 'text', text: text.trim() });
    for (const file of files) {
      if (file.mediaType?.startsWith('image/') && file.url) {
        try {
          const resized = await resizeDataUrl(file.url);
          parts.push({
            type: 'image',
            dataUrl: resized.dataUrl,
            mimeType: resized.mimeType,
            width: resized.width,
            height: resized.height,
          });
        } catch { /* skip */ }
      }
    }
    if (parts.length === 0) return;
    await onSubmit(parts);
  };

  return (
    <div className="px-4 pb-4 pt-2 max-w-3xl mx-auto w-full">
      <PromptInput
        accept="image/*"
        multiple
        maxFiles={MAX_PER_MESSAGE}
        maxFileSize={25 * 1024 * 1024}
        onSubmit={handleSubmit}
      >
        <AttachmentPreviewRow />
        <PromptInputTextarea placeholder="Message StashChat…" />
        <PromptInputFooter>
          <div className="flex items-center gap-0.5">
            <AddImageButton />
              <PromptInputButton
                tooltip={keyState==='configured' ? "Web search" : "Web search (Locked)"}
                onClick={toggleWebSearch}
                className={toolConfig.webSearch ? 'text-primary bg-muted dark:bg-muted/50' : ''}
                aria-pressed={toolConfig.webSearch}
                >
                {keyState==='configured' ? <Globe className="size-4" /> : 
                <GlobeLock className="size-4" />}
            </PromptInputButton>
            <PromptInputButton
              tooltip="URL fetch"
              onClick={toggleUrlFetch}
              className={toolConfig.urlFetch ? 'text-primary bg-muted dark:bg-muted/50' : ''}
              aria-pressed={toolConfig.urlFetch}
            >
              <Link className="size-4" />
            </PromptInputButton>
              <ModelPicker currentModel={currentModel} onSelect={handleModelSelect} restricted={keyState !== 'configured'} />
          </div>
          <PromptInputSubmit status={status} onStop={onStop} />
        </PromptInputFooter>
      </PromptInput>

      <AlertDialog open={webSearchDialogOpen} onOpenChange={setWebSearchDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Web search requires your API key</AlertDialogTitle>
            <AlertDialogDescription>
              Web search is only available when you use your own OpenRouter API key. Add your key in settings to unlock this feature.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setWebSearchDialogOpen(false); setSettingsOpen(true); }}>
              Go to Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
