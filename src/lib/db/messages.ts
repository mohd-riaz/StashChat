import { openDb } from './schema';
import type { Message } from './schema';

export async function listByConversation(conversationId: string): Promise<Message[]> {
  const db = await openDb();
  const all = await db.getAllFromIndex('messages', 'byConversationId', conversationId);
  return (all as Message[]).sort((a, b) => a.timestamp - b.timestamp);
}

export async function appendUser(message: Message): Promise<void> {
  const db = await openDb();
  await db.put('messages', message);
}

// _conversationId accepted for API symmetry — row already carries conversationId.
export async function upsert(_conversationId: string, message: Message): Promise<void> {
  const db = await openDb();
  await db.put('messages', message);
}

export async function remove(id: string): Promise<void> {
  const db = await openDb();
  await db.delete('messages', id);
}
