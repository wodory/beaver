import simpleGit, { SimpleGit } from 'simple-git';
import { GitServiceFactory } from './GitServiceFactory';
import { RepositoryInfo, CommitInfo } from './IGitServiceAdapter.js';
import { dbAdapter } from '../../db/index.js';
import { schemaToUse as schema } from '../../db/index.js';
import { eq } from 'drizzle-orm';

/**
 * Git 커밋 데이터 수집기
 * 
 * 로컬 Git 저장소 또는 원격 API를 통해 커밋 데이터를 수집하고 DB에 저장합니다.
 */
export class GitCommitCollector {
  private gitServiceFactory: GitServiceFactory;
  
  constructor() {
    this.gitServiceFactory = GitServiceFactory.getInstance();
  }
  
  /**
   * 저장소의 커밋 데이터를 수집하고 DB에 저장합니다.
   * 
   * @param repoInfo 저장소 정보
   * @param since 특정 날짜 이후의 커밋만 수집
   * @param branches 수집할 브랜치 목록 (기본값: ['main', 'master'])
   * @returns 수집된 커밋 수
   */
  async collectAndStoreCommits(
    repoInfo: RepositoryInfo,
    since?: Date,
    branches: string[] = ['main', 'master']
  ): Promise<number> {
    if (!repoInfo.localPath) {
      throw new Error(`저장소 ${repoInfo.fullName}의 로컬 경로가 설정되지 않았습니다.`);
    }
    
    // 해당 저장소 타입에 맞는 어댑터 생성
    const gitAdapter = this.gitServiceFactory.createAdapter(repoInfo);
    
    // 커밋 데이터 수집
    console.log(`${repoInfo.fullName} 저장소의 커밋 데이터 수집 중...`);
    const commits = await gitAdapter.collectCommits(repoInfo, repoInfo.localPath, since);
    
    if (commits.length === 0) {
      console.log(`${repoInfo.fullName} 저장소에서 수집할 새 커밋이 없습니다.`);
      return 0;
    }
    
    // 커밋 데이터를 DB에 저장
    console.log(`${commits.length}개의 커밋 데이터를 DB에 저장 중...`);
    
    let savedCount = 0;
    
    for (const commit of commits) {
      try {
        // 이미 존재하는 커밋인지 확인
        const existingCommits = await dbAdapter.select(
          dbAdapter.db!.select()
            .from(schema.commits)
            .where(eq(schema.commits.id, commit.id))
        );
        
        if (existingCommits.length > 0) {
          console.log(`커밋 ${commit.id.substring(0, 8)}은 이미 존재합니다.`);
          continue;
        }
        
        // 작성자 확인 또는 추가
        let authorId = null;
        const users = await dbAdapter.select(
          dbAdapter.db!.select()
            .from(schema.users)
            .where(eq(schema.users.email, commit.authorEmail))
        );
        
        if (users.length > 0) {
          authorId = users[0].id;
        } else {
          // 새 사용자 추가
          const newUser = await dbAdapter.insert(schema.users, {
            login: commit.authorName,
            name: commit.authorName,
            email: commit.authorEmail,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          authorId = newUser.id;
        }
        
        // 커밋 정보 저장
        await dbAdapter.insert(schema.commits, {
          id: commit.id,
          repositoryId: repoInfo.id,
          authorId: authorId,
          message: commit.message,
          committedAt: new Date(commit.committedDate).toISOString(),
          additions: commit.additions,
          deletions: commit.deletions,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        savedCount++;
      } catch (error) {
        console.error(`커밋 ${commit.id} 저장 중 오류 발생:`, error);
      }
    }
    
    console.log(`${savedCount}개의 커밋이 성공적으로 저장되었습니다.`);
    return savedCount;
  }
  
  /**
   * 로컬 Git 저장소에서 직접 커밋 데이터를 수집합니다.
   * (어댑터를 사용하지 않는 대체 메서드)
   * 
   * @param repoPath 저장소 로컬 경로
   * @param since 특정 날짜 이후의 커밋만 수집
   * @param branches 수집할 브랜치 목록
   * @returns 수집된 커밋 목록
   */
  async collectCommitsFromLocalGit(
    repoPath: string,
    since?: Date,
    branches: string[] = ['main', 'master']
  ): Promise<CommitInfo[]> {
    const git: SimpleGit = simpleGit(repoPath);
    
    // Git 저장소인지 확인
    const isRepo = await git.checkIsRepo().catch(() => false);
    if (!isRepo) {
      throw new Error(`${repoPath}는 유효한 Git 저장소가 아닙니다.`);
    }
    
    // 브랜치 확인
    const branchSummary = await git.branch();
    const availableBranches = branchSummary.all;
    
    // 존재하는 브랜치만 필터링
    const targetBranches = branches.filter(branch => availableBranches.includes(branch));
    
    if (targetBranches.length === 0) {
      // 기본 브랜치 결정
      const defaultBranch = branchSummary.current || 'master';
      targetBranches.push(defaultBranch);
    }
    
    // 커밋 수집 옵션
    const logOptions: string[] = ['--numstat'];
    if (since) {
      logOptions.push(`--since=${since.toISOString()}`);
    }
    
    const commits: CommitInfo[] = [];
    
    for (const branch of targetBranches) {
      console.log(`브랜치 ${branch}에서 커밋 수집 중...`);
      
      try {
        // 해당 브랜치로 체크아웃
        await git.checkout(branch);
        
        // Pull로 최신 커밋 가져오기
        await git.pull();
        
        // 커밋 로그 가져오기
        const logs = await git.log([...logOptions]);
        
        for (const log of logs.all) {
          // 코드 변경량 파싱
          let additions = 0;
          let deletions = 0;
          
          if (log.diff && log.diff.numstat) {
            for (const stat of log.diff.numstat) {
              additions += parseInt(stat.additions) || 0;
              deletions += parseInt(stat.deletions) || 0;
            }
          }
          
          // CommitInfo 객체로 변환
          commits.push({
            id: log.hash,
            message: log.message,
            authorName: log.author_name,
            authorEmail: log.author_email,
            committedDate: new Date(log.date),
            additions,
            deletions
          });
        }
      } catch (error) {
        console.error(`브랜치 ${branch} 처리 중 오류 발생:`, error);
      }
    }
    
    return commits;
  }
} 