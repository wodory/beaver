import { Repository } from '../../types/settings';
import { RepositoryInfoRepository } from '../interfaces/RepositoryInfoRepository';
import { SQLiteAdapter } from '../../db/adapters/SQLiteAdapter.js';

export class SQLiteRepositoryInfoRepository implements RepositoryInfoRepository {
  constructor(private adapter: SQLiteAdapter) {}
  
  async findById(id: number): Promise<Repository | null> {
    try {
      const result = await this.adapter.query(
        'SELECT * FROM repositories WHERE id = ? LIMIT 1',
        [id]
      );
      
      if (!result || (result as any[]).length === 0) {
        return null;
      }
      
      const repo = (result as any[])[0];
      return {
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        url: repo.clone_url,
        type: repo.type,
        owner: '',
        ownerReference: ''
      };
    } catch (error) {
      console.error('SQLite 저장소 조회 오류:', error);
      throw error;
    }
  }
  
  async save(repository: Repository): Promise<Repository> {
    try {
      const now = new Date().toISOString();
      
      const result = await this.adapter.query(
        `INSERT INTO repositories (name, full_name, clone_url, type, created_at, updated_at, last_sync_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)
         RETURNING *`,
        [
          repository.name,
          repository.fullName,
          repository.url,
          repository.type,
          now,
          now,
          now
        ]
      );
      
      const savedRepo = (result as any[])[0];
      return {
        id: savedRepo.id,
        name: savedRepo.name,
        fullName: savedRepo.full_name,
        url: savedRepo.clone_url,
        type: savedRepo.type,
        owner: repository.owner,
        ownerReference: repository.ownerReference
      };
    } catch (error) {
      console.error('SQLite 저장소 저장 오류:', error);
      throw error;
    }
  }
  
  async update(id: number, data: Partial<Repository>): Promise<Repository> {
    try {
      const now = new Date().toISOString();
      
      // 기존 저장소 데이터 조회
      const existingRepo = await this.findById(id);
      if (!existingRepo) {
        throw new Error(`ID가 ${id}인 저장소를 찾을 수 없습니다.`);
      }
      
      // 업데이트할 필드 및 값 목록 생성
      const updateFields = [];
      const updateValues = [];
      
      if (data.name) {
        updateFields.push('name = ?');
        updateValues.push(data.name);
      }
      
      if (data.fullName) {
        updateFields.push('full_name = ?');
        updateValues.push(data.fullName);
      }
      
      if (data.url) {
        updateFields.push('clone_url = ?');
        updateValues.push(data.url);
      }
      
      if (data.type) {
        updateFields.push('type = ?');
        updateValues.push(data.type);
      }
      
      // 항상 updated_at 업데이트
      updateFields.push('updated_at = ?');
      updateValues.push(now);
      
      // ID를 마지막에 추가
      updateValues.push(id);
      
      // 업데이트 쿼리 실행
      await this.adapter.execute(
        `UPDATE repositories SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
      
      // 업데이트된 데이터 반환
      const updatedRepo = await this.findById(id);
      if (!updatedRepo) {
        throw new Error('저장소 업데이트 후 조회에 실패했습니다.');
      }
      
      return {
        ...updatedRepo,
        owner: data.owner || existingRepo.owner,
        ownerReference: data.ownerReference || existingRepo.ownerReference
      };
    } catch (error) {
      console.error('SQLite 저장소 업데이트 오류:', error);
      throw error;
    }
  }
} 