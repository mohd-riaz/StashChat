'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { keyErrorMessage } from '@/components/setup/keyErrorMessage';

export interface KeyPanelProps {
  onSave: (apiKey: string) => Promise<void>;
  onForget: () => Promise<void>;
}

export function KeyPanel({ onSave, onForget }: KeyPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [key, setKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    const trimmed = key.trim();
    if (!trimmed) { setError("That doesn't look like an OpenRouter key."); return; }
    setBusy(true);
    try {
      await onSave(trimmed);
      setKey('');
      setShowForm(false);
    } catch (e) {
      setError(keyErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Your OpenRouter key is encrypted. It never enters your browser&apos;s storage.
      </p>

      {!showForm ? (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowForm(true)}>Replace key</Button>
          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="destructive">Forget my key</Button>}
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Forget your OpenRouter key?</AlertDialogTitle>
                <AlertDialogDescription>
                  This signs you out. You&apos;ll need your OpenRouter key to chat again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => void onForget()}>Forget</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-sm space-y-1 block">
            <span>API key</span>
            <Input
              type="password"
              autoComplete="off"
              placeholder="sk-or-v1-…"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void submit(); }}
              autoFocus
            />
          </label>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => { setShowForm(false); setError(null); setKey(''); }}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
