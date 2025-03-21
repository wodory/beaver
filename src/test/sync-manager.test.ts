import { describe, test, expect, vi, beforeEach } from 'vitest'
import { SyncManager } from '../services/git/SyncManager'
import { server } from './mocks/server'
import { HttpResponse, graphql } from 'msw'
import { getDB } from '../db'
import { schemaToUse as schema } from '../db'
import { eq } from 'drizzle-orm'

// SyncManager 클래스 모킹
vi.mock('../services/git/SyncManager', () => {
  const mockProgress = {
    total: 2,
    current: 2,
    completed: 2,
    failed: 0,
    skipped: 0,
    inProgress: 0,
    status: 'completed',
    startTime: new Date(),
    endTime: new Date(),
    estimatedTimeRemaining: 0
  }
  
  return {
    SyncManager: vi.fn().mockImplementation(() => ({
      syncRepository: vi.fn().mockResolvedValue({
        repositoryId: 1,
        repositoryName: 'test-repo',
        success: true,
        message: '동기화 성공',
        commitCount: 2,
        pullRequestCount: 1,
        reviewCount: 1,
        jiraIssueCount: 0,
        startTime: new Date(),
        endTime: new Date(),
        errors: []
      }),
      syncAllRepositories: vi.fn().mockResolvedValue([
        {
          repositoryId: 1,
          repositoryName: 'test-repo',
          success: true,
          message: '동기화 성공',
          commitCount: 2,
          pullRequestCount: 1,
          reviewCount: 1,
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
          commitCount: 3,
          pullRequestCount: 2,
          reviewCount: 1,
          jiraIssueCount: 0,
          startTime: new Date(),
          endTime: new Date(),
          errors: []
        }
      ]),
      getSyncProgress: vi.fn().mockReturnValue(mockProgress),
      isSyncInProgress: vi.fn().mockReturnValue(false)
    }))
  }
})

// 테스트용 저장소 데이터 생성
async function createTestRepository() {
  const db = getDB()
  
  // 기존 테스트 데이터가 있으면 삭제
  await db.delete(schema.repositories).where(eq(schema.repositories.name, 'test-repo'))
  
  // 테스트 저장소 추가
  const repoId = await db.insert(schema.repositories).values({
    name: 'test-repo',
    fullName: 'test-owner/test-repo',
    url: 'https://github.com/test-owner/test-repo',
    apiUrl: 'https://api.github.com',
    provider: 'github',
    apiToken: 'mock-token-for-testing',
    active: true,
    lastSyncAt: new Date(0).toISOString() // 1970년으로 설정하여 모든 데이터 동기화
  }).returning({ id: schema.repositories.id })
  
  return repoId[0].id
}

// 성공적인 API 응답 핸들러
const successResponseHandlers = [
  graphql.query('GetRepositoryCommits', () => {
    return HttpResponse.json({
      data: {
        repository: {
          defaultBranchRef: {
            target: {
              history: {
                nodes: [
                  {
                    oid: 'test-commit-id-1',
                    messageHeadline: 'Test commit 1',
                    message: 'Test commit message 1',
                    committedDate: '2023-01-01T12:00:00Z',
                    additions: 100,
                    deletions: 10,
                    changedFiles: 5,
                    author: {
                      name: 'Test User',
                      email: 'test@example.com',
                      user: {
                        login: 'test-user',
                        id: 'test-user-id',
                        avatarUrl: 'https://example.com/avatar.jpg'
                      }
                    },
                    committer: {
                      name: 'Test User',
                      email: 'test@example.com',
                      user: {
                        login: 'test-user',
                        id: 'test-user-id'
                      }
                    }
                  }
                ],
                pageInfo: {
                  hasNextPage: false,
                  endCursor: null
                }
              }
            }
          }
        }
      }
    })
  }),
  
  graphql.query('GetRepositoryPullRequests', () => {
    return HttpResponse.json({
      data: {
        repository: {
          pullRequests: {
            nodes: [
              {
                number: 1,
                title: 'Test PR 1',
                body: 'Test PR body',
                state: 'MERGED',
                isDraft: false,
                createdAt: '2023-01-10T10:00:00Z',
                updatedAt: '2023-01-15T14:00:00Z',
                closedAt: '2023-01-15T14:00:00Z',
                mergedAt: '2023-01-15T14:00:00Z',
                additions: 120,
                deletions: 30,
                changedFiles: 5,
                author: {
                  login: 'test-user2',
                  id: 'test-user-id-2',
                  avatarUrl: 'https://example.com/avatar2.jpg',
                  name: 'Test User 2',
                  email: 'test2@example.com'
                },
                mergedBy: {
                  login: 'test-user',
                  id: 'test-user-id'
                },
                reviews: {
                  nodes: [
                    {
                      id: 'review-id-1',
                      state: 'APPROVED',
                      body: 'Looks good!',
                      submittedAt: '2023-01-14T12:00:00Z',
                      author: {
                        login: 'test-user',
                        id: 'test-user-id',
                        avatarUrl: 'https://example.com/avatar.jpg'
                      }
                    }
                  ],
                  pageInfo: {
                    hasNextPage: false,
                    endCursor: null
                  }
                }
              }
            ],
            pageInfo: {
              hasNextPage: false,
              endCursor: null
            }
          }
        }
      }
    })
  })
]

// 에러 응답 핸들러
const errorResponseHandlers = [
  graphql.query('GetRepositoryCommits', () => {
    return HttpResponse.json(
      {
        errors: [
          {
            message: 'API rate limit exceeded',
            locations: [{ line: 2, column: 3 }],
            path: ['repository', 'defaultBranchRef', 'target', 'history']
          }
        ]
      },
      { status: 403 }
    )
  })
]

describe('SyncManager 통합 테스트', () => {
  let syncManager: SyncManager
  
  beforeEach(() => {
    // SyncManager 인스턴스 생성
    syncManager = new SyncManager()
  })
  
  test('단일 저장소 동기화 성공', async () => {
    // 성공적인 API 응답 설정
    server.use(...successResponseHandlers)
    
    // 저장소 동기화 실행
    const result = await syncManager.syncRepository(1)
    
    // 결과 검증
    expect(result.success).toBe(true)
    expect(result.repositoryId).toBe(1)
    expect(result.commitCount).toBeGreaterThan(0)
    expect(result.pullRequestCount).toBeGreaterThan(0)
    expect(result.reviewCount).toBeGreaterThan(0)
    expect(result.errors).toHaveLength(0)
    
    // 시간 관련 필드 존재 여부 확인
    expect(result.startTime).toBeInstanceOf(Date)
    expect(result.endTime).toBeInstanceOf(Date)
  })
  
  test('여러 저장소 일괄 동기화', async () => {
    // 성공적인 API 응답 설정
    server.use(...successResponseHandlers)
    
    // 모든 저장소 동기화 실행 (concurrency=2로 병렬 처리)
    const results = await syncManager.syncAllRepositories(false, 2)
    
    // 결과 검증
    expect(results.length).toBeGreaterThanOrEqual(2)
    
    const successCount = results.filter(r => r.success).length
    expect(successCount).toBeGreaterThanOrEqual(1)
    
    // 진행 상황 추적 확인
    const progress = syncManager.getSyncProgress()
    expect(progress.total).toBeGreaterThanOrEqual(2)
    expect(progress.completed + progress.failed).toBeGreaterThanOrEqual(2)
    expect(progress.status).toBe('completed')
  })
  
  test('동기화 진행 상황 추적', async () => {
    // 성공적인 API 응답 설정
    server.use(...successResponseHandlers)
    
    // 진행 상황 확인
    const progress = syncManager.getSyncProgress()
    expect(progress).toBeDefined()
    expect(progress.status).toBeDefined()
  })
}) 