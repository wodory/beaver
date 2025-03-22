import { URL } from 'url';
import { logger } from './logger.js';
import * as dns from 'dns';
import * as http from 'http';
import * as https from 'https';

/**
 * 지정된 호스트가 접근 가능한지 확인합니다.
 * 
 * @param urlString 확인할 URL 문자열
 * @param timeout 타임아웃 시간(ms) (기본값: 3000ms)
 * @returns 호스트가 접근 가능하면 true, 아니면 false
 */
export async function isHostReachable(urlString: string, timeout: number = 3000): Promise<boolean> {
  try {
    // URL 파싱
    const url = new URL(urlString);
    const hostname = url.hostname;
    const protocol = url.protocol;
    
    // DNS 확인 (호스트명이 유효한지)
    return new Promise((resolve) => {
      dns.lookup(hostname, (err) => {
        if (err) {
          logger.debug(`[네트워크] 호스트 ${hostname} DNS 확인 실패: ${err.message}`);
          resolve(false);
          return;
        }
        
        // HTTP 연결 확인
        const req = (protocol === 'https:' ? https : http).request(
          {
            hostname,
            port: url.port || (protocol === 'https:' ? 443 : 80),
            path: '/',
            method: 'HEAD',
            timeout
          },
          () => {
            logger.debug(`[네트워크] 호스트 ${hostname} 접근 가능`);
            resolve(true);
          }
        );
        
        req.on('error', (err) => {
          logger.debug(`[네트워크] 호스트 ${hostname} 연결 실패: ${err.message}`);
          resolve(false);
        });
        
        req.on('timeout', () => {
          logger.debug(`[네트워크] 호스트 ${hostname} 연결 타임아웃 (${timeout}ms)`);
          req.destroy();
          resolve(false);
        });
        
        req.end();
      });
    });
  } catch (err) {
    logger.error(`[네트워크] URL 확인 중 오류 발생: ${err}`);
    return false;
  }
}

/**
 * GitHub Enterprise 서버가 접근 가능한지 확인합니다.
 * 
 * @param enterpriseUrl GitHub Enterprise URL
 * @returns 접근 가능하면 true, 아니면 false
 */
export async function isGitHubEnterpriseReachable(enterpriseUrl: string): Promise<boolean> {
  if (!enterpriseUrl) return false;
  
  try {
    const url = new URL(enterpriseUrl);
    const hostname = url.hostname;
    
    logger.info(`[네트워크 검사] GitHub Enterprise 서버(${hostname}) 접근성 확인 중...`);
    const result = await isHostReachable(url.origin);
    
    if (!result) {
      logger.warn(`[네트워크 검사] GitHub Enterprise 서버(${hostname})에 접근할 수 없습니다. 사내망(VPN) 연결이 필요합니다.`);
    } else {
      logger.info(`[네트워크 검사] GitHub Enterprise 서버(${hostname})에 접근 가능합니다.`);
    }
    
    return result;
  } catch (err) {
    logger.error(`[네트워크 검사] GitHub Enterprise URL(${enterpriseUrl}) 확인 중 오류 발생: ${err}`);
    return false;
  }
} 