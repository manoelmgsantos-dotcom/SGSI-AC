import { type PoolClient } from 'pg';
import { pool, type Collection } from './database.ts';

export async function replaceCollectionBatch(
  client: PoolClient,
  collection: Collection,
  items: unknown[],
  fallbackPrefix?: string,
): Promise<number> {
  await client.query('DELETE FROM grc_records WHERE collection = $1', [collection]);
  if (!Array.isArray(items) || items.length === 0) return 0;

  const recordIds: string[] = [];
  const payloads: string[] = [];
  const sortOrders: number[] = [];
  const seenIds = new Set<string>();

  for (let idx = 0; idx < items.length; idx++) {
    const raw = items[idx];
    if (!raw || typeof raw !== 'object') continue;
    const item = raw as Record<string, unknown>;
    let recId = String(item.id ?? item.code ?? item.week ?? `${fallbackPrefix || collection}-${idx + 1}`);
    if (seenIds.has(recId)) {
      recId = `${recId}-${idx + 1}`;
    }
    seenIds.add(recId);
    recordIds.push(recId);
    payloads.push(JSON.stringify({ ...item, id: item.id ?? recId }));
    sortOrders.push(idx);
  }

  if (recordIds.length === 0) return 0;

  await client.query(
    `INSERT INTO grc_records (collection, record_id, payload, sort_order, updated_at)
     SELECT $1, u.record_id, u.payload::jsonb, u.sort_order, NOW()
     FROM UNNEST($2::text[], $3::text[], $4::int[]) AS u(record_id, payload, sort_order)`,
    [collection, recordIds, payloads, sortOrders],
  );

  return recordIds.length;
}

export async function withTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
