'use client';

import { useEffect, useState } from 'react';
import { useChatStore } from '@/stores/chat';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { ChatPane } from '@/components/chat/ChatPane';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { SetupScreen } from '@/components/setup/SetupScreen';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Toaster, toast } from 'sonner';

export default function Home() {
  const conversations = useChatStore((s) => s.conversations);
  const activeId = useChatStore((s) => s.activeId);
  const keyState = useChatStore((s) => s.keyState);
  const hydrate = useChatStore((s) => s.hydrate);
  const refreshKeyStatus = useChatStore((s) => s.refreshKeyStatus);
  const setActive = useChatStore((s) => s.setActive);
  const newConversation = useChatStore((s) => s.newConversation);
  const renameConversation = useChatStore((s) => s.renameConversation);
  const deleteConversation = useChatStore((s) => s.deleteConversation);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    void hydrate();
    void refreshKeyStatus();
  }, [hydrate, refreshKeyStatus]);

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
        <Toaster richColors position="top-center" />
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

  const sidebar = (
    <Sidebar
      conversations={conversations}
      activeId={activeId}
      onSelect={(id) => { void setActive(id); setSidebarOpen(false); }}
      onNew={() => { void newConversation(); setSidebarOpen(false); }}
      onRename={handleRename}
      onDelete={(id) => setPendingDelete(id)}
    />
  );

  return (
    <div className="flex h-dvh w-full">
      <div className="hidden md:block">{sidebar}</div>
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72">
          {sidebar}
        </SheetContent>
      </Sheet>

      <main className="flex flex-1 min-w-0">
        <ChatPane
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      </main>

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

      {renameTarget && (
        <AlertDialog open onOpenChange={(o: boolean) => !o && setRenameTarget(null)}>
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
      )}

      <Toaster richColors position="top-center" />
    </div>
  );
}
