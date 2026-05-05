'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { KeyPanel } from './KeyPanel';
import { ModelPanel } from './ModelPanel';
import { ToolsPanel } from './ToolsPanel';
import { useChatStore } from '@/stores/chat';
import { useTheme } from 'next-themes';

export function SettingsDialog({
  open, onClose,
}: { open: boolean; onClose: () => void }) {
  const saveKey = useChatStore((s) => s.saveKey);
  const forgetKey = useChatStore((s) => s.forgetKey);
  const [tab, setTab] = useState('key');

  const onSaveKey = async (apiKey: string) => {
    await saveKey(apiKey);
    toast.success('API key saved');
    onClose();
  };

  const onForget = async () => { await forgetKey(); toast.success('API key removed'); onClose(); };

  const {theme, setTheme} = useTheme()

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="key">Key</TabsTrigger>
            <TabsTrigger value="model">Model</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          <TabsContent value="key" className="pt-4"><KeyPanel onSave={onSaveKey} onForget={onForget} /></TabsContent>
          <TabsContent value="model" className="pt-4"><ModelPanel onGoToKey={() => setTab('key')} /></TabsContent>
          <TabsContent value="tools" className="pt-4"><ToolsPanel onGoToKey={() => setTab('key')} /></TabsContent>
          <TabsContent value="theme" className="pt-4 space-y-3">
            <p className="text-sm text-muted-foreground">Choose how StashChat appears.</p>
            <ButtonGroup>
              {(['light', 'dark', 'system'] as const).map((t) => (
                <Button
                  key={t}
                  variant={t===theme ? "default" : "outline"}
                  size="sm"
                  className="capitalize"
                  onClick={()=>setTheme(t)}
                >
                  {t}
                </Button>
              ))}
            </ButtonGroup>
          </TabsContent>
          <TabsContent value="about" className="pt-4 text-sm space-y-2">
            <p>StashChat — your conversations live in your browser. Your key is encrypted server-side and never enters your browser&apos;s storage.</p>
            <p>
              <a className="underline" href="https://openrouter.ai/activity" target="_blank" rel="noopener noreferrer">
                OpenRouter Activity
              </a>
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
