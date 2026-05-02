import { openDb } from './schema';
import type { Conversation, ToolConfig } from './schema';

export async function list(): Promise<Conversation[]> {
  const db = await openDb();
  const all = await db.getAllFromIndex('conversations', 'byUpdatedAt');
  return (all as Conversation[]).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function create(title: string): Promise<Conversation> {
  const now = Date.now();
  const c: Conversation = {
    id: crypto.randomUUID(),
    title,
    createdAt: now,
    updatedAt: now,
  };
  const db = await openDb();
  await db.put('conversations', c);
  return c;
}

export async function rename(id: string, title: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction('conversations', 'readwrite');
  const row = (await tx.store.get(id)) as Conversation | undefined;
  if (!row) return;
  row.title = title;
  row.updatedAt = Date.now();
  await tx.store.put(row);
  await tx.done;
}

export async function touch(id: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction('conversations', 'readwrite');
  const row = (await tx.store.get(id)) as Conversation | undefined;
  if (!row) return;
  row.updatedAt = Date.now();
  await tx.store.put(row);
  await tx.done;
}

export async function remove(id: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(['conversations', 'messages'], 'readwrite');
  await tx.objectStore('conversations').delete(id);
  const idx = tx.objectStore('messages').index('byConversationId');
  for await (const cursor of idx.iterate(id)) {
    await cursor.delete();
  }
  await tx.done;
}

export async function setDefaultToolConfig(id: string, cfg: ToolConfig | undefined): Promise<void> {
  const db = await openDb();
  const tx = db.transaction('conversations', 'readwrite');
  const row = (await tx.store.get(id)) as Conversation | undefined;
  if (!row) return;
  if (cfg === undefined) delete row.defaultToolConfig;
  else row.defaultToolConfig = cfg;
  row.updatedAt = Date.now();
  await tx.store.put(row);
  await tx.done;
}
