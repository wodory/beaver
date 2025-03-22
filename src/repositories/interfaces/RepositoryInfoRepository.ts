import { Repository } from '../../types/settings';

export interface RepositoryInfoRepository {
  findById(id: number): Promise<Repository | null>;
  save(repository: Repository): Promise<Repository>;
  update(id: number, data: Partial<Repository>): Promise<Repository>;
} 