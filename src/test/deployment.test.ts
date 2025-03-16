import { describe, it, expect, vi } from 'vitest';
import { fetchDeployments, hasDeploymentIssues } from '../api/github';
import { DeploymentEvent } from '../types/github';

// Octokit 목킹
vi.mock('@octokit/rest', () => {
  return {
    Octokit: vi.fn().mockImplementation(() => ({
      repos: {
        listDeployments: vi.fn().mockResolvedValue({
          data: [
            {
              id: 1,
              environment: 'production',
              created_at: '2023-06-12T12:00:00Z',
              creator: { login: 'user1' }
            },
            {
              id: 2,
              environment: 'staging',
              created_at: '2023-06-14T14:00:00Z',
              creator: { login: 'user2' }
            }
          ]
        }),
        listDeploymentStatuses: vi.fn().mockImplementation(({ deployment_id }) => {
          // deployment_id에.따라 다른 상태 반환
          if (deployment_id === 1) {
            return Promise.resolve({
              data: [
                {
                  state: 'success',
                  created_at: '2023-06-12T12:05:00Z'
                }
              ]
            });
          } else {
            return Promise.resolve({
              data: [
                {
                  state: 'failure',
                  created_at: '2023-06-14T14:05:00Z'
                }
              ]
            });
          }
        })
      }
    }))
  };
});

describe('배포 관련 기능 테스트', () => {
  describe('fetchDeployments', () => {
    it('GitHub API에서 배포 데이터를 가져와 DeploymentEvent 형식으로 변환해야 함', async () => {
      const deployments = await fetchDeployments('test', 'repo');
      
      expect(deployments).toHaveLength(2);
      expect(deployments[0].id).toBe(1);
      expect(deployments[0].environment).toBe('production');
      expect(deployments[0].status).toBe('success');
      expect(deployments[0].has_issues).toBe(false);
      
      expect(deployments[1].id).toBe(2);
      expect(deployments[1].status).toBe('failure');
      expect(deployments[1].has_issues).toBe(true);
    });
  });
  
  describe('hasDeploymentIssues', () => {
    it('성공 상태일 때 false를 반환해야 함', () => {
      expect(hasDeploymentIssues('success')).toBe(false);
    });
    
    it('실패 상태일 때 true를 반환해야 함', () => {
      expect(hasDeploymentIssues('failure')).toBe(true);
      expect(hasDeploymentIssues('error')).toBe(true);
    });
  });
}); 