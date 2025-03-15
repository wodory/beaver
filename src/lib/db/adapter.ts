// 데이터베이스 어댑터 인터페이스
export interface DatabaseAdapter {
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<void>;
  close(): Promise<void>;
}

// 추상 어댑터 클래스
export abstract class BaseAdapter implements DatabaseAdapter {
  abstract query<T>(sql: string, params?: any[]): Promise<T[]>;
  abstract execute(sql: string, params?: any[]): Promise<void>;
  abstract close(): Promise<void>;
} 