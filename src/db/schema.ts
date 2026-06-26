import type Database from 'better-sqlite3';

export const CREATE_LINKS_TABLE = `
  CREATE TABLE IF NOT EXISTS links (
    code       TEXT    PRIMARY KEY,
    url        TEXT    NOT NULL,
    clicks     INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`;

/**
 * Apply the schema idempotently to a database connection.
 * Called on open so the table always exists before queries run (ADR-004).
 */
export function applySchema(db: Database.Database): void {
  db.exec(CREATE_LINKS_TABLE);
}
