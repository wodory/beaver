import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import Database from 'better-sqlite3';
import { IDatabaseAdapter } from './IDatabaseAdapter.js';
import * as schema from '../schema-sqlite/index.js';

/**
 * SQLite 데이터베이스 어댑터
 */
export class SQLiteAdapter extends IDatabaseAdapter {
  constructor(dbPath) {
    super();
    this.dbPath = dbPath;
    this.sqlite = null;
    this.db = null;
    this.transaction = false;
  }

  /**
   * 데이터베이스 연결을 초기화합니다.
   */
  async initialize() {
    try {
      console.log(`SQLite 데이터베이스 파일 경로: ${this.dbPath}`);
      
      // 데이터베이스 연결
      this.sqlite = new Database(this.dbPath);
      
      // SQLite 프래그마 설정
      this.sqlite.pragma('journal_mode = WAL');
      this.sqlite.pragma('foreign_keys = ON');
      
      // Drizzle ORM 초기화
      this.db = drizzle(this.sqlite, { schema });
      
      // 마이그레이션 자동 실행
      await this.runMigrations();
      
      console.log('SQLite 데이터베이스 연결 성공');
      return true;
    } catch (error) {
      console.error('SQLite 연결 오류:', error);
      throw new Error(`데이터베이스 연결에 실패했습니다: ${error.message}`);
    }
  }

  /**
   * 데이터베이스 연결을 종료합니다.
   */
  async close() {
    if (this.sqlite) {
      this.sqlite.close();
      this.sqlite = null;
    }
    
    this.db = null;
    return true;
  }

  /**
   * SQL 쿼리를 실행합니다.
   */
  async query(query) {
    if (!this.sqlite) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    // 직접 SQL 실행인 경우
    if (typeof query === 'string') {
      return this.sqlite.prepare(query).all();
    }
    
    // 객체형 쿼리에서 text와 values가 있는 경우
    if (typeof query === 'object' && query.text) {
      const { text, values } = query;
      const stmt = this.sqlite.prepare(text);
      
      if (Array.isArray(values)) {
        return stmt.run(...values);
      }
      
      return stmt.run(values);
    }
    
    // Drizzle 쿼리 객체인 경우
    if (query.execute && typeof query.execute === 'function') {
      return query.execute();
    }
    
    throw new Error('지원되지 않는 쿼리 형식입니다.');
  }

  /**
   * SQL 명령을 실행합니다.
   */
  async execute(sql, params = []) {
    if (!this.sqlite) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    try {
      const stmt = this.sqlite.prepare(sql);
      return stmt.all(...params);
    } catch (error) {
      console.error('SQL 쿼리 실행 오류:', error);
      throw error;
    }
  }

  /**
   * SQL 명령을 실행합니다. (결과를 반환하지 않음)
   */
  async run(sql, params = []) {
    if (!this.sqlite) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    try {
      // SQL 태그드 템플릿 처리
      if (typeof sql === 'object' && sql.strings) {
        const { strings, values } = sql;
        let query = strings[0];
        for (let i = 0; i < values.length; i++) {
          query += `${values[i]}${strings[i + 1]}`;
        }
        const stmt = this.sqlite.prepare(query);
        return stmt.run();
      }
      
      // 일반 문자열 SQL
      const stmt = this.sqlite.prepare(sql);
      if (Array.isArray(params) && params.length > 0) {
        return stmt.run(...params);
      }
      return stmt.run();
    } catch (error) {
      console.error('SQL 실행 오류:', error);
      throw error;
    }
  }
  
  /**
   * SQL 쿼리를 실행하고 결과를 배열로 반환합니다.
   */
  async all(sql, params = []) {
    if (!this.sqlite) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    try {
      // SQL 태그드 템플릿 처리
      if (typeof sql === 'object' && sql.strings) {
        const { strings, values } = sql;
        let query = strings[0];
        for (let i = 0; i < values.length; i++) {
          query += `${values[i]}${strings[i + 1]}`;
        }
        const stmt = this.sqlite.prepare(query);
        return stmt.all();
      }
      
      // 일반 문자열 SQL
      const stmt = this.sqlite.prepare(sql);
      if (Array.isArray(params) && params.length > 0) {
        return stmt.all(...params);
      }
      return stmt.all();
    } catch (error) {
      console.error('SQL 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 데이터를 삽입합니다.
   */
  async insert(table, data) {
    if (!this.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    const result = this.db.insert(table).values(data);
    if (result.returning && typeof result.returning === 'function') {
      return result.returning().get();
    }
    
    return {};
  }

  /**
   * 데이터를 조회합니다.
   */
  async select(query) {
    if (!this.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    return await query.all();
  }

  /**
   * 데이터를 수정합니다.
   */
  async update(table, data, where) {
    if (!this.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    // 기본 업데이트 쿼리 생성
    const updateQuery = this.db.update(table).set(data);
    
    // where 조건 추가
    const finalQuery = where ? updateQuery.where(where) : updateQuery;
    
    // 결과 반환
    if (finalQuery.returning && typeof finalQuery.returning === 'function') {
      return finalQuery.returning().get();
    }
    
    return {};
  }

  /**
   * 데이터를 삭제합니다.
   */
  async delete(table, where) {
    if (!this.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    // 기본 삭제 쿼리 생성
    const deleteQuery = this.db.delete(table);
    
    // where 조건 추가
    const finalQuery = where ? deleteQuery.where(where) : deleteQuery;
    
    // 결과 반환
    if (finalQuery.returning && typeof finalQuery.returning === 'function') {
      return finalQuery.returning().get();
    }
    
    return {};
  }

  /**
   * 트랜잭션을 시작합니다.
   */
  async beginTransaction() {
    if (!this.sqlite) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    if (this.transaction) {
      throw new Error('이미 트랜잭션이 진행중입니다.');
    }
    
    this.sqlite.prepare('BEGIN TRANSACTION;').run();
    this.transaction = true;
  }

  /**
   * 트랜잭션을 커밋합니다.
   */
  async commitTransaction() {
    if (!this.sqlite) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    if (!this.transaction) {
      throw new Error('진행중인 트랜잭션이 없습니다.');
    }
    
    try {
      this.sqlite.prepare('COMMIT;').run();
    } finally {
      this.transaction = false;
    }
  }

  /**
   * 트랜잭션을 롤백합니다.
   */
  async rollbackTransaction() {
    if (!this.sqlite) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    if (!this.transaction) {
      throw new Error('진행중인 트랜잭션이 없습니다.');
    }
    
    try {
      this.sqlite.prepare('ROLLBACK;').run();
    } finally {
      this.transaction = false;
    }
  }

  /**
   * 마이그레이션을 실행합니다.
   */
  async runMigrations() {
    if (!this.db || !this.sqlite) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
    
    try {
      // SQLite 마이그레이션 폴더 경로
      const migrationsFolder = './src/db/migrations-sqlite';
      
      // await migrate(this.db, { migrationsFolder });
      console.log('SQLite 마이그레이션 건너뜀 (아직 구현되지 않음)');
      
      return true;
    } catch (error) {
      console.error('마이그레이션 오류:', error);
      
      // 테이블이 이미 존재하는 경우, 오류를 무시하고 계속 진행
      if (error.message.includes('already exists')) {
        console.log('테이블이 이미 존재함, 마이그레이션 건너뜀');
        return true;
      }
      
      throw error;
    }
  }
} 