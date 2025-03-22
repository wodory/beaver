/**
 * 데이터베이스 어댑터 인터페이스
 */
export class IDatabaseAdapter {
  // 데이터베이스 인스턴스
  db = null;
  
  /**
   * 데이터베이스 연결을 초기화합니다.
   */
  async initialize() {
    throw new Error("Not implemented");
  }
  
  /**
   * 데이터베이스 연결을 종료합니다.
   */
  async close() {
    throw new Error("Not implemented");
  }
  
  /**
   * 쿼리를 실행합니다.
   */
  async query(query) {
    throw new Error("Not implemented");
  }
  
  /**
   * SQL 문을 실행합니다.
   */
  async execute(sql, params) {
    throw new Error("Not implemented");
  }
  
  /**
   * 데이터를 삽입합니다.
   */
  async insert(table, data) {
    throw new Error("Not implemented");
  }
  
  /**
   * 데이터를 조회합니다.
   */
  async select(query) {
    throw new Error("Not implemented");
  }
  
  /**
   * 데이터를 수정합니다.
   */
  async update(table, data, where) {
    throw new Error("Not implemented");
  }
  
  /**
   * 데이터를 삭제합니다.
   */
  async delete(table, where) {
    throw new Error("Not implemented");
  }
  
  /**
   * 트랜잭션을 시작합니다.
   */
  async beginTransaction() {
    throw new Error("Not implemented");
  }
  
  /**
   * 트랜잭션을 커밋합니다.
   */
  async commitTransaction() {
    throw new Error("Not implemented");
  }
  
  /**
   * 트랜잭션을 롤백합니다.
   */
  async rollbackTransaction() {
    throw new Error("Not implemented");
  }
}
