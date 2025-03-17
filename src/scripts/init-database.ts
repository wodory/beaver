/**
 * 데이터베이스 초기화 스크립트
 * 
 * config.json에서 저장소 정보를 읽어와 SQLite 데이터베이스에 삽입합니다.
 */
import { dbAdapter } from '../db';
import config from '../config.json';

/**
 * 저장소 정보를 DB에 삽입합니다.
 */
async function insertRepositories() {
  if (!config.repositories || config.repositories.length === 0) {
    console.log('저장소 정보가 없습니다.');
    return;
  }

  console.log(`${config.repositories.length}개의 저장소 정보를 삽입합니다.`);
  
  try {
    for (const repo of config.repositories) {
      // 이미 존재하는지 확인
      const existingRepos = await dbAdapter.query(`
        SELECT * FROM repositories WHERE full_name = ?
      `, [repo.fullName]);

      if (existingRepos.length > 0) {
        console.log(`저장소 ${repo.fullName}은 이미 존재합니다.`);
        continue;
      }

      // 저장소 정보 삽입
      await dbAdapter.execute(`
        INSERT INTO repositories 
        (id, name, full_name, clone_url, type, api_url) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        repo.id,
        repo.name,
        repo.fullName,
        repo.cloneUrl,
        repo.type || 'github',
        repo.apiUrl
      ]);

      console.log(`저장소 ${repo.fullName} 삽입 완료`);
    }

    console.log('모든 저장소 정보가 성공적으로 삽입되었습니다.');
  } catch (error) {
    console.error('저장소 정보 삽입 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 스크립트 메인 함수
 */
async function main() {
  try {
    console.log('데이터베이스 초기화 시작...');
    
    // 데이터베이스 연결
    await dbAdapter.initialize();
    
    // 저장소 정보 삽입
    await insertRepositories();
    
    console.log('데이터베이스 초기화 완료!');
  } catch (error) {
    console.error('초기화 중 오류 발생:', error);
  } finally {
    // 데이터베이스 연결 종료
    if (dbAdapter.close) {
      await dbAdapter.close();
    }
  }
}

// 스크립트 실행
main(); 