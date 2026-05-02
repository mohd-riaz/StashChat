import { create } from 'zustand';
import * as conversationsRepo from '@/lib/db/conversations';
import * as messagesRepo from '@/lib/db/messages';
import type { Conversation, Message, ToolConfig } from '@/lib/db/schema';

export type KeyState = 'unknown' | 'configured' | 'unconfigured';
export type ThemeMode = 'light' | 'dark' | 'system';

export class SaveKeyError extends Error {
  constructor(public readonly code: string, message?: string) {
    super(message ?? code);
    this.name = 'SaveKeyError';
  }
}

export const DEFAULT_MODEL_FALLBACK = 'openrouter/free';
const NO_TOOLS: ToolConfig = { webSearch: false, urlFetch: false };

const LS = {
  defaultModel: 'stashchat:default-model',
  theme: 'stashchat:theme',
  toolConfig: 'stashchat:tool-config',
} as const;

export interface ChatState {
  conversations: Conversation[];
  activeId: string | null;
  keyState: KeyState;
  defaultModel: string;
  theme: ThemeMode;
  toolConfig: ToolConfig;

  hydrate: () => Promise<void>;
  refreshKeyStatus: () => Promise<void>;
  saveKey: (apiKey: string) => Promise<void>;
  forgetKey: () => Promise<void>;

  setActive: (id: string | null) => Promise<void>;
  newConversation: () => Promise<void>;
  renameConversation: (id: string, title: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;

  setDefaultModel: (m: string) => void;
  setTheme: (t: ThemeMode) => void;
  setToolConfig: (cfg: ToolConfig) => void;
  setConversationToolConfig: (id: string, cfg: ToolConfig | undefined) => Promise<void>;

  resolveModel: (conversationId: string | null, override?: string) => string;
  resolveToolConfig: (conversationId: string | null) => ToolConfig;
}

const initial = {
  conversations: [] as Conversation[],
  activeId: null as string | null,
  keyState: 'unknown' as KeyState,
  defaultModel: DEFAULT_MODEL_FALLBACK,
  theme: 'system' as ThemeMode,
  toolConfig: NO_TOOLS,
};

function readToolConfig(): ToolConfig {
  if (typeof localStorage === 'undefined') return NO_TOOLS;
  const raw = localStorage.getItem(LS.toolConfig);
  if (!raw) return NO_TOOLS;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.webSearch === 'boolean' && typeof parsed?.urlFetch === 'boolean') {
      return parsed as ToolConfig;
    }
  } catch { /* fall through */ }
  return NO_TOOLS;
}

export const useChatStore = create<ChatState>((set, get) => ({
  ...initial,

  hydrate: async () => {
    const conversations = await conversationsRepo.list();
    let defaultModel = DEFAULT_MODEL_FALLBACK;
    let theme: ThemeMode = 'system';
    if (typeof localStorage !== 'undefined') {
      defaultModel = localStorage.getItem(LS.defaultModel) ?? DEFAULT_MODEL_FALLBACK;
      const t = localStorage.getItem(LS.theme);
      if (t === 'light' || t === 'dark' || t === 'system') theme = t;
    }
    set({ conversations, defaultModel, theme, toolConfig: readToolConfig() });
  },

  refreshKeyStatus: async () => {
    try {
      const res = await fetch('/api/key/status', { method: 'GET' });
      if (!res.ok) { set({ keyState: 'unconfigured' }); return; }
      const body = (await res.json()) as { configured: boolean };
      set({ keyState: body.configured ? 'configured' : 'unconfigured' });
    } catch {
      set({ keyState: 'unconfigured' });
    }
  },

  saveKey: async (apiKey) => {
    let res: Response;
    try {
      res = await fetch('/api/key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });
    } catch {
      throw new SaveKeyError('network');
    }
    if (res.ok) { set({ keyState: 'configured' }); return; }
    let code = 'unknown';
    try {
      const body = await res.json();
      if (typeof body?.error === 'string') code = body.error;
    } catch { /* keep default */ }
    throw new SaveKeyError(code);
  },

  forgetKey: async () => {
    try {
      await fetch('/api/key', { method: 'DELETE' });
    } catch { /* swallow — wipe locally anyway */ }
    set({ keyState: 'unconfigured' });
  },

  setActive: async (id) => {
    set({ activeId: id });
  },

  newConversation: async () => {
    const c = await conversationsRepo.create('New chat');
    set({ conversations: await conversationsRepo.list(), activeId: c.id });
  },

  renameConversation: async (id, title) => {
    await conversationsRepo.rename(id, title);
    set({ conversations: await conversationsRepo.list() });
  },

  deleteConversation: async (id) => {
    await conversationsRepo.remove(id);
    const conversations = await conversationsRepo.list();
    const wasActive = get().activeId === id;
    set({ conversations, activeId: wasActive ? null : get().activeId });
  },

  setDefaultModel: (m) => {
    set({ defaultModel: m });
    if (typeof localStorage !== 'undefined') localStorage.setItem(LS.defaultModel, m);
  },

  setTheme: (t) => {
    set({ theme: t });
    if (typeof localStorage !== 'undefined') localStorage.setItem(LS.theme, t);
  },

  setToolConfig: (cfg) => {
    set({ toolConfig: cfg });
    if (typeof localStorage !== 'undefined') localStorage.setItem(LS.toolConfig, JSON.stringify(cfg));
  },

  setConversationToolConfig: async (id, cfg) => {
    await conversationsRepo.setDefaultToolConfig(id, cfg);
    set({ conversations: await conversationsRepo.list() });
  },

  resolveModel: (conversationId, override) => {
    if (override) return override;
    const conv = conversationId ? get().conversations.find((c) => c.id === conversationId) : undefined;
    return conv?.defaultModel ?? get().defaultModel ?? DEFAULT_MODEL_FALLBACK;
  },

  resolveToolConfig: (conversationId) => {
    const conv = conversationId ? get().conversations.find((c) => c.id === conversationId) : undefined;
    return conv?.defaultToolConfig ?? get().toolConfig ?? NO_TOOLS;
  },
}));

export function resetChatStoreForTests(): void {
  useChatStore.setState({ ...initial });
}

export async function persistUserMessage(message: Message): Promise<void> {
  await messagesRepo.appendUser(message);
}
