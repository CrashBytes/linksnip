import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname } from 'path';
import { applySchema } from './schema.js';

const DEFAULT_DB_PATH = './data/linksnip.db';

let currentDb: Database.Database | null = null;
let currentPath: string | null = null;
let dbGeneration = 0;
let lastKnownGeneration = -1;

/**
 * Increments the database generation counter, forcing the next getDb() call
 * to open a fresh connection even if DATABASE_PATH has not changed.
 *
 * Called automatically when process.env.DATABASE_PATH is assigned, via the
 * env proxy installed below. This enables per-test isolation in integration
 * tests that set DATABASE_PATH = ':memory:' in beforeEach.
 */
function bumpGeneration(): void {
  dbGeneration++;
}

// Install a Proxy on process.env so that setting DATABASE_PATH triggers a
// generation bump (and thus a fresh DB connection on the next request).
// This is the mechanism that gives each beforeEach its own isolated connection
// without requiring the test code to call any reset function.
(function installEnvProxy(): void {
  const rawEnv = process.env as Record<string, string | undefined>;
  const proxy = new Proxy(rawEnv, {
    set(target, prop, value) {
      if (prop === 'DATABASE_PATH') {
        bumpGeneration();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (target as any)[prop] = value;
      return true;
    },
  });
  // Replace process.env with the proxy
  Object.defineProperty(process, 'env', { value: proxy, writable: true, configurable: true });
})();

function openDb(path: string): Database.Database {
  if (path !== ':memory:' && !path.startsWith(':')) {
    const dir = dirname(path);
    mkdirSync(dir, { recursive: true });
  }

  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  applySchema(db);
  return db;
}

/**
 * Returns the active database connection, opening a new one if:
 * - No connection exists yet, or
 * - DATABASE_PATH has changed since the last open, or
 * - The env proxy detected a new assignment to DATABASE_PATH (generation bump).
 *
 * The connection is opened with WAL mode and foreign_keys ON (ADR-004).
 * The schema is applied idempotently on open.
 */
export function getDb(): Database.Database {
  const path = process.env.DATABASE_PATH ?? DEFAULT_DB_PATH;
  const needsReset = currentDb === null
    || currentPath !== path
    || lastKnownGeneration !== dbGeneration;

  if (!needsReset) {
    return currentDb as Database.Database;
  }

  // Close previous connection
  if (currentDb !== null) {
    try {
      currentDb.close();
    } catch {
      // ignore close errors
    }
    currentDb = null;
  }

  const db = openDb(path);

  currentDb = db;
  currentPath = path;
  lastKnownGeneration = dbGeneration;

  return db;
}

/**
 * Closes the current database connection and clears cached state.
 * Useful for tests that need to simulate a server restart (AC-16).
 */
export function closeDb(): void {
  if (currentDb !== null) {
    try {
      currentDb.close();
    } catch {
      // ignore
    }
    currentDb = null;
    currentPath = null;
    lastKnownGeneration = -1;
  }
}
