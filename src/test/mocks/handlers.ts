import { HttpResponse, http, graphql } from 'msw'

// 모의 저장소 정보
const mockRepoInfo = {
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
}

// 모의 커밋 데이터
const mockCommits = [
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
        id: '12345',
        avatarUrl: 'https://example.com/avatar.png'
      }
    },
    committer: {
      name: 'Test User',
      email: 'test@example.com',
      user: {
        login: 'test-owner',
        id: '12345'
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
        id: '54321',
        avatarUrl: 'https://example.com/avatar2.png'
      }
    },
    committer: {
      name: 'Another User',
      email: 'another@example.com',
      user: {
        login: 'another-user',
        id: '54321'
      }
    }
  }
]

// 모의 PR 데이터
const mockPullRequests = [
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
      id: '54321',
      avatarUrl: 'https://example.com/avatar2.png',
      name: 'Another User',
      email: 'another@example.com'
    },
    mergedBy: {
      login: 'test-owner',
      id: '12345'
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
            id: '12345',
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
      id: '12345',
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
            id: '54321',
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
]

// GitHub GraphQL API 핸들러
export const handlers = [
  // GitHub GraphQL API 모킹
  graphql.query('GetRepositoryCommits', () => {
    return HttpResponse.json({
      data: {
        repository: {
          defaultBranchRef: {
            target: {
              history: {
                nodes: mockCommits,
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
            nodes: mockPullRequests,
            pageInfo: {
              hasNextPage: false,
              endCursor: null
            }
          }
        }
      }
    })
  }),

  // REST API 모킹 (필요한 경우)
  http.get('https://api.github.com/repos/:owner/:repo', () => {
    return HttpResponse.json(mockRepoInfo)
  })
] 