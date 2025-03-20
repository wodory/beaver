/**
 * 데이터베이스 유틸리티 함수
 */

/**
 * PostgreSQL 연결 문자열에서 연결 정보를 추출합니다.
 * 예: postgresql://username:password@host:port/database
 * 
 * @param connectionString PostgreSQL 연결 문자열
 * @returns 추출된 연결 정보 (호스트, 포트, 사용자, 비밀번호, 데이터베이스)
 */
export function extractPostgresInfo(connectionString: string) {
  try {
    // URL 객체 생성
    const url = new URL(connectionString);
    
    // 프로토콜 확인 (postgresql:// 또는 postgres://)
    if (!url.protocol.includes('postgres')) {
      throw new Error('유효한 PostgreSQL 연결 문자열이 아닙니다.');
    }
    
    // 호스트 추출 (서브도메인 포함)
    const host = url.hostname;
    
    // 포트 추출 (기본값: 5432)
    const port = url.port ? parseInt(url.port, 10) : 5432;
    
    // 사용자 및 비밀번호 추출
    const user = url.username;
    const password = url.password;
    
    // 데이터베이스 이름 추출 (경로에서 첫 번째 부분)
    const database = url.pathname.replace(/^\//, '');
    
    return {
      host,
      port,
      user,
      password,
      database
    };
  } catch (error) {
    console.error('PostgreSQL 연결 문자열 파싱 오류:', error);
    
    // 기본값 반환
    return {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: '',
      database: 'github_metrics'
    };
  }
} 