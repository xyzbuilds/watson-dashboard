import Database from "better-sqlite3";
import path from "node:path";

type SqliteDatabase = InstanceType<typeof Database>;

let db: SqliteDatabase | null = null;

export function getDb() {
  if (db) return db;
  db = new Database(path.join(process.cwd(), "watson-dashboard.db"));
  db.exec(`
    CREATE TABLE IF NOT EXISTS cost_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bucket_date TEXT NOT NULL,
      source TEXT NOT NULL,
      model TEXT NOT NULL,
      tokens INTEGER NOT NULL,
      cost REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  return db;
}

export function saveCostSnapshot(bucketDate: string, source: string, model: string, tokens: number, cost: number) {
  const database = getDb();
  database
    .prepare(
      `INSERT INTO cost_snapshots (bucket_date, source, model, tokens, cost)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(bucketDate, source, model, tokens, cost);
}

export function readCostHistory(limit = 30) {
  const database = getDb();
  return database
    .prepare(
      `SELECT bucket_date, model, SUM(tokens) AS tokens, SUM(cost) AS cost
       FROM cost_snapshots
       GROUP BY bucket_date, model
       ORDER BY bucket_date DESC
       LIMIT ?`
    )
    .all(limit) as Array<{ bucket_date: string; model: string; tokens: number; cost: number }>;
}
