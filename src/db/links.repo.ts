import { getDb } from './client.js';
import { generateCode } from '../lib/code.js';
import type { Link, LinkCode, AbsoluteUrl } from '../../.pipeline/contracts/shared-types.js';

const MAX_RETRY = 5;

interface LinkRow {
  code: string;
  url: string;
  clicks: number;
}

function rowToLink(row: LinkRow): Link {
  return {
    code: row.code as LinkCode,
    url: row.url as AbsoluteUrl,
    clicks: row.clicks,
  };
}

/**
 * Inserts a new link with a generated code.
 * Retries on PK collision (SQLITE_CONSTRAINT_PRIMARYKEY) up to MAX_RETRY times.
 * Returns the inserted link record (ADR-004, ADR-005).
 */
export function insertLink(url: string): Link {
  const db = getDb();
  const stmt = db.prepare(
    'INSERT INTO links (code, url) VALUES (?, ?)',
  );

  let attempt = 0;
  while (attempt < MAX_RETRY) {
    const code = generateCode();
    try {
      stmt.run(code, url);
      return {
        code: code as LinkCode,
        url: url as AbsoluteUrl,
        clicks: 0,
      };
    } catch (err: unknown) {
      const sqliteErr = err as { code?: string };
      if (sqliteErr?.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
        attempt++;
        continue;
      }
      throw err;
    }
  }

  throw new Error('Failed to generate a unique short code after maximum retries');
}

/**
 * Retrieves a link by its short code, or null if not found.
 */
export function getByCode(code: string): Link | null {
  const db = getDb();
  const stmt = db.prepare(
    'SELECT code, url, clicks FROM links WHERE code = ?',
  );
  const row = stmt.get(code) as LinkRow | undefined;
  return row ? rowToLink(row) : null;
}

/**
 * Returns all links ordered by created_at, code (stable ordering — ADR-004).
 */
export function listAll(): Link[] {
  const db = getDb();
  const stmt = db.prepare(
    'SELECT code, url, clicks FROM links ORDER BY created_at, code',
  );
  const rows = stmt.all() as LinkRow[];
  return rows.map(rowToLink);
}

/**
 * Atomically increments the click count for a link.
 * Returns the updated click count, or null if no row was updated.
 */
export function incrementClicks(code: string): number | null {
  const db = getDb();
  const stmt = db.prepare(
    'UPDATE links SET clicks = clicks + 1 WHERE code = ? RETURNING clicks',
  );
  const row = stmt.get(code) as { clicks: number } | undefined;
  return row ? row.clicks : null;
}
