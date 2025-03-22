import { SettingsRepository } from '../interfaces/SettingsRepository';
import { SQLiteAdapter } from '../../db/adapters/SQLiteAdapter.js';

export class SQLiteSettingsRepository implements SettingsRepository {
  constructor(private adapter: SQLiteAdapter) {}
  
  async getSettings(userId: string, type: string): Promise<any> {
    try {
      const result = await this.adapter.query(
        'SELECT data FROM settings WHERE type = ? AND user_id = ? LIMIT 1',
        [type, userId]
      );
      
      if (!result || (result as any[]).length === 0) {
        return null;
      }
      
      const data = (result as any[])[0].data;
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch (error) {
      console.error('SQLite settings 조회 오류:', error);
      throw error;
    }
  }
  
  async updateSettings(userId: string, type: string, data: any): Promise<void> {
    try {
      const exists = await this.settingsExist(userId, type);
      
      if (exists) {
        await this.adapter.execute(
          'UPDATE settings SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE type = ? AND user_id = ?',
          [JSON.stringify(data), type, userId]
        );
      } else {
        await this.adapter.execute(
          'INSERT INTO settings (type, user_id, data, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
          [type, userId, JSON.stringify(data)]
        );
      }
    } catch (error) {
      console.error('SQLite settings 업데이트 오류:', error);
      throw error;
    }
  }
  
  async settingsExist(userId: string, type: string): Promise<boolean> {
    try {
      const result = await this.adapter.query(
        'SELECT id FROM settings WHERE type = ? AND user_id = ? LIMIT 1',
        [type, userId]
      );
      
      return !!(result && (result as any[]).length > 0);
    } catch (error) {
      console.error('SQLite settings 존재 확인 오류:', error);
      throw error;
    }
  }
} 