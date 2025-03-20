/**
 * 저장소 테이블 초기화 스크립트
 * 
 * settings 테이블의 accounts 설정에서 repository 정보를 가져와
 * repositories 테이블을 업데이트합니다.
 */

// dotenv를 맨 앞에서 로드하여 환경 변수를 설정합니다.
import 'dotenv/config';

import { initializeDatabase, getDB, closeDatabase } from '../db';
import { schemaToUse as schema } from '../db';
import { Repository } from '../types/settings';
import { SettingsService } from '../api/server/settings-service';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger';

// 저장소 DB 레코드 타입 정의
interface RepositoryRecord {
  id: number;
  name: string;
  fullName: string;
  cloneUrl: string;
  localPath?: string;
  type: string;
  apiUrl?: string;
  apiToken?: string;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

async function updateRepositories() {
  try {
    // DB 초기화
    await initializeDatabase();
    console.log('데이터베이스 연결됨');
    
    // 설정 서비스 인스턴스 생성
    const settingsService = new SettingsService();
    
    // accounts 설정에서 저장소 정보 가져오기
    const accountsSettings = await settingsService.getAccountsSettings();
    console.log(`계정 설정에서 ${accountsSettings.repositories.length}개의 저장소 정보를 가져왔습니다.`);
    
    if (accountsSettings.repositories.length === 0) {
      console.log('저장소 정보가 없습니다. 업데이트를 건너뜁니다.');
      return;
    }
    
    const db = getDB();
    
    // 기존 저장소 정보 확인
    const existingRepos = await db.select()
      .from(schema.repositories) as RepositoryRecord[];
    
    console.log(`기존 저장소 테이블에 ${existingRepos.length}개의 저장소가 있습니다.`);
    
    // 저장소 정보 순회하며 업데이트 또는 추가
    for (const repo of accountsSettings.repositories) {
      // 저장소 이름에서 소유자/이름 추출
      const fullName = repo.fullName;
      const nameOnly = repo.name || fullName.split('/').pop() || fullName;
      
      // 같은 fullName을 가진 저장소가 이미 있는지 확인
      const existingRepo = existingRepos.find(r => r.fullName === fullName);
      
      if (existingRepo) {
        // 기존 저장소 업데이트
        console.log(`저장소 업데이트: ${fullName}`);
        
        await db.update(schema.repositories)
          .set({
            name: nameOnly,
            cloneUrl: repo.url,
            type: repo.type,
            apiUrl: repo.ownerReference ? 
              accountsSettings.accounts.find(a => a.id === repo.owner)?.apiUrl || '' : '',
            updatedAt: new Date()
          })
          .where(eq(schema.repositories.fullName, fullName));
      } else {
        // 새 저장소 추가
        console.log(`저장소 추가: ${fullName}`);
        
        await db.insert(schema.repositories)
          .values({
            name: nameOnly,
            fullName: fullName,
            cloneUrl: repo.url,
            type: repo.type,
            apiUrl: repo.ownerReference ? 
              accountsSettings.accounts.find(a => a.id === repo.owner)?.apiUrl || '' : '',
            apiToken: repo.ownerReference ? 
              accountsSettings.accounts.find(a => a.id === repo.owner)?.token || '' : '',
            createdAt: new Date(),
            updatedAt: new Date()
          });
      }
    }
    
    console.log('저장소 테이블 업데이트를 완료했습니다.');
    
    // 업데이트된 저장소 목록 조회
    const updatedRepos = await db.select()
      .from(schema.repositories) as RepositoryRecord[];
    
    console.log(`저장소 테이블에 총 ${updatedRepos.length}개의 저장소가 있습니다.`);
    
  } catch (error) {
    console.error('저장소 테이블 업데이트 실패:', error);
  } finally {
    // DB 연결 종료
    await closeDatabase();
  }
}

// 스크립트 실행
updateRepositories()
  .then(() => {
    console.log('저장소 업데이트 스크립트 실행 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('저장소 업데이트 스크립트 실행 중 오류 발생:', error);
    process.exit(1);
  }); 