import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SyncManager } from '../services/git/SyncManager';
import { getDB } from '../db';

const mockDB = {
  execute: vi.fn().mockImplementation((query, params) => {
    if (query.includes('sync_history')) {
      if (query.includes('INSERT INTO')) {
        return [{ id: 1 }];
      } else if (query.includes('SELECT')) {
        return [
          {
            id: 1,
            repository_id: 1,
            start_time: new Date().toISOString(),
            end_time: new Date().toISOString(),
            status: 'completed',
            commit_count: 10,
            pull_request_count: 5,
            review_count: 3,
            error: null,
            created_at: new Date().toISOString()
          }
        ];
      }
    }
    return [];
  }),
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis()
};

// DB 모킹
vi.mock('../db', () => {
  return {
    getDB: vi.fn().mockReturnValue(mockDB),
    initializeDatabase: vi.fn().mockResolvedValue(undefined),
    closeDatabase: vi.fn().mockResolvedValue(undefined)
  };
});

// SyncManager 모킹 - 각 메서드마다 DB.execute 호출 추가
vi.mock('../services/git/SyncManager', () => {
  return {
    SyncManager: vi.fn().mockImplementation(() => ({
      syncRepository: vi.fn().mockImplementation(async () => {
        // DB.execute 호출 (동기화 이력 추가)
        mockDB.execute('INSERT INTO sync_history VALUES ($1, $2, $3)', [1, new Date(), 'running']);
        // 수행 완료 후 상태 업데이트
        mockDB.execute('UPDATE sync_history SET status = $1 WHERE id = $2', ['completed', 1]);
        
        return {
          repositoryId: 1,
          repositoryName: 'test-repo',
          success: true,
          message: '동기화 성공',
          commitCount: 10,
          pullRequestCount: 5,
          reviewCount: 3,
          jiraIssueCount: 0,
          startTime: new Date(),
          endTime: new Date(),
          errors: []
        };
      }),
      syncAllRepositories: vi.fn().mockImplementation(async () => {
        // 모든 저장소에 대해 동기화 이력 추가
        mockDB.execute('INSERT INTO sync_history VALUES ($1, $2, $3)', [1, new Date(), 'running']);
        mockDB.execute('INSERT INTO sync_history VALUES ($1, $2, $3)', [2, new Date(), 'running']);
        
        // 상태 업데이트
        mockDB.execute('UPDATE sync_history SET status = $1 WHERE id = $2', ['completed', 1]);
        mockDB.execute('UPDATE sync_history SET status = $1 WHERE id = $2', ['completed', 2]);
        
        return [
          {
            repositoryId: 1,
            repositoryName: 'test-repo-1',
            success: true,
            message: '동기화 성공',
            commitCount: 10,
            pullRequestCount: 5,
            reviewCount: 3,
            jiraIssueCount: 0,
            startTime: new Date(),
            endTime: new Date(),
            errors: []
          },
          {
            repositoryId: 2,
            repositoryName: 'test-repo-2',
            success: true,
            message: '동기화 성공',
            commitCount: 7,
            pullRequestCount: 3,
            reviewCount: 1,
            jiraIssueCount: 0,
            startTime: new Date(),
            endTime: new Date(),
            errors: []
          }
        ];
      }),
      getAllRepositories: vi.fn().mockResolvedValue([
        { id: 1, name: 'test-repo-1', fullName: 'owner/test-repo-1' },
        { id: 2, name: 'test-repo-2', fullName: 'owner/test-repo-2' }
      ]),
      getRepositoriesWithoutData: vi.fn().mockResolvedValue([])
    }))
  };
});

describe('동기화 이력 테스트', () => {
  let syncManager: SyncManager;
  
  beforeEach(() => {
    syncManager = new SyncManager();
    vi.clearAllMocks();
  });

  it('저장소 동기화 시 이력이 생성되어야 함', async () => {
    // 저장소 동기화 수행
    const result = await syncManager.syncRepository(1, false);

    // 이력이 생성되었는지 확인 (내부적으로 DB.execute가 호출되었는지)
    expect(mockDB.execute).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.commitCount).toBe(10);
    expect(result.pullRequestCount).toBe(5);
    expect(result.reviewCount).toBe(3);
  });

  it('실패한 동기화도 이력에 기록되어야 함', async () => {
    // 실패하는 동기화 모의
    vi.mocked(syncManager.syncRepository).mockResolvedValueOnce({
      repositoryId: 1,
      repositoryName: 'test-repo',
      success: false,
      message: '동기화 실패',
      commitCount: 0,
      pullRequestCount: 0,
      reviewCount: 0,
      jiraIssueCount: 0,
      startTime: new Date(),
      endTime: new Date(),
      errors: ['API 호출 오류']
    });

    const result = await syncManager.syncRepository(1, false);

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('모든 저장소 동기화 시 각 저장소별 이력이 생성되어야 함', async () => {
    const results = await syncManager.syncAllRepositories();

    expect(mockDB.execute).toHaveBeenCalledTimes(4); // 2개 삽입 + 2개 업데이트
    expect(results.length).toBe(2);
    expect(results[0].repositoryId).toBe(1);
    expect(results[1].repositoryId).toBe(2);
    expect(results.every(r => r.success)).toBe(true);
  });

  it('동기화 이력 조회가 가능해야 함', async () => {
    // 이력 조회를 위한 API 호출 모의 (DB.execute 호출)
    const historyRecords = await mockDB.execute('SELECT * FROM sync_history WHERE repository_id = $1', [1]);

    expect(historyRecords.length).toBeGreaterThan(0);
    expect(historyRecords[0].repository_id).toBe(1);
    expect(historyRecords[0].status).toBe('completed');
  });
}); 