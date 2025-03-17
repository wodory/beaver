import { IDatabaseAdapter } from './adapters/IDatabaseAdapter';
import { PostgreSQLAdapter } from './adapters/PostgreSQLAdapter';
import { SQLiteAdapter } from './adapters/SQLiteAdapter';

/**
 * 데이터베이스 유형 열거형
 */
export enum DatabaseType {
  POSTGRESQL = 'postgresql',
  SQLITE = 'sqlite'
}

/**
 * 데이터베이스 팩토리 클래스
 * 
 * 이 클래스는 데이터베이스 어댑터 인스턴스를 생성하는 팩토리 역할을 합니다.
 * 시스템 설정에 따라 적절한 데이터베이스 어댑터를 생성합니다.
 */
export class DatabaseFactory {
  /**
   * 데이터베이스 어댑터 인스턴스를 생성합니다.
   * 
   * @param type 데이터베이스 유형
   * @param connectionString 데이터베이스 연결 문자열 또는 파일 경로
   * @returns 데이터베이스 어댑터 인스턴스
   */
  static createAdapter(type: DatabaseType, connectionString: string): IDatabaseAdapter {
    switch (type) {
      case DatabaseType.POSTGRESQL:
        return new PostgreSQLAdapter(connectionString);
      case DatabaseType.SQLITE:
        return new SQLiteAdapter(connectionString);
      default:
        throw new Error(`지원하지 않는 데이터베이스 유형: ${type}`);
    }
  }
} 