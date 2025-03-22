import { RepositoryInfo } from '../IGitServiceAdapter';
import { logger } from '../../../utils/logger.js';

/**
 * 동기화 상태 열거형
 */
export enum SyncStatus {
  IDLE = 'IDLE',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE'
}

/**
 * 동기화 실패 이유 열거형
 */
export enum SyncFailureReason {
  REPOSITORY_NOT_FOUND = 'REPOSITORY_NOT_FOUND',
  TOKEN_INVALID = 'TOKEN_INVALID',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * 동기화 결과 인터페이스
 */
export interface SyncResult {
  repositoryId: number;
  repositoryName: string;
  success: boolean;
  message: string;
  commitCount: number;
  pullRequestCount: number;
  reviewCount: number;
  jiraIssueCount: number;
  startTime: Date;
  endTime: Date;
  errors: string[];
  status: SyncStatus;
  errorMessage?: string;
  failureReason?: SyncFailureReason;
}

/**
 * 동기화 데이터 인터페이스
 */
export interface SyncData {
  commitCount: number;
  pullRequestCount: number;
  reviewCount: number;
  jiraIssueCount?: number;
}

/**
 * 동기화 결과 처리 클래스
 * 
 * 동기화 작업의 결과를 처리하고 관리합니다.
 */
export class SyncResultProcessor {
  /**
   * 초기 결과 객체를 생성합니다.
   * 
   * @param repoId 저장소 ID
   * @returns 초기화된 동기화 결과
   */
  createInitialResult(repoId: number): SyncResult {
    return {
      repositoryId: repoId,
      repositoryName: '',
      success: false,
      message: '동기화 진행 중...',
      commitCount: 0,
      pullRequestCount: 0,
      reviewCount: 0,
      jiraIssueCount: 0,
      startTime: new Date(),
      endTime: new Date(),
      errors: [],
      status: SyncStatus.IN_PROGRESS
    };
  }
  
  /**
   * 저장소를 찾을 수 없을 때 결과를 처리합니다.
   * 
   * @param repoId 저장소 ID
   * @param result 초기 결과 객체
   * @returns 실패 결과
   */
  handleRepositoryNotFound(repoId: number, result: SyncResult): SyncResult {
    const errorMessage = `저장소를 찾을 수 없습니다 (ID: ${repoId})`;
    logger.error(errorMessage);
    
    result.success = false;
    result.message = errorMessage;
    result.endTime = new Date();
    result.errors.push(errorMessage);
    result.errorMessage = errorMessage;
    result.status = SyncStatus.FAILURE;
    result.failureReason = SyncFailureReason.REPOSITORY_NOT_FOUND;
    
    return result;
  }
  
  /**
   * 에러 객체를 안전하게 문자열로 변환합니다.
   * 'Cannot convert object to primitive value' 오류 방지를 위한 유틸리티 함수입니다.
   * 
   * @param error 변환할 에러 객체
   * @returns 안전하게 변환된 문자열
   */
  private safeErrorToString(error: unknown): string {
    try {
      // null 또는 undefined 처리
      if (error === null) return "null";
      if (error === undefined) return "undefined";

      // Error 객체인 경우
      if (error instanceof Error) {
        return error.message || "Empty error message";
      }

      // 문자열인 경우
      if (typeof error === 'string') {
        return error;
      }

      // 객체인 경우 안전하게 변환 시도
      if (typeof error === 'object') {
        try {
          // 객체의 toString 메서드가 있다면 안전하게 호출
          if (error !== null && 'toString' in error && typeof (error as any).toString === 'function') {
            const stringValue = (error as any).toString();
            // [object Object] 형태가 아닌 의미 있는 값인 경우만 사용
            if (stringValue && stringValue !== '[object Object]') {
              return stringValue;
            }
          }
          
          // message 속성이 있는 경우
          if (error !== null && 'message' in error && typeof (error as any).message === 'string') {
            return (error as any).message;
          }
          
          // JSON으로 변환 시도 (순환 참조 방지)
          try {
            // 간단한 버전으로만 출력 (너무 긴 객체는 잘라냄)
            const jsonStr = JSON.stringify(error, null, 2).substring(0, 500);
            return jsonStr.length >= 500 ? jsonStr + '...' : jsonStr;
          } catch (jsonError) {
            return `[객체 변환 실패: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}]`;
          }
        } catch (objError) {
          return `[객체 처리 불가: ${objError instanceof Error ? objError.message : String(objError)}]`;
        }
      }

      // 기타 원시 타입은 안전하게 문자열로 변환
      return String(error);
    } catch (conversionError) {
      // 마지막 안전망: 어떤 이유에서든 변환에 실패한 경우
      return "[에러 메시지 변환 불가]";
    }
  }

  /**
   * 에러 스택에서 파일 정보를 추출합니다.
   * 
   * @param error 에러 객체
   * @returns 파일 및 위치 정보 문자열
   */
  private extractFileInfoFromStack(error: unknown): string {
    try {
      if (error instanceof Error && error.stack) {
        // 스택 트레이스에서 파일 경로와 행 번호 추출
        const stackLines = error.stack.split('\n');
        for (let i = 1; i < stackLines.length; i++) {
          const line = stackLines[i];
          const match = line.match(/at\s+.+\s+\((.+):(\d+):(\d+)\)/);
          if (match) {
            const [, filePath, lineNum, colNum] = match;
            // 프로젝트 루트 기준 상대 경로만 추출
            const filePathParts = filePath.split('/');
            const srcIndex = filePathParts.indexOf('src');
            if (srcIndex >= 0) {
              const relativePath = filePathParts.slice(srcIndex).join('/');
              return `${relativePath}:${lineNum}:${colNum}`;
            }
            return `${filePath}:${lineNum}:${colNum}`;
          }
        }
      }
      return '알 수 없는 위치';
    } catch (e) {
      return '파일 정보 추출 실패';
    }
  }

  /**
   * 동기화 과정에서 발생한 에러를 처리합니다.
   * 
   * @param error 발생한 에러
   * @param result 현재 동기화 결과
   * @returns 업데이트된 동기화 결과
   */
  handleSyncError(error: any, result: SyncResult): SyncResult {
    // 안전하게 에러 메시지 추출
    const errorMessage = this.safeErrorToString(error);
    
    // 에러 발생 위치 정보 추출
    const fileInfo = this.extractFileInfoFromStack(error);

    // 에러 타입 정보 추출
    // const errorType = error instanceof Error ? error.constructor.name : typeof error;

    // 전체 에러 스택 로깅 (디버깅용)
    if (error instanceof Error && error.stack) {
      logger.error(`[SyncResultProcessor] 동기화 오류 발생 (${error}): ${errorMessage}\n스택 트레이스:\n${error.stack}`);
    } else {
      logger.error(`[SyncResultProcessor] 동기화 오류 발생 (${error}): ${errorMessage} (위치: ${fileInfo})`);
    }

    // 에러 타입에 따른 세부 정보 로깅
    if (error instanceof Error) {
      if ('code' in error) {
        logger.error(`에러 코드: ${(error as any).code}`);
      }
      if ('cause' in error && error.cause) {
        logger.error(`에러 원인: ${this.safeErrorToString(error.cause)}`);
      }
    }

    // 결과 객체 업데이트
    result.success = false;
    result.message = `동기화 실패: ${errorMessage}`;
    result.errorMessage = `${errorMessage} (위치: ${fileInfo})`;
    result.errors.push(`${errorMessage} (위치: ${fileInfo})`);
    result.endTime = new Date();
    result.status = SyncStatus.FAILURE;
    result.failureReason = SyncFailureReason.INTERNAL_ERROR;
    
    return result;
  }
  
  /**
   * 성공적인 동기화 결과를 처리합니다.
   * 
   * @param result 초기 결과 객체
   * @param syncData 동기화 데이터
   * @param repoInfo 저장소 정보
   * @returns 성공 결과
   */
  processSuccessResult(result: SyncResult, syncData: SyncData, repoInfo: RepositoryInfo): SyncResult {
    result.success = true;
    result.message = '동기화 성공';
    result.commitCount = syncData.commitCount;
    result.pullRequestCount = syncData.pullRequestCount;
    result.reviewCount = syncData.reviewCount;
    result.jiraIssueCount = syncData.jiraIssueCount || 0;
    result.status = SyncStatus.SUCCESS;
    result.endTime = new Date();
    
    logger.info(`저장소 ${repoInfo.name} 동기화 성공 - 커밋: ${syncData.commitCount}, PR: ${syncData.pullRequestCount}, 리뷰: ${syncData.reviewCount}`);
    
    return result;
  }
  
  /**
   * 오류가 발생한 경우 결과 객체를 생성합니다.
   * 
   * @param repoId 저장소 ID
   * @param repoName 저장소 이름
   * @param error 에러 메시지 또는 Error 객체
   * @returns 실패 결과
   */
  createErrorResult(repoId: number, repoName: string, error: string | Error): SyncResult {
    const result = this.createInitialResult(repoId);
    result.repositoryName = repoName;
    result.success = false;
    
    // 안전하게 에러 메시지 추출
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // 에러 발생 위치 정보 추출
    let fileInfo = '알 수 없는 위치';
    if (error instanceof Error && error.stack) {
      // 스택 트레이스에서 파일 경로와 라인 번호 추출
      const stackLines = error.stack.split('\n');
      for (let i = 1; i < stackLines.length; i++) {
        const line = stackLines[i];
        // 파일 경로 및 라인 번호 패턴 검색
        const match = line.match(/at\s+.*\s+\(([^:]+):(\d+):(\d+)\)/);
        if (match) {
          const [, filePath, lineNumber, column] = match;
          fileInfo = `${filePath}:${lineNumber}:${column}`;
          break;
        }
      }
      
      // 전체 스택 트레이스 로깅
      logger.error(`동기화 오류 스택 트레이스:\n${error.stack}`);
    }
    
    result.message = `동기화 실패: ${errorMessage}`;
    result.errors.push(`${errorMessage} (위치: ${fileInfo})`);
    result.errorMessage = `${errorMessage} (위치: ${fileInfo})`;
    result.endTime = new Date();
    result.status = SyncStatus.FAILURE;
    result.failureReason = SyncFailureReason.INTERNAL_ERROR;
    
    return result;
  }
} 