'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useChatStore } from '@/stores/chat';
import { AppSidebar } from '@/components/sidebar/Sidebar';
import { ChatPane } from '@/components/chat/ChatPane';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { SetupScreen } from '@/components/setup/SetupScreen';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Toaster, toast } from 'sonner';
import { useTheme } from 'next-themes';

function ChatPage() {
  const conversations = useChatStore((s) => s.conversations);
  const activeId = useChatStore((s) => s.activeId);
  const keyState = useChatStore((s) => s.keyState);
  const hydrate = useChatStore((s) => s.hydrate);
  const refreshKeyStatus = useChatStore((s) => s.refreshKeyStatus);
  const setActive = useChatStore((s) => s.setActive);
  const newConversation = useChatStore((s) => s.newConversation);
  const renameConversation = useChatStore((s) => s.renameConversation);
  const deleteConversation = useChatStore((s) => s.deleteConversation);
  const settingsOpen = useChatStore((s) => s.settingsOpen);
  const setSettingsOpen = useChatStore((s) => s.setSettingsOpen);

  const { resolvedTheme } = useTheme();
  const toasterTheme = (resolvedTheme === 'dark' ? 'dark' : 'light') as 'light' | 'dark';

  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [hydrated, setHydrated] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSyncDone = useRef(false);

  useEffect(() => {
    void hydrate().then(() => setHydrated(true));
    void refreshKeyStatus();
  }, [hydrate, refreshKeyStatus]);


  // URL → store: once after hydration, adopt ?c=<id> if it points to a real conversation.
  useEffect(() => {
    if (initialSyncDone.current || !hydrated) return;
    const urlId = searchParams.get('c');
    if (urlId && conversations.some((c) => c.id === urlId)) {
      void setActive(urlId);
    }
    initialSyncDone.current = true;
  }, [hydrated, conversations, searchParams, setActive]);

  // store → URL: keep ?c=<id> in sync with activeId after initial sync.
  useEffect(() => {
    if (!initialSyncDone.current) return;
    const current = searchParams.get('c');
    if (activeId && current !== activeId) {
      router.replace(`?c=${activeId}`);
    } else if (!activeId && current) {
      router.replace('/chat');
    }
  }, [activeId, searchParams, router]);

  if (keyState === 'unknown') {
    return (
      <main className="min-h-dvh grid place-items-center">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </main>
    );
  }

  if (keyState === 'unconfigured') {
    return (
      <>
        <SetupScreen />
        <Toaster theme={toasterTheme} position="top-center" />
      </>
    );
  }

  const handleRename = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    setRenameDraft(conv?.title ?? '');
    setRenameTarget(id);
  };

  const submitRename = async () => {
    if (renameTarget && renameDraft.trim()) {
      await renameConversation(renameTarget, renameDraft.trim());
    }
    setRenameTarget(null);
  };

  const submitDelete = async () => {
    if (pendingDelete) {
      try {
        await deleteConversation(pendingDelete);
        toast.success('Conversation deleted');
      } catch {
        toast.error('Failed to delete conversation');
      }
    }
    setPendingDelete(null);
  };

  return (
    <SidebarProvider>
      <AppSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={(id) => { void setActive(id); }}
        onNew={() => { void newConversation(); }}
        onRename={handleRename}
        onDelete={(id) => setPendingDelete(id)}
      />
      <SidebarInset className="flex flex-col h-dvh overflow-hidden">
        <ChatPane onOpenSettings={() => setSettingsOpen(true)} />
      </SidebarInset>

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <AlertDialog open={!!pendingDelete} onOpenChange={(o: boolean) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the conversation and its messages from your browser.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={submitDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

        <AlertDialog open={!!renameTarget} onOpenChange={(o: boolean) => !o && setRenameTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Rename conversation</AlertDialogTitle>
            </AlertDialogHeader>
            <input
              className="w-full border rounded px-2 py-1"
              value={renameDraft}
              onChange={(e) => setRenameDraft(e.target.value)}
              autoFocus
              aria-label="New title"
            />
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setRenameTarget(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={submitRename}>Save</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      <Toaster theme={toasterTheme} richColors position="top-center" />
    </SidebarProvider>
  );
}

export default function Home() {
  return (
    <Suspense>
      <ChatPage />
    </Suspense>
  );
}
