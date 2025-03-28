/**
 * 간단한 로깅 유틸리티
 * 개발 및 디버깅에 사용되는 기본 로거
 */
export const logger = {
    /**
     * 정보 로그 메시지를 출력합니다.
     * @param message 로그 메시지
     */
    info: (message) => {
        console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
    },
    /**
     * 디버그 로그 메시지를 출력합니다.
     * @param message 로그 메시지
     */
    debug: (message) => {
        console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`);
    },
    /**
     * 경고 로그 메시지를 출력합니다.
     * @param message 로그 메시지
     */
    warn: (message) => {
        console.warn(`[WARN] ${new Date().toISOString()}: ${message}`);
    },
    /**
     * 에러 로그 메시지를 출력합니다.
     * @param message 로그 메시지
     */
    error: (message) => {
        console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
    }
};
//# sourceMappingURL=logger.js.map