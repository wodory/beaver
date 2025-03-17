/**
 * 데이터베이스 어댑터 인터페이스
 * 
 * 이 인터페이스는 다양한 데이터베이스 구현체에 대한 공통 인터페이스를 정의합니다.
 * 추후 데이터베이스 변경이 필요할 때 이 인터페이스를 구현하는 새로운 어댑터를 만들면 됩니다.
 */
export interface IDatabaseAdapter {
  /**
   * 데이터베이스 ORM 인스턴스
   */
  db: any;

  /**
   * 데이터베이스 연결을 초기화합니다.
   */
  initialize(): Promise<void>;

  /**
   * 데이터베이스 연결을 종료합니다.
   */
  close(): Promise<void>;

  /**
   * 쿼리를 실행합니다.
   * @param query 실행할 쿼리 객체
   * @returns 쿼리 결과
   */
  query<T>(query: any): Promise<T>;

  /**
   * 데이터를 삽입합니다.
   * @param table 테이블 이름
   * @param data 삽입할 데이터
   * @returns 삽입된 데이터의 ID 또는 삽입 결과
   */
  insert<T, R>(table: any, data: T): Promise<R>;

  /**
   * 데이터를 조회합니다.
   * @param table 테이블 이름
   * @param where 조건
   * @returns 조회된 데이터
   */
  select<T>(query: any): Promise<T[]>;

  /**
   * 데이터를 수정합니다.
   * @param table 테이블 이름
   * @param data 수정할 데이터
   * @param where 조건
   * @returns 수정된 행 수 또는 결과
   */
  update<T, R>(table: any, data: Partial<T>, where: any): Promise<R>;

  /**
   * 데이터를 삭제합니다.
   * @param table 테이블 이름
   * @param where 조건
   * @returns 삭제된 행 수 또는 결과
   */
  delete<R>(table: any, where: any): Promise<R>;

  /**
   * 트랜잭션을 시작합니다.
   */
  beginTransaction(): Promise<void>;

  /**
   * 트랜잭션을 커밋합니다.
   */
  commitTransaction(): Promise<void>;

  /**
   * 트랜잭션을 롤백합니다.
   */
  rollbackTransaction(): Promise<void>;

  /**
   * 마이그레이션을 실행합니다.
   */
  runMigrations(): Promise<void>;
} 