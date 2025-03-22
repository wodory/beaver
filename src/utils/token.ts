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
  // 디버그 로그 추가
  console.log(`[DEBUG] extractToken 입력 값 타입: ${typeof tokenData}`);
  
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
      console.log(`[DEBUG] extractToken: 토큰 데이터가 객체입니다.`, 
        typeof tokenData === 'object' && tokenData !== null ? 
        JSON.stringify(tokenData).substring(0, 100) + '...' : '빈 객체');
      
      // 우선 토큰 객체 자체가 toString 메서드를 가진 경우
      if (tokenData !== null && 'toString' in tokenData && typeof (tokenData as any).toString === 'function') {
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
      
      // JSON 문자열일 수도 있으므로 파싱 시도
      if (typeof tokenData === 'string') {
        try {
          const parsedObj = JSON.parse(tokenData);
          if (typeof parsedObj === 'object' && parsedObj !== null) {
            console.log(`[DEBUG] extractToken: JSON 문자열을 객체로 파싱하였습니다.`);
            tokenData = parsedObj;
          }
        } catch (e) {
          // 파싱 실패 시 원본 사용
          console.log(`[DEBUG] extractToken: JSON 파싱 실패, 원본 사용`);
        }
      }
      
      const obj = tokenData as Record<string, unknown>;
      
      // PostgreSQL JSONB 데이터에서 토큰 필드 추출 시도
      if ('token' in obj && typeof obj.token === 'string') {
        console.log(`[DEBUG] extractToken: 객체에서 'token' 필드 추출: ${obj.token}`);
        return obj.token;
      } else if ('enterpriseToken' in obj && typeof obj.enterpriseToken === 'string') {
        console.log(`[DEBUG] extractToken: 객체에서 'enterpriseToken' 필드 추출: ${obj.enterpriseToken}`);
        return obj.enterpriseToken;
      }
      
      // 일반적인 토큰 속성명 순서대로 확인
      for (const key of ['token', 'value', 'apiToken', 'accessToken', 'enterpriseToken']) {
        if (obj[key] !== undefined) {
          console.log(`[DEBUG] extractToken: '${key}' 속성 발견, 타입: ${typeof obj[key]}`);
          
          // 문자열인 경우 바로 반환
          if (typeof obj[key] === 'string') {
            return obj[key] as string;
          }
          
          // 객체인 경우 재귀적으로 처리
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            const extracted = extractToken(obj[key]);
            if (extracted) {
              console.log(`[DEBUG] extractToken: '${key}' 속성에서 중첩된 토큰 추출: ${extracted}`);
              return extracted;
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
      }
      
      // 객체 내용을 깊은 탐색으로 처리
      // 우선 객체 자체를 문자열로 변환할 수 있는지 확인
      try {
        if (obj !== null) {
          for (const key in obj) {
            if (typeof obj[key] === 'string' && key.toLowerCase().includes('token')) {
              console.log(`[DEBUG] extractToken: '${key}' 속성에서 토큰 문자열 발견: ${obj[key]}`);
              return obj[key] as string;
            }
            
            // 중첩된 객체 처리
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              const nestedToken = extractToken(obj[key]);
              if (nestedToken) {
                console.log(`[DEBUG] extractToken: '${key}' 속성의 중첩 객체에서 토큰 추출: ${nestedToken}`);
                return nestedToken;
              }
            }
          }
        }
      } catch (e) {
        console.log(`[DEBUG] extractToken: 객체 깊은 탐색 실패: ${e}`);
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
 * 토큰의 일부를 로깅 목적으로 안전하게 마스킹합니다.
 * 예: "ghp_1234abcd5678" -> "ghp_...5678"
 * 
 * @param tokenData 토큰 데이터 (문자열 또는 객체)
 * @returns 마스킹된 토큰 문자열 또는 상태 메시지
 */
export function getMaskedToken(tokenData: unknown): string {
  try {
    // 디버그 로그 추가
    console.log(`[DEBUG] getMaskedToken 입력 값 타입: ${typeof tokenData}`);
    
    // extractToken 함수를 사용하여 문자열 토큰 추출
    const token = extractToken(tokenData);
    
    if (!token) {
      return '(토큰 없음)';
    }
    
    if (typeof token !== 'string') {
      return '(토큰 형식 부적절)';
    }
    
    if (token.length < 8) {
      return '(토큰 형식 부적절)';
    }
    
    // 토큰의 처음 4자와 마지막 4자만 표시
    return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`;
  } catch (error) {
    // 오류 상세 정보 로깅
    console.error('토큰 마스킹 중 오류 발생:', error);
    
    // 타입별 상세 오류 처리
    if (error instanceof TypeError && String(error).includes('convert object to primitive')) {
      console.error('[CRITICAL] 객체를 원시 값으로 변환할 수 없습니다. 토큰 데이터:', 
        typeof tokenData === 'object' ? '객체 타입' : typeof tokenData);
      
      // 토큰 데이터가 객체일 경우 JSON 형태로 출력 시도
      if (typeof tokenData === 'object' && tokenData !== null) {
        try {
          const objStr = JSON.stringify(tokenData).substring(0, 50) + '...';
          console.error('객체 내용 (일부):', objStr);
        } catch (e) {
          console.error('객체를 JSON으로 변환할 수 없습니다.');
        }
      }
    }
    
    return '(토큰 마스킹 실패)';
  }
} 