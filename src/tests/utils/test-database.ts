import { SQLiteAdapter } from '../../db/adapters/SQLiteAdapter';
import { SQLiteSettingsRepository } from '../../repositories/implementations/SQLiteSettingsRepository';
import { SQLiteRepositoryInfoRepository } from '../../repositories/implementations/SQLiteRepositoryInfoRepository';
import fs from 'fs';
import path from 'path';

export async function createTestDatabase(filepath?: string) {
  // 메모리 DB 사용 또는 파일 경로 지정
  const dbPath = filepath || ':memory:';
  
  // 파일 기반이면 기존 파일 제거
  if (dbPath !== ':memory:' && fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
  
  // SQLite 어댑터 생성 및 초기화
  const adapter = new SQLiteAdapter(dbPath);
  await adapter.initialize();
  
  // 필요한 테이블 생성
  await adapter.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      user_id TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  await adapter.execute(`
    CREATE TABLE IF NOT EXISTS repositories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      full_name TEXT NOT NULL UNIQUE,
      clone_url TEXT NOT NULL,
      local_path TEXT,
      type TEXT DEFAULT 'github' NOT NULL,
      api_url TEXT,
      api_token TEXT,
      last_sync_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `);
  
  // 레포지토리 생성 및 반환
  return {
    adapter,
    settingsRepository: new SQLiteSettingsRepository(adapter),
    repositoryInfoRepository: new SQLiteRepositoryInfoRepository(adapter)
  };
} 