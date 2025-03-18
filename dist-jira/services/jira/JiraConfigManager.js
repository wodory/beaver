import { logger } from '../../utils/logger.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
/**
 * JIRA 어댑터 설정을 관리하는 클래스
 */
export class JiraConfigManager {
    config = null;
    /**
     * 생성자
     */
    constructor() {
        // 빈 생성자
    }
    /**
     * 환경 변수에서 JIRA 설정을 로드합니다.
     */
    loadFromEnv() {
        // 환경 변수 로드
        dotenv.config();
        const baseUrl = process.env.JIRA_BASE_URL;
        const username = process.env.JIRA_USERNAME;
        const apiToken = process.env.JIRA_API_TOKEN;
        const projectKeys = process.env.JIRA_PROJECT_KEYS?.split(',') || [];
        // 필수 환경 변수 확인
        if (!baseUrl || !username || !apiToken) {
            throw new Error('JIRA API 설정이 없습니다. JIRA_BASE_URL, JIRA_USERNAME 및 JIRA_API_TOKEN 환경 변수를 설정하세요.');
        }
        this.config = {
            baseUrl: baseUrl.trim(),
            username: username.trim(),
            apiToken: apiToken.trim(),
            projectKeys: projectKeys.map(key => key.trim()).filter(key => key.length > 0)
        };
        logger.info(`JIRA 설정을 로드했습니다. URL: ${this.config.baseUrl}, 프로젝트 키: ${this.config.projectKeys.join(', ') || 'None'}`);
        return this.config;
    }
    /**
     * JSON 파일에서 JIRA 설정을 로드합니다.
     * @param filePath - 설정 파일 경로
     */
    loadFromFile(filePath) {
        try {
            const configPath = path.resolve(process.cwd(), filePath);
            const configData = fs.readFileSync(configPath, 'utf8');
            const config = JSON.parse(configData);
            // 필수 필드 확인
            if (!config.baseUrl || !config.username || !config.apiToken) {
                throw new Error('JIRA API 설정 파일에 필수 필드가 없습니다. baseUrl, username, apiToken이 필요합니다.');
            }
            this.config = config;
            logger.info(`JIRA 설정 파일을 로드했습니다: ${filePath}`);
            return this.config;
        }
        catch (error) {
            logger.error(`JIRA 설정 파일 로드 실패: ${error}`);
            throw error;
        }
    }
    /**
     * 현재 로드된 설정을 가져옵니다.
     */
    getConfig() {
        if (!this.config) {
            throw new Error('JIRA 설정이 로드되지 않았습니다. loadFromEnv() 또는 loadFromFile()을 먼저 호출하세요.');
        }
        return this.config;
    }
    /**
     * 설정이 유효한지 확인합니다.
     */
    validateConfig(config) {
        if (!config.baseUrl || !config.username || !config.apiToken) {
            return false;
        }
        // URL 형식 확인
        try {
            new URL(config.baseUrl);
        }
        catch (error) {
            logger.error(`잘못된 JIRA URL: ${config.baseUrl}`);
            return false;
        }
        return true;
    }
}
//# sourceMappingURL=JiraConfigManager.js.map