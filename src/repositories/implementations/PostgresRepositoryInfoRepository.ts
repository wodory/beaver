import { Repository } from '../../types/settings';
import { RepositoryInfoRepository } from '../interfaces/RepositoryInfoRepository';
import { getDB } from '../../db/index';
import { eq } from 'drizzle-orm';
import { repositories } from '../../db/schema/index';

export class PostgresRepositoryInfoRepository implements RepositoryInfoRepository {
  async findById(id: number): Promise<Repository | null> {
    const db = getDB();
    const result = await db.query.repositories.findFirst({
      where: eq(repositories.id, id)
    });
    
    if (!result) {
      return null;
    }
    
    return {
      id: result.id,
      url: result.cloneUrl,
      name: result.name,
      fullName: result.fullName,
      type: result.type as any,
      owner: '', // 추후 처리 필요
      ownerReference: ''
    };
  }
  
  async save(repository: Repository): Promise<Repository> {
    const db = getDB();
    const now = new Date();
    
    const result = await db.insert(repositories).values({
      name: repository.name,
      fullName: repository.fullName,
      cloneUrl: repository.url,
      type: repository.type,
      createdAt: now,
      updatedAt: now,
      lastSyncAt: now
    }).returning();
    
    const savedRepo = result[0];
    
    return {
      id: savedRepo.id,
      url: savedRepo.cloneUrl,
      name: savedRepo.name,
      fullName: savedRepo.fullName,
      type: savedRepo.type as any,
      owner: repository.owner,
      ownerReference: repository.ownerReference
    };
  }
  
  async update(id: number, data: Partial<Repository>): Promise<Repository> {
    const db = getDB();
    const updateData: any = {
      updatedAt: new Date()
    };
    
    if (data.name) updateData.name = data.name;
    if (data.url) updateData.cloneUrl = data.url;
    if (data.fullName) updateData.fullName = data.fullName;
    if (data.type) updateData.type = data.type;
    
    const result = await db.update(repositories)
      .set(updateData)
      .where(eq(repositories.id, id))
      .returning();
    
    const updatedRepo = result[0];
    
    return {
      id: updatedRepo.id,
      url: updatedRepo.cloneUrl,
      name: updatedRepo.name,
      fullName: updatedRepo.fullName,
      type: updatedRepo.type as any,
      owner: data.owner || '',
      ownerReference: data.ownerReference || ''
    };
  }
} 