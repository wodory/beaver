import { getDB } from '../../../db/index.js';
import { sql } from 'drizzle-orm';
import { logger } from '../../../utils/logger.js';

/**
 * 시스템 설정 인터페이스
 */
export interface SystemSettings {
  defaultPaths?: {
    repoStorage?: string;
  };
  refreshInterval?: number;
  language?: string;
  [key: string]: any;
}

/**
 * 시스템 설정 관리 클래스
 */
export class SettingsManager {
  private systemSettings: SystemSettings = {};
  
  /**
   * 설정을 로드하고 초기화합니다.
   */
  async loadSettings(): Promise<SystemSettings> {
    try {
      await this.ensureDefaultSettings();
      return this.systemSettings;
    } catch (error) {
      logger.error('설정 로드 중 오류 발생:', error);
      return this.systemSettings;
    }
  }
  
  /**
   * 시스템 설정을 DB에서 로드합니다.
   */
  private async loadSystemSettingsFromDB(): Promise<SystemSettings> {
    try {
      if (!getDB()) {
        logger.error('데이터베이스가 초기화되지 않았습니다.');
        return {};
      }

      // Drizzle ORM 사용
      const db = getDB();
      const result = await db.execute(
        sql`SELECT value FROM system_settings WHERE key = 'default_settings'`
      );
      
      if (result && result.length > 0) {
        // 결과에서 값을 추출하고 파싱
        const settings = result[0].value;
        return typeof settings === 'string' ? JSON.parse(settings) : settings;
      }
      
      return {};
    } catch (error) {
      logger.error('시스템 설정을 로드하는 중 오류가 발생했습니다:', error);
      return {};
    }
  }
  
  /**
   * 시스템 설정을 DB에 저장합니다.
   */
  private async saveSystemSettings(settings: SystemSettings): Promise<void> {
    try {
      if (!getDB()) {
        logger.error('데이터베이스가 초기화되지 않았습니다.');
        return;
      }
      
      // Drizzle ORM 사용
      const db = getDB();
      // 설정이 존재하는지 확인
      const result = await db.execute(
        sql`SELECT COUNT(*) as count FROM system_settings WHERE key = 'default_settings'`
      );
      
      const count = parseInt(result[0].count);
      const settingsJson = JSON.stringify(settings);
      
      if (count > 0) {
        // 기존 설정 업데이트
        await db.execute(sql`
          UPDATE system_settings 
          SET value = ${settingsJson}, updated_at = NOW() 
          WHERE key = 'default_settings'
        `);
      } else {
        // 새 설정 삽입
        await db.execute(sql`
          INSERT INTO system_settings (key, value) 
          VALUES ('default_settings', ${settingsJson})
        `);
      }
      
      logger.info('시스템 설정이 DB에 저장되었습니다.');
    } catch (error) {
      logger.error('시스템 설정 저장 중 오류 발생:', error);
    }
  }
  
  /**
   * 초기 설정을 DB에 설정합니다.
   */
  private async ensureDefaultSettings(): Promise<void> {
    try {
      // 현재 설정 가져오기
      const currentSettings = await this.loadSystemSettingsFromDB();
      
      // 기본 설정이 없으면 새로 만들기
      if (!currentSettings || Object.keys(currentSettings).length === 0) {
        const defaultSettings: SystemSettings = {
          defaultPaths: {
            repoStorage: './repos'
          },
          refreshInterval: 5,
          language: 'ko'
        };
        
        await this.saveSystemSettings(defaultSettings);
        this.systemSettings = defaultSettings;
        logger.info('기본 시스템 설정이 DB에 생성되었습니다.');
      } else {
        this.systemSettings = currentSettings;
      }
      
      // defaultPaths가 없으면 추가
      if (!this.systemSettings.defaultPaths) {
        this.systemSettings.defaultPaths = {
          repoStorage: './repos'
        };
        await this.saveSystemSettings(this.systemSettings);
      }
    } catch (error) {
      logger.error('기본 설정 초기화 중 오류 발생:', error);
    }
  }
  
  /**
   * 현재 시스템 설정을 반환합니다.
   */
  getSystemSettings(): SystemSettings {
    return { ...this.systemSettings };
  }
} 