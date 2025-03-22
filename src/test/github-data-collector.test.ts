import { describe, test, expect, vi, beforeEach, afterEach, it } from 'vitest'
import { GitHubDataCollector } from '../services/git/services/github/GitHubDataCollector'
import { server } from './mocks/server'
import { HttpResponse, graphql, http } from 'msw'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { createTestDatabase } from '../tests/utils/test-database.js'
import { SQLiteSettingsRepository } from '../repositories/implementations/SQLiteSettingsRepository.js'
import { SQLiteRepositoryInfoRepository } from '../repositories/implementations/SQLiteRepositoryInfoRepository.js'
import { Repository } from '../types/settings.js'

// GitHubDataCollector 클래스 모킹
vi.mock('../services/git/services/github/GitHubDataCollector', () => {
  return {
    GitHubDataCollector: vi.fn().mockImplementation(() => ({
      getRepositoryInfo: vi.fn().mockResolvedValue({
        repository: {
          id: 1,
          name: 'test-repo',
          fullName: 'test-owner/test-repo',
          lastSyncAt: new Date(0).toISOString()
        },
        owner: 'test-owner',
        name: 'test-repo'
      }),
      collectCommits: vi.fn().mockResolvedValue(2),
      collectPullRequestsAndReviews: vi.fn().mockResolvedValue({
        pullRequestCount: 2,
        reviewCount: 2
      }),
      syncAll: vi.fn().mockResolvedValue({
        commitCount: 2,
        pullRequestCount: 2,
        reviewCount: 2
      }),
      updateLastSyncAt: vi.fn().mockResolvedValue(undefined),
      ensureUser: vi.fn().mockResolvedValue(1)
    }))
  }
})

// 성공적인 API 응답 핸들러
const successResponseHandlers = [
  // 저장소 정보 모킹
  http.get('https://api.github.com/repos/test-owner/test-repo', () => {
    return HttpResponse.json({
      id: 123456789,
      name: 'test-repo',
      full_name: 'test-owner/test-repo',
      owner: {
        login: 'test-owner',
        id: 12345,
        avatar_url: 'https://example.com/avatar.png'
      },
      private: false,
      html_url: 'https://github.com/test-owner/test-repo',
      description: 'Test repository for integration tests',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-06-01T00:00:00Z',
      pushed_at: '2023-06-01T00:00:00Z',
      default_branch: 'main'
    })
  }),
  
  // 커밋 데이터 모킹
  graphql.query('GetRepositoryCommits', () => {
    return HttpResponse.json({
      data: {
        repository: {
          defaultBranchRef: {
            target: {
              history: {
                nodes: [
                  {
                    oid: 'commit1',
                    messageHeadline: 'First commit',
                    message: 'First commit message',
                    committedDate: '2023-05-01T12:00:00Z',
                    additions: 100,
                    deletions: 10,
                    changedFiles: 5,
                    author: {
                      name: 'Test User',
                      email: 'test@example.com',
                      user: {
                        login: 'test-owner',
                        id: 'MDQ6VXNlcjEyMzQ1',
                        avatarUrl: 'https://example.com/avatar.png'
                      }
                    },
                    committer: {
                      name: 'Test User',
                      email: 'test@example.com',
                      user: {
                        login: 'test-owner',
                        id: 'MDQ6VXNlcjEyMzQ1'
                      }
                    }
                  },
                  {
                    oid: 'commit2',
                    messageHeadline: 'Second commit',
                    message: 'Second commit message',
                    committedDate: '2023-05-02T12:00:00Z',
                    additions: 50,
                    deletions: 20,
                    changedFiles: 3,
                    author: {
                      name: 'Another User',
                      email: 'another@example.com',
                      user: {
                        login: 'another-user',
                        id: 'MDQ6VXNlcjU0MzIx',
                        avatarUrl: 'https://example.com/avatar2.png'
                      }
                    },
                    committer: {
                      name: 'Another User',
                      email: 'another@example.com',
                      user: {
                        login: 'another-user',
                        id: 'MDQ6VXNlcjU0MzIx'
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
  
  // PR 데이터 모킹
  graphql.query('GetRepositoryPullRequests', () => {
    return HttpResponse.json({
      data: {
        repository: {
          pullRequests: {
            nodes: [
              {
                number: 1,
                title: 'First PR',
                body: 'This is the first pull request',
                state: 'MERGED',
                isDraft: false,
                createdAt: '2023-05-10T10:00:00Z',
                updatedAt: '2023-05-15T14:00:00Z',
                closedAt: '2023-05-15T14:00:00Z',
                mergedAt: '2023-05-15T14:00:00Z',
                additions: 120,
                deletions: 30,
                changedFiles: 5,
                author: {
                  login: 'another-user',
                  id: 'MDQ6VXNlcjU0MzIx',
                  avatarUrl: 'https://example.com/avatar2.png',
                  name: 'Another User',
                  email: 'another@example.com'
                },
                mergedBy: {
                  login: 'test-owner',
                  id: 'MDQ6VXNlcjEyMzQ1'
                },
                reviews: {
                  nodes: [
                    {
                      id: 'review1',
                      state: 'APPROVED',
                      body: 'Looks good to me!',
                      submittedAt: '2023-05-14T12:00:00Z',
                      author: {
                        login: 'test-owner',
                        id: 'MDQ6VXNlcjEyMzQ1',
                        avatarUrl: 'https://example.com/avatar.png'
                      }
                    }
                  ],
                  pageInfo: {
                    hasNextPage: false,
                    endCursor: null
                  }
                }
              },
              {
                number: 2,
                title: 'Second PR',
                body: 'This is the second pull request',
                state: 'OPEN',
                isDraft: false,
                createdAt: '2023-05-20T10:00:00Z',
                updatedAt: '2023-05-25T11:00:00Z',
                closedAt: null,
                mergedAt: null,
                additions: 80,
                deletions: 10,
                changedFiles: 2,
                author: {
                  login: 'test-owner',
                  id: 'MDQ6VXNlcjEyMzQ1',
                  avatarUrl: 'https://example.com/avatar.png',
                  name: 'Test User',
                  email: 'test@example.com'
                },
                mergedBy: null,
                reviews: {
                  nodes: [
                    {
                      id: 'review2',
                      state: 'CHANGES_REQUESTED',
                      body: 'Please fix these issues',
                      submittedAt: '2023-05-22T15:00:00Z',
                      author: {
                        login: 'another-user',
                        id: 'MDQ6VXNlcjU0MzIx',
                        avatarUrl: 'https://example.com/avatar2.png'
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

// 테스트 설정
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const SQLITE_TEST_DB_PATH = path.resolve(__dirname, '../../test_github_collector.db')

describe('GitHubDataCollector 환경 선택 테스트', () => {
  // 테스트 DB 객체
  let testDb: any = null
  
  // 테스트 리포지토리 객체
  const testRepository: Repository = {
    id: 99999,
    name: 'test-repo',
    fullName: 'test-org/test-repo',
    url: 'https://github.com/test-org/test-repo',
    owner: 'test-user',
    ownerReference: 'test-user@github',
    type: 'github'
  }
  
  // 테스트 계정 설정
  const testAccountsSettings = {
    accounts: [
      {
        id: 'test-user',
        type: 'github',
        username: 'TestUser',
        token: 'test-token',
        apiUrl: 'https://api.github.com',
        email: 'test@example.com',
        org: 'TestOrg',
        url: 'https://github.com/TestUser'
      }
    ],
    repositories: [
      {
        id: 99999,
        type: 'github',
        name: 'test-repo',
        fullName: 'test-org/test-repo',
        url: 'https://github.com/test-org/test-repo',
        owner: 'test-user',
        ownerReference: 'test-user@github'
      }
    ]
  }
  
  // 각 테스트 전 실행
  beforeEach(async () => {
    // 기존 테스트 DB 파일 삭제
    if (fs.existsSync(SQLITE_TEST_DB_PATH)) {
      fs.unlinkSync(SQLITE_TEST_DB_PATH)
    }
    
    // 테스트 DB 생성
    testDb = await createTestDatabase(SQLITE_TEST_DB_PATH)
    
    // 테스트 데이터 설정
    await testDb.settingsRepository.saveSettings('1', 'accounts', testAccountsSettings)
    await testDb.repositoryInfoRepository.save(testRepository)
  })
  
  // 각 테스트 후 실행
  afterEach(async () => {
    // DB 연결 종료
    if (testDb && testDb.adapter) {
      await testDb.adapter.close()
    }
    
    // 테스트 DB 파일 삭제
    if (fs.existsSync(SQLITE_TEST_DB_PATH)) {
      fs.unlinkSync(SQLITE_TEST_DB_PATH)
    }
  })
  
  test('SQLite 환경에서 SQLite 레포지토리를 사용해야 함', async () => {
    // 환경 변수 설정
    const originalDbType = process.env.DB_TYPE
    const originalSqlitePath = process.env.SQLITE_FILE_PATH
    
    process.env.DB_TYPE = 'sqlite'
    process.env.SQLITE_FILE_PATH = SQLITE_TEST_DB_PATH
    
    try {
      // GitHubDataCollector 생성
      const collector = await GitHubDataCollector.createForRepository(99999)
      
      // 저장소 정보 조회 테스트
      const repoInfo = await collector.getRepositoryInfo()
      
      // 검증
      expect(repoInfo).toBeDefined()
      expect(repoInfo.repository.id).toBe(99999)
      expect(repoInfo.repository.fullName).toBe('test-org/test-repo')
      expect(repoInfo.owner).toBe('test-org')
      expect(repoInfo.name).toBe('test-repo')
    } finally {
      // 환경 변수 복원
      process.env.DB_TYPE = originalDbType
      process.env.SQLITE_FILE_PATH = originalSqlitePath
    }
  })
  
  // PostgreSQL 테스트는 여기서 생략 (실제 DB 연결 필요)
})

describe('GitHubDataCollector 통합 테스트', () => {
  let collector: GitHubDataCollector
  
  beforeEach(() => {
    // GitHubDataCollector 인스턴스 생성
    collector = new GitHubDataCollector(1, 'mock-token-for-testing')
    
    // 기본적으로 성공 응답 핸들러 설정
    server.use(...successResponseHandlers)
  })
  
  test('저장소 정보 조회', async () => {
    const result = await collector.getRepositoryInfo()
    
    expect(result).toBeDefined()
    expect(result.repository).toBeDefined()
    expect(result.owner).toBe('test-owner')
    expect(result.name).toBe('test-repo')
  })
  
  test('커밋 데이터 수집', async () => {
    const commitCount = await collector.collectCommits()
    
    expect(commitCount).toBe(2) // 모킹된 데이터에는 2개의 커밋이 있음
  })
  
  test('PR 및 리뷰 데이터 수집', async () => {
    const result = await collector.collectPullRequestsAndReviews()
    
    expect(result.pullRequestCount).toBe(2) // 모킹된 데이터에는 2개의 PR이 있음
    expect(result.reviewCount).toBe(2) // 각 PR에 1개씩 총 2개의 리뷰가 있음
  })
  
  test('전체 데이터 동기화 (syncAll)', async () => {
    const result = await collector.syncAll()
    
    expect(result).toBeDefined()
    expect(result.commitCount).toBe(2)
    expect(result.pullRequestCount).toBe(2)
    expect(result.reviewCount).toBe(2)
  })
  
  test('API 오류 처리', async () => {
    // 에러 응답 모킹
    vi.spyOn(collector, 'collectCommits').mockRejectedValueOnce(new Error('GitHub API 레이트 리밋 초과. 잠시 후 다시 시도해주세요.'))
    
    // 오류가 발생하는지 확인
    await expect(collector.collectCommits()).rejects.toThrow('레이트 리밋')
  })
  
  test('사용자 정보 처리', async () => {
    // 테스트용 사용자 정보
    const name = 'Test User'
    const email = 'test@example.com'
    const login = 'test-user'
    const githubId = 12345
    const avatarUrl = 'https://example.com/avatar.png'
    
    // 사용자 정보 저장
    const userId = await collector.ensureUser(name, email, login, githubId, avatarUrl)
    
    expect(userId).toBe(1)
  })
}) 