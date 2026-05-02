import { openDB, type IDBPDatabase } from 'idb';

export const DB_NAME = 'stashchat';
export const DB_VERSION = 2;

export type Part =
  | { type: 'text'; text: string }
  | { type: 'image'; dataUrl: string; mimeType: string; width?: number; height?: number }
  | { type: 'tool-call'; toolCallId: string; toolName: string; input: unknown }
  | { type: 'tool-result'; toolCallId: string; toolName: string; output: unknown; isError?: boolean };

export interface ToolConfig {
  webSearch: boolean;
  webSearchParams?: {
    engine?: 'auto' | 'native' | 'exa' | 'firecrawl' | 'parallel';
    max_results?: number;
    search_context_size?: 'low' | 'medium' | 'high';
    allowed_domains?: string[];
    excluded_domains?: string[];
  };
  urlFetch: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  defaultModel?: string;
  defaultToolConfig?: ToolConfig;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  parts: Part[];
  contentSummary: string;
  timestamp: number;
  requestedModel?: string;
  resolvedModel?: string;
  status?: 'streaming' | 'complete' | 'aborted' | 'error';
  errorMessage?: string;
  metadata?: { promptTokens?: number; completionTokens?: number; latencyMs?: number };
}

export type StashDb = IDBPDatabase<unknown>;

export async function openDb(): Promise<StashDb> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, _newVersion, tx) {
      if (oldVersion < 1) {
        const conv = db.createObjectStore('conversations', { keyPath: 'id' });
        conv.createIndex('byUpdatedAt', 'updatedAt');
        const msg = db.createObjectStore('messages', { keyPath: 'id' });
        msg.createIndex('byConversationId', 'conversationId');
      }
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' });
        }
        // Migrate every v1 messages row.
        const store = tx.objectStore('messages');
        store.openCursor().then(async function migrateCursor(cursor): Promise<void> {
          while (cursor) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const row: any = cursor.value;
            if ('content' in row && !('parts' in row)) {
              const content: string = row.content ?? '';
              row.parts = [{ type: 'text', text: content }];
              row.contentSummary = content.slice(0, 160).trim();
              delete row.content;
              await cursor.update(row);
            }
            cursor = await cursor.continue();
          }
        });
      }
    },
  });
}
