'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChatStore } from '@/stores/chat';
import { keyErrorMessage } from './keyErrorMessage';

export function SetupScreen() {
  const saveKey = useChatStore((s) => s.saveKey);
  const [key, setKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    const trimmed = key.trim();
    if (!trimmed) {
      setError("That doesn't look like an OpenRouter key.");
      return;
    }
    setBusy(true);
    try { await saveKey(trimmed); }
    catch (e) { setError(keyErrorMessage(e)); }
    finally { setBusy(false); }
  };

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-md space-y-4 rounded-lg border bg-card p-6 shadow-sm">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome to StashChat</h1>
          <p className="text-sm text-muted-foreground">
            Bring your own OpenRouter API key — we encrypt it server-side and never store it in your browser.
          </p>
        </header>
        <label className="block text-sm space-y-1">
          <span>API key</span>
          <Input
            type="password"
            autoComplete="off"
            placeholder="sk-or-v1-…"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void submit(); }}
          />
        </label>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button onClick={submit} disabled={busy} className="w-full">
          {busy ? 'Saving…' : 'Save and continue'}
        </Button>
        <p className="text-xs text-muted-foreground">
          Don't have a key?{' '}
          <a className="underline" href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">
            Get one from OpenRouter
          </a>
          .
        </p>
      </div>
    </main>
  );
}
