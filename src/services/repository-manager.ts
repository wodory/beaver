import simpleGit, { SimpleGit } from 'simple-git';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { dbAdapter } from '../db';
import { schemaToUse as schema } from '../db';
import { eq } from 'drizzle-orm';

/**
 * 저장소 정보 인터페이스
 */
interface Repository {
  id: number;
  name: string;
  fullName: string;
  cloneUrl: string;
  localPath: string | null;
  lastSyncAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * 저장소 관리 클래스
 * 
 * 이 클래스는 대상 GitHub 저장소를 로컬에 클론/업데이트하고 경로를 관리합니다.
 */
export class RepositoryManager {
  private basePath: string;

  /**
   * RepositoryManager 인스턴스를 생성합니다.
   * @param basePath 저장소를 클론할 기본 경로 (기본값: './repos')
   */
  constructor(basePath = './repos') {
    this.basePath = basePath;
    this.ensureBaseDirectory();
  }

  /**
   * 기본 디렉토리가 존재하는지 확인하고, 없으면 생성합니다.
   */
  private async ensureBaseDirectory() {
    try {
      await mkdir(this.basePath, { recursive: true });
    } catch (error) {
      console.error(`기본 디렉토리 생성 실패: ${error}`);
      throw error;
    }
  }

  /**
   * 저장소가 로컬에 존재하는지 확인하고, 없으면 클론하고 있으면 업데이트합니다.
   * @param repoInfo 저장소 정보
   * @returns 저장소 로컬 경로
   */
  async ensureRepository(repoInfo: { id: number, name: string, fullName: string, cloneUrl: string, localPath?: string | null }) {
    const repoPath = repoInfo.localPath || join(this.basePath, repoInfo.name);
    const git: SimpleGit = simpleGit();

    try {
      // 디렉토리 생성
      await mkdir(repoPath, { recursive: true });
      
      // 이미 클론되어 있는지 확인
      const isRepo = await git.cwd(repoPath).checkIsRepo().catch(() => false);
      
      if (isRepo) {
        // 이미 클론된 저장소면 업데이트
        console.log(`저장소 ${repoInfo.fullName} 업데이트 중...`);
        await git.cwd(repoPath).pull();
      } else {
        // 새로 클론
        console.log(`저장소 ${repoInfo.fullName} 클론 중...`);
        await git.clone(repoInfo.cloneUrl, repoPath);
      }
      
      return repoPath;
    } catch (error) {
      console.error(`저장소 ${repoInfo.fullName} 처리 중 오류 발생:`, error);
      throw error;
    }
  }

  /**
   * 저장소 정보를 가져옵니다.
   * @param repoId 저장소 ID
   * @returns 저장소 정보
   */
  async getRepository(repoId: number) {
    if (!dbAdapter.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    const query = dbAdapter.db.select().from(schema.repositories).where(eq(schema.repositories.id, repoId));
    const repos = await dbAdapter.select<Repository[]>(query);
    
    return repos[0] || null;
  }

  /**
   * 모든 저장소 목록을 가져옵니다.
   * @returns 저장소 목록
   */
  async getAllRepositories() {
    if (!dbAdapter.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    const query = dbAdapter.db.select().from(schema.repositories);
    return await dbAdapter.select<Repository[]>(query);
  }

  /**
   * 새 저장소를 추가합니다.
   * @param repoInfo 저장소 정보
   * @returns 추가된 저장소 정보
   */
  async addRepository(repoInfo: { name: string, fullName: string, cloneUrl: string }) {
    if (!dbAdapter.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    // 중복 저장소 확인
    const query = dbAdapter.db.select().from(schema.repositories).where(eq(schema.repositories.fullName, repoInfo.fullName));
    const existingRepos = await dbAdapter.select<Repository[]>(query);
    
    if (existingRepos.length > 0) {
      throw new Error(`이미 존재하는 저장소입니다: ${repoInfo.fullName}`);
    }
    
    // 로컬 경로 생성
    const localPath = join(this.basePath, repoInfo.name);
    
    // 현재 날짜/시간을 ISO 문자열로 변환
    const now = new Date().toISOString();
    
    // 새 저장소 추가
    const newRepo = await dbAdapter.insert<typeof schema.repositories.$inferInsert, Repository>(schema.repositories, {
      name: repoInfo.name,
      fullName: repoInfo.fullName,
      cloneUrl: repoInfo.cloneUrl,
      localPath: localPath,
      createdAt: now,
      updatedAt: now,
      lastSyncAt: now
    });
    
    // 저장소 클론
    await this.ensureRepository({
      id: newRepo.id,
      name: repoInfo.name,
      fullName: repoInfo.fullName,
      cloneUrl: repoInfo.cloneUrl,
      localPath
    });
    
    return { ...newRepo, localPath };
  }

  /**
   * 저장소를 삭제합니다.
   * @param repoId 저장소 ID
   * @returns 삭제 성공 여부
   */
  async removeRepository(repoId: number) {
    if (!dbAdapter.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    // 저장소가 존재하는지 확인
    const repo = await this.getRepository(repoId);
    if (!repo) {
      throw new Error(`존재하지 않는 저장소 ID: ${repoId}`);
    }
    
    // DB에서 저장소 삭제
    await dbAdapter.db.delete(schema.repositories)
      .where(eq(schema.repositories.id, repoId))
      .execute();
    
    return true;
  }
} 