import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest'
import { server } from './mocks/server'
import { initializeDatabase, closeDatabase } from '../db'

// 모의 테스트 데이터 생성
const mockRepositories = [
  {
    id: 1,
    name: 'test-repo',
    fullName: 'test-owner/test-repo',
    url: 'https://github.com/test-owner/test-repo',
    apiUrl: 'https://api.github.com',
    provider: 'github',
    apiToken: 'mock-token-for-testing',
    active: true,
    lastSyncAt: new Date(0).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const mockUsers = [
  {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    login: 'test-user',
    githubId: 12345,
    avatarUrl: 'https://example.com/avatar.png',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const mockCommits = [
  {
    id: 'commit1',
    repositoryId: 1,
    authorId: 1,
    committerId: 1,
    message: 'First commit message',
    committedAt: new Date().toISOString(),
    additions: 100,
    deletions: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const mockPullRequests = [
  {
    id: 1,
    repositoryId: 1,
    number: 1,
    title: 'Test PR',
    body: 'Test PR body',
    state: 'open',
    authorId: 1,
    isDraft: false,
    additions: 100,
    deletions: 10,
    changedFiles: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    closedAt: null,
    mergedAt: null,
    mergedBy: null
  }
]

const mockReviews = [
  {
    id: 'review1',
    pullRequestId: 1,
    reviewerId: 1,
    state: 'APPROVED',
    body: 'Looks good!',
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// 데이터베이스 모킹
vi.mock('../db', () => {
  const mockDbData = {
    repositories: [...mockRepositories],
    users: [...mockUsers],
    commits: [...mockCommits],
    pullRequests: [...mockPullRequests],
    prReviews: [...mockReviews]
  }
  
  // 기본 쿼리 결과 생성 함수
  const createMockQueryResult = (tableName) => ({
    findFirst: vi.fn().mockImplementation(({ where }) => {
      if (!where) return mockDbData[tableName][0] || null
      
      // eq 조건으로 검색
      const condition = where.conditions?.[0] || where
      const field = condition.left?.name || condition.left
      const value = condition.right
      
      return mockDbData[tableName].find(row => row[field] === value) || null
    }),
    find: vi.fn().mockImplementation(({ where }) => {
      if (!where) return mockDbData[tableName]
      
      // eq 조건으로 검색
      const condition = where.conditions?.[0] || where
      const field = condition.left?.name || condition.left
      const value = condition.right
      
      return mockDbData[tableName].filter(row => row[field] === value) || []
    })
  })
  
  // 모의 DB 쿼리 객체
  const mockQuery = {
    repositories: createMockQueryResult('repositories'),
    users: createMockQueryResult('users'),
    commits: createMockQueryResult('commits'),
    pullRequests: createMockQueryResult('pullRequests'),
    prReviews: createMockQueryResult('prReviews')
  }
  
  // 모의 DB 객체
  const mockDB = {
    query: mockQuery,
    execute: vi.fn().mockResolvedValue([]),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockImplementation((table) => {
      return {
        where: vi.fn().mockImplementation(() => mockDbData[table] || [])
      }
    }),
    delete: vi.fn().mockImplementation((table) => {
      return {
        where: vi.fn().mockImplementation(() => {
          return {
            execute: vi.fn().mockResolvedValue({ rowCount: 1 })
          }
        })
      }
    }),
    insert: vi.fn().mockImplementation((table) => {
      return {
        values: vi.fn().mockImplementation((data) => {
          const newId = mockDbData[table].length + 1
          const newItem = { id: data.id || newId, ...data }
          mockDbData[table].push(newItem)
          
          return {
            returning: vi.fn().mockImplementation((fields) => {
              if (fields) {
                const result = {}
                Object.keys(fields).forEach(key => {
                  result[key] = newItem[key]
                })
                return [result]
              }
              return [newItem]
            })
          }
        })
      }
    }),
    update: vi.fn().mockImplementation((table) => {
      return {
        set: vi.fn().mockImplementation((data) => {
          return {
            where: vi.fn().mockImplementation((condition) => {
              const field = condition.left?.name || condition.left
              const value = condition.right
              
              const index = mockDbData[table].findIndex(item => item[field] === value)
              if (index !== -1) {
                mockDbData[table][index] = { ...mockDbData[table][index], ...data }
              }
              
              return {
                execute: vi.fn().mockResolvedValue({ rowCount: index !== -1 ? 1 : 0 })
              }
            })
          }
        })
      }
    })
  }
  
  return {
    initializeDatabase: vi.fn().mockResolvedValue(undefined),
    closeDatabase: vi.fn().mockResolvedValue(undefined),
    getDB: vi.fn().mockReturnValue(mockDB),
    schemaToUse: {
      repositories: {
        id: 'id',
        name: 'name',
        fullName: 'fullName',
        lastSyncAt: 'lastSyncAt'
      },
      commits: {
        id: 'id',
        repositoryId: 'repositoryId'
      },
      pullRequests: {
        id: 'id',
        repositoryId: 'repositoryId',
        number: 'number'
      },
      users: {
        id: 'id',
        login: 'login',
        githubId: 'githubId'
      },
      prReviews: {
        id: 'id',
        pullRequestId: 'pullRequestId'
      }
    }
  }
})

// MSW 서버 설정
beforeAll(async () => {
  // HTTP 요청 모킹 시작
  server.listen({ onUnhandledRequest: 'bypass' })
  
  // 환경 변수 모킹
  vi.stubEnv('GITHUB_TOKEN', 'mock-token-for-testing')
})

// 각 테스트 전에 실행
beforeEach(() => {
  // 요청 핸들러를 초기 상태로 재설정
  server.resetHandlers()
})

// 모든 테스트 후에 실행
afterAll(async () => {
  // HTTP 요청 모킹 종료
  server.close()
  
  // 환경 변수 모킹 복원
  vi.unstubAllEnvs()
})

// 테스트 간 격리를 위한 모킹 초기화
afterEach(() => {
  vi.clearAllMocks()
}) 