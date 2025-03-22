/**
 * 데이터베이스 어댑터 팩토리
 * 
 * 데이터베이스 타입에 따라 적절한 어댑터를 생성하고 반환하는 팩토리 클래스입니다.
 */
import { IDatabaseAdapter } from '../adapters/IDatabaseAdapter.js';
import { NeonDBAdapter } from '../adapters/NeonDBAdapter.js';
import { SQLiteAdapter } from '../adapters/SQLiteAdapter.js';

/**
 * 지원하는 데이터베이스 타입
 */
export enum DatabaseType {
  PostgreSQL = 'postgresql',
  SQLite = 'sqlite'
}

/**
 * 데이터베이스 어댑터 팩토리 클래스
 */
export class DatabaseAdapterFactory {
  private static instance: DatabaseAdapterFactory;
  private adapters: Map<string, IDatabaseAdapter> = new Map();
  
  /**
   * 싱글톤 인스턴스 반환
   */
  public static getInstance(): DatabaseAdapterFactory {
    if (!DatabaseAdapterFactory.instance) {
      DatabaseAdapterFactory.instance = new DatabaseAdapterFactory();
    }
    return DatabaseAdapterFactory.instance;
  }
  
  /**
   * 데이터베이스 어댑터 생성
   * @param type 데이터베이스 타입
   * @param connectionString 연결 문자열
   * @returns 데이터베이스 어댑터 인스턴스
   */
  public createAdapter(type: string, connectionString: string): IDatabaseAdapter {
    // 캐시된 어댑터가 있으면 재사용
    const cacheKey = `${type}:${connectionString}`;
    if (this.adapters.has(cacheKey)) {
      return this.adapters.get(cacheKey)!;
    }
    
    // 타입에 따라 어댑터 생성
    let adapter: IDatabaseAdapter;
    
    switch (type) {
      case DatabaseType.PostgreSQL:
        adapter = new NeonDBAdapter(connectionString);
        break;
      case DatabaseType.SQLite:
        adapter = new SQLiteAdapter(connectionString);
        break;
      default:
        throw new Error(`지원하지 않는 데이터베이스 타입: ${type}`);
    }
    
    // 어댑터 캐싱
    this.adapters.set(cacheKey, adapter);
    
    return adapter;
  }
  
  /**
   * 캐시된 어댑터 가져오기
   * @param type 데이터베이스 타입
   * @param connectionString 연결 문자열
   * @returns 데이터베이스 어댑터 인스턴스 또는 undefined
   */
  public getAdapter(type: string, connectionString: string): IDatabaseAdapter | undefined {
    const cacheKey = `${type}:${connectionString}`;
    return this.adapters.get(cacheKey);
  }
  
  /**
   * 모든 어댑터 초기화
   */
  public async initialize(): Promise<void> {
    // 모든 캐시된 어댑터 초기화
    for (const adapter of this.adapters.values()) {
      await adapter.initialize();
    }
  }
  
  /**
   * 모든 어댑터 연결 종료
   */
  public async closeAll(): Promise<void> {
    // 모든 캐시된 어댑터 연결 종료
    for (const adapter of this.adapters.values()) {
      await adapter.close();
    }
    
    // 캐시 비우기
    this.adapters.clear();
  }
}

// 기본 인스턴스 내보내기
export const databaseAdapterFactory = DatabaseAdapterFactory.getInstance(); 