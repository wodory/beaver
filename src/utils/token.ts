/**
 * 토큰 데이터 처리 유틸리티
 */

/**
 * 토큰 값을 안전하게 추출합니다.
 * 객체나 문자열 형태의 토큰을 적절히 처리합니다.
 * 
 * @param tokenData 토큰 데이터 (문자열 또는 객체)
 * @returns 문자열 형태의 토큰 또는 undefined
 */
export function extractToken(tokenData: unknown): string | undefined {
  // 디버그 로그 (안전하게 출력)
  try {
    // 객체 및 함수는 안전한 타입 정보만 출력
    if (typeof tokenData === 'object' || typeof tokenData === 'function') {
      console.log(`[DEBUG] extractToken 입력 값 타입: ${typeof tokenData} (상세 내용 생략)`);
    } else {
      console.log(`[DEBUG] extractToken 입력 값 타입: ${typeof tokenData}`);
    }
  } catch (logError) {
    console.log(`[DEBUG] extractToken 로깅 중 오류 발생 (무시됨)`);
  }
  
  try {
    // 토큰이 없는 경우
    if (tokenData === null || tokenData === undefined) {
      console.log(`[DEBUG] extractToken: 토큰 데이터가 null 또는 undefined입니다.`);
      return undefined;
    }

    // 이미 문자열인 경우
    if (typeof tokenData === 'string') {
      console.log(`[DEBUG] extractToken: 토큰 데이터가 이미 문자열입니다.`);
      return tokenData;
    }

    // PostgreSQL JSONB 필드에서 반환된 객체 처리
    if (typeof tokenData === 'object') {
      // 안전하게 객체 로깅
      try {
        const objType = Object.prototype.toString.call(tokenData);
        console.log(`[DEBUG] extractToken: 토큰 데이터가 객체입니다. (타입: ${objType})`);
        
        // 객체 키 정보만 안전하게 출력
        if (tokenData !== null) {
          try {
            const keys = Object.keys(tokenData as object).slice(0, 3);
            console.log(`[DEBUG] extractToken: 객체 일부 키: ${keys.join(', ')}${keys.length < Object.keys(tokenData as object).length ? '...' : ''}`);
          } catch (e) {
            console.log(`[DEBUG] extractToken: 객체 키를 가져올 수 없습니다.`);
          }
        }
      } catch (logError) {
        console.log(`[DEBUG] extractToken: 객체 로깅 중 오류 발생 (무시됨)`);
      }
      
      if (tokenData === null) {
        return undefined;
      }
      
      // 우선 토큰 객체 자체가 toString 메서드를 가진 경우
      try {
        if ('toString' in tokenData && typeof (tokenData as any).toString === 'function') {
          try {
            const stringValue = (tokenData as any).toString();
            // toString 결과가 "[object Object]"가 아닌 경우에만 유효한 값으로 처리
            if (stringValue && stringValue !== '[object Object]') {
              console.log(`[DEBUG] extractToken: toString 메서드로 추출: ${stringValue}`);
              return stringValue;
            }
          } catch (e) {
            console.log(`[DEBUG] extractToken: toString 호출 실패: ${e}`);
          }
        }
      } catch (toStringError) {
        console.log(`[DEBUG] extractToken: toString 메서드 체크 중 오류 발생 (무시됨)`);
      }
      
      try {
        const obj = tokenData as Record<string, unknown>;
        
        // 직접 일반 토큰 속성명 확인 - 가장 일반적인 케이스 먼저 처리
        for (const key of ['token', 'apiToken', 'accessToken', 'enterpriseToken']) {
          try {
            if (key in obj && typeof obj[key] === 'string') {
              console.log(`[DEBUG] extractToken: 객체에서 '${key}' 문자열 필드 추출 성공`);
              return obj[key] as string;
            }
          } catch (fieldError) {
            console.log(`[DEBUG] extractToken: '${key}' 필드 접근 중 오류 발생 (무시)`);
          }
        }
        
        // 2차 시도: 추가 검사
        for (const key of ['token', 'value', 'apiToken', 'accessToken', 'enterpriseToken']) {
          try {
            if (obj[key] !== undefined) {
              console.log(`[DEBUG] extractToken: '${key}' 속성 발견, 타입: ${typeof obj[key]}`);
              
              // 문자열인 경우 바로 반환
              if (typeof obj[key] === 'string') {
                return obj[key] as string;
              }
              
              // 객체인 경우 재귀적으로 처리 (최대 깊이 제한)
              if (typeof obj[key] === 'object' && obj[key] !== null) {
                try {
                  const extracted = extractToken(obj[key]);
                  if (extracted) {
                    console.log(`[DEBUG] extractToken: '${key}' 속성에서 중첩된 토큰 추출: ${extracted}`);
                    return extracted;
                  }
                } catch (recursiveError) {
                  console.log(`[DEBUG] extractToken: 중첩 객체 처리 중 오류 발생 (무시)`);
                }
              }
              
              // 문자열이 아닌 경우 문자열로 변환 시도
              if (obj[key] !== null) {
                try {
                  const stringValue = String(obj[key]);
                  console.log(`[DEBUG] extractToken: 문자열로 변환 결과: ${stringValue}`);
                  if (stringValue && stringValue !== '[object Object]' && stringValue !== 'null' && stringValue !== 'undefined') {
                    return stringValue;
                  }
                } catch (e) {
                  console.log(`[DEBUG] extractToken: 문자열 변환 실패: ${e}`);
                }
              }
            }
          } catch (propError) {
            console.log(`[DEBUG] extractToken: 속성 처리 중 오류 발생 (무시)`);
          }
        }
      } catch (objError) {
        console.log(`[DEBUG] extractToken: 객체 처리 중 치명적 오류 발생`, objError);
      }
    }

    // 적절한 토큰을 찾지 못한 경우
    console.log(`[DEBUG] extractToken: 적절한 토큰을 찾지 못했습니다.`);
    return undefined;
  } catch (error) {
    console.error(`[ERROR] extractToken 처리 중 오류 발생: ${error}`);
    return undefined;
  }
}

/**
 * 토큰의 일부를 마스킹하여 안전하게 로깅합니다.
 * 
 * @param token 마스킹할 토큰
 * @returns 마스킹된 토큰 문자열
 */
export function getMaskedToken(token: unknown): string {
  // 안전한 로깅
  try {
    if (token === null || token === undefined) {
      console.log(`[DEBUG] getMaskedToken: 토큰이 ${token === null ? 'null' : 'undefined'}입니다.`);
      return '토큰 없음';
    }
    
    if (typeof token === 'string') {
      console.log(`[DEBUG] getMaskedToken: 문자열 토큰 처리 중`);
      if (token.length === 0) {
        return '빈 토큰';
      }
      
      if (token.length <= 8) {
        return `${token.substring(0, 2)}***${token.substring(token.length - 2)}`;
      }
      
      return `${token.substring(0, 4)}***${token.substring(token.length - 4)}`;
    }
    
    if (typeof token === 'object') {
      console.log(`[DEBUG] getMaskedToken: 객체 토큰 처리 중`);
      
      // 객체인 경우 extractToken 함수를 통해 문자열 추출 시도
      try {
        // 안전하게 extractToken 호출
        const tokenStr = extractToken(token);
        if (tokenStr) {
          return getMaskedToken(tokenStr); // 재귀 호출로 문자열 처리
        } else {
          return '추출 불가 토큰';
        }
      } catch (extractError) {
        console.error(`[ERROR] getMaskedToken: 토큰 추출 중 오류 발생: ${extractError}`);
        return '토큰 처리 오류';
      }
    }
    
    // 기타 타입은 안전하게 문자열로 변환
    try {
      console.log(`[DEBUG] getMaskedToken: ${typeof token} 타입 토큰을 문자열로 변환 시도`);
      const tokenStr = String(token);
      if (tokenStr.length === 0) {
        return '빈 토큰';
      }
      
      if (tokenStr.length <= 8) {
        return `${tokenStr.substring(0, 2)}***${tokenStr.substring(tokenStr.length - 2)}`;
      }
      
      return `${tokenStr.substring(0, 4)}***${tokenStr.substring(tokenStr.length - 4)}`;
    } catch (convertError) {
      console.error(`[ERROR] getMaskedToken: 문자열 변환 중 오류 발생: ${convertError}`);
      return '변환 불가 토큰';
    }
  } catch (error) {
    console.error(`[ERROR] getMaskedToken: 치명적 오류 발생: ${error}`);
    return '토큰 처리 실패';
  }
} 