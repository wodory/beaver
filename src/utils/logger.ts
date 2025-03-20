/**
 * 간단한 로깅 유틸리티
 * 개발 및 디버깅에 사용되는 기본 로거
 */
export const logger = {
  /**
   * 정보 로그 메시지를 출력합니다.
   * @param message 로그 메시지
   * @param data 추가 데이터(선택적)
   */
  info: (message: string, data?: any): void => {
    if (data) {
      console.log(`[INFO] ${new Date().toISOString()}: ${message}`, data);
    } else {
      console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
    }
  },

  /**
   * 디버그 로그 메시지를 출력합니다.
   * @param message 로그 메시지
   * @param data 추가 데이터(선택적)
   */
  debug: (message: string, data?: any): void => {
    if (data) {
      console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`, data);
    } else {
      console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`);
    }
  },

  /**
   * 경고 로그 메시지를 출력합니다.
   * @param message 로그 메시지
   * @param data 추가 데이터(선택적)
   */
  warn: (message: string, data?: any): void => {
    if (data) {
      console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, data);
    } else {
      console.warn(`[WARN] ${new Date().toISOString()}: ${message}`);
    }
  },

  /**
   * 에러 로그 메시지를 출력합니다.
   * @param message 로그 메시지
   * @param error 에러 객체(선택적)
   */
  error: (message: string, error?: any): void => {
    if (error) {
      console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error);
    } else {
      console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
    }
  }
}; 