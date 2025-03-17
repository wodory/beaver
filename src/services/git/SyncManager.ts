import { GitCommitCollector } from './GitCommitCollector';
import { GitServiceFactory } from './GitServiceFactory';
import { RepositoryInfo } from './IGitServiceAdapter';
import { dbAdapter } from '../../db';
import { schemaToUse as schema } from '../../db';
import { eq } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';
import config from '../../config.json';

/**
 * 동기화 관리자
 * 
 * 저장소의 코드 및 메타데이터를 동기화하는 작업을 관리합니다.
 */
export class SyncManager {
  private gitServiceFactory: GitServiceFactory;
  private commitCollector: GitCommitCollector;
  private basePath: string;
  
  constructor() {
    this.gitServiceFactory = GitServiceFactory.getInstance();
    this.commitCollector = new GitCommitCollector();
    this.basePath = config.defaultPaths?.repoStorage || './repos';
  }
  
  /**
   * 저장소 정보를 가져옵니다.
   * @param repoId 저장소 ID
   * @returns 저장소 정보
   */
  async getRepository(repoId: number): Promise<RepositoryInfo | null> {
    if (!dbAdapter.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    const repos = await dbAdapter.select(
      dbAdapter.db.select()
        .from(schema.repositories)
        .where(eq(schema.repositories.id, repoId))
    );
    
    if (repos.length === 0) {
      return null;
    }
    
    const repo = repos[0];
    
    return {
      id: repo.id,
      name: repo.name,
      fullName: repo.fullName,
      cloneUrl: repo.cloneUrl,
      type: repo.type as 'github' | 'gitlab' | 'github-enterprise' | 'other',
      apiUrl: repo.apiUrl,
      apiToken: repo.apiToken,
      localPath: repo.localPath
    };
  }
  
  /**
   * 모든 저장소 정보를 가져옵니다.
   * @returns 저장소 정보 목록
   */
  async getAllRepositories(): Promise<RepositoryInfo[]> {
    // Phase 1에서 이미 완료된 기능 사용
    if (!dbAdapter.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    const repos = await dbAdapter.select(
      dbAdapter.db.select()
        .from(schema.repositories)
    );
    
    return repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.fullName,
      cloneUrl: repo.cloneUrl,
      type: repo.type as 'github' | 'gitlab' | 'github-enterprise' | 'other',
      apiUrl: repo.apiUrl,
      apiToken: repo.apiToken,
      localPath: repo.localPath
    }));
  }
  
  /**
   * 지정된 저장소를 동기화합니다.
   * 1. 저장소 클론/업데이트
   * 2. 커밋 데이터 수집
   * 3. PR 및 리뷰 데이터 수집
   * 
   * @param repoId 저장소 ID
   * @param forceFull 전체 동기화 여부 (기본값: false, 증분 동기화 수행)
   * @returns 동기화 결과
   */
  async syncRepository(repoId: number, forceFull: boolean = false): Promise<SyncResult> {
    const repoInfo = await this.getRepository(repoId);
    
    if (!repoInfo) {
      throw new Error(`ID가 ${repoId}인 저장소를 찾을 수 없습니다.`);
    }
    
    console.log(`저장소 ${repoInfo.fullName} 동기화 시작...`);
    
    const result: SyncResult = {
      repositoryId: repoId,
      repositoryName: repoInfo.fullName,
      success: false,
      message: '',
      commitCount: 0,
      pullRequestCount: 0,
      reviewCount: 0,
      startTime: new Date(),
      endTime: new Date(),
      errors: []
    };
    
    try {
      // 1. 저장소 경로 확인 및 생성
      const repoPath = await this.ensureRepositoryPath(repoInfo);
      repoInfo.localPath = repoPath;
      
      // 2. 저장소 클론 또는 업데이트
      const gitAdapter = this.gitServiceFactory.createAdapter(repoInfo);
      await gitAdapter.cloneOrUpdateRepository(repoInfo, this.basePath);
      
      // 3. 마지막 동기화 시간 가져오기 (증분 동기화용)
      let since: Date | undefined;
      if (!forceFull) {
        const lastSyncQuery = await dbAdapter.select(
          dbAdapter.db!.select({ lastSyncAt: schema.repositories.lastSyncAt })
            .from(schema.repositories)
            .where(eq(schema.repositories.id, repoId))
        );
        
        if (lastSyncQuery.length > 0 && lastSyncQuery[0].lastSyncAt) {
          since = new Date(lastSyncQuery[0].lastSyncAt);
          console.log(`마지막 동기화 시간: ${since.toISOString()}`);
        }
      }
      
      // 4. 커밋 데이터 수집 및 저장
      result.commitCount = await this.commitCollector.collectAndStoreCommits(repoInfo, since);
      
      // 5. PR 데이터 수집 및 저장 (Task 2.2 완료 후 구현)
      try {
        const pullRequests = await gitAdapter.collectPullRequests(repoInfo, since);
        result.pullRequestCount = await this.storePullRequests(repoInfo, pullRequests);
        
        // 6. PR 리뷰 데이터 수집 및 저장
        let reviewCount = 0;
        for (const pr of pullRequests) {
          const reviews = await gitAdapter.collectPullRequestReviews(repoInfo, pr.number);
          reviewCount += await this.storePullRequestReviews(repoInfo, pr.number, reviews);
        }
        result.reviewCount = reviewCount;
      } catch (error) {
        console.error('PR 및 리뷰 데이터 수집 중 오류:', error);
        result.errors.push(`PR 데이터 오류: ${error}`);
      }
      
      // 7. 마지막 동기화 시간 업데이트
      await dbAdapter.db!.update(schema.repositories)
        .set({ 
          lastSyncAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .where(eq(schema.repositories.id, repoId))
        .execute();
      
      result.success = true;
      result.message = '동기화가 성공적으로 완료되었습니다.';
    } catch (error) {
      console.error(`저장소 ${repoInfo.fullName} 동기화 중 오류 발생:`, error);
      result.success = false;
      result.message = `동기화 중 오류 발생: ${error}`;
      result.errors.push(`${error}`);
    }
    
    result.endTime = new Date();
    console.log(`저장소 ${repoInfo.fullName} 동기화 완료. 결과: ${result.success ? '성공' : '실패'}`);
    
    return result;
  }
  
  /**
   * 모든 저장소를 동기화합니다.
   * 
   * @param forceFull 전체 동기화 여부 (기본값: false)
   * @returns 동기화 결과 목록
   */
  async syncAllRepositories(forceFull: boolean = false): Promise<SyncResult[]> {
    const repositories = await this.getAllRepositories();
    const results: SyncResult[] = [];
    
    for (const repo of repositories) {
      try {
        const result = await this.syncRepository(repo.id, forceFull);
        results.push(result);
      } catch (error) {
        console.error(`저장소 ${repo.fullName} 동기화 중 오류 발생:`, error);
        results.push({
          repositoryId: repo.id,
          repositoryName: repo.fullName,
          success: false,
          message: `동기화 중 오류 발생: ${error}`,
          commitCount: 0,
          pullRequestCount: 0,
          reviewCount: 0,
          startTime: new Date(),
          endTime: new Date(),
          errors: [`${error}`]
        });
      }
    }
    
    return results;
  }
  
  /**
   * 저장소 경로를 확인하고 없으면 생성합니다.
   * 
   * @param repoInfo 저장소 정보
   * @returns 저장소 로컬 경로
   */
  private async ensureRepositoryPath(repoInfo: RepositoryInfo): Promise<string> {
    // 저장소 경로가 이미 설정되어 있으면 그대로 사용
    if (repoInfo.localPath) {
      await fs.mkdir(repoInfo.localPath, { recursive: true });
      return repoInfo.localPath;
    }
    
    // 새 경로 생성
    const repoPath = path.join(this.basePath, repoInfo.name);
    await fs.mkdir(repoPath, { recursive: true });
    
    return repoPath;
  }
  
  /**
   * 수집된 PR 데이터를 DB에 저장합니다.
   * 
   * @param repoInfo 저장소 정보
   * @param pullRequests PR 목록
   * @returns 저장된 PR 수
   */
  private async storePullRequests(repoInfo: RepositoryInfo, pullRequests: any[]): Promise<number> {
    // Task 2.2 완료 후 구현 예정
    // 일단은 Mock 데이터로 저장된 것처럼 처리
    return pullRequests.length;
  }
  
  /**
   * 수집된 PR 리뷰 데이터를 DB에 저장합니다.
   * 
   * @param repoInfo 저장소 정보
   * @param prNumber PR 번호
   * @param reviews 리뷰 목록
   * @returns 저장된 리뷰 수
   */
  private async storePullRequestReviews(repoInfo: RepositoryInfo, prNumber: number, reviews: any[]): Promise<number> {
    // Task 2.2 완료 후 구현 예정
    // 일단은 Mock 데이터로 저장된 것처럼 처리
    return reviews.length;
  }
}

/**
 * 동기화 결과 인터페이스
 */
export interface SyncResult {
  repositoryId: number;
  repositoryName: string;
  success: boolean;
  message: string;
  commitCount: number;
  pullRequestCount: number;
  reviewCount: number;
  startTime: Date;
  endTime: Date;
  errors: string[];
} 