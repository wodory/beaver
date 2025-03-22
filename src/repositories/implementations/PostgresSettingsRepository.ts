import { SettingsRepository } from '../interfaces/SettingsRepository.js';
import { getDB } from '../../db/index.js';

export class PostgresSettingsRepository implements SettingsRepository {
  async getSettings(userId: string, type: string): Promise<any> {
    const db = getDB();
    const result = await db.execute(
      `SELECT data FROM settings WHERE type = $1 AND user_id = $2 LIMIT 1`,
      [type, userId]
    );
    
    if (!result || result.length === 0) {
      return null;
    }
    
    const data = result[0].data;
    return typeof data === 'string' ? JSON.parse(data) : data;
  }
  
  async updateSettings(userId: string, type: string, data: any): Promise<void> {
    const db = getDB();
    const existingSettings = await this.settingsExist(userId, type);
    
    if (existingSettings) {
      await db.execute(
        `UPDATE settings SET data = $1::jsonb, updated_at = NOW() WHERE type = $2 AND user_id = $3`,
        [JSON.stringify(data), type, userId]
      );
    } else {
      await db.execute(
        `INSERT INTO settings (type, user_id, data, created_at, updated_at) VALUES ($1, $2, $3::jsonb, NOW(), NOW())`,
        [type, userId, JSON.stringify(data)]
      );
    }
  }
  
  async settingsExist(userId: string, type: string): Promise<boolean> {
    const db = getDB();
    const result = await db.execute(
      `SELECT id FROM settings WHERE type = $1 AND user_id = $2 LIMIT 1`,
      [type, userId]
    );
    
    return !!(result && result.length > 0);
  }
} 