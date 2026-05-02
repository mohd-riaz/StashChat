import { openDb } from './schema';

export async function get<T>(key: string): Promise<T | undefined> {
  const db = await openDb();
  const row = (await db.get('meta', key)) as { key: string; value: T } | undefined;
  return row?.value;
}

export async function put<T>(key: string, value: T): Promise<void> {
  const db = await openDb();
  await db.put('meta', { key, value });
}

async function _delete(key: string): Promise<void> {
  const db = await openDb();
  await db.delete('meta', key);
}
export { _delete as delete };
