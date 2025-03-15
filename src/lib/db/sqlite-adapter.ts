import Database from 'better-sqlite3';
import { BaseAdapter } from './adapter';

export class SQLiteAdapter extends BaseAdapter {
  private db: Database.Database;

  constructor(dbPath: string) {
    super();
    this.db = new Database(dbPath);
  }

  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.all(...params) as T[];
    } catch (error) {
      console.error('SQLite query error:', error);
      throw error;
    }
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    try {
      const stmt = this.db.prepare(sql);
      stmt.run(...params);
    } catch (error) {
      console.error('SQLite execute error:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    this.db.close();
  }
} 