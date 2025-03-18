/**
 * 캐시 항목 인터페이스
 */
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * 캐시 옵션 인터페이스
 */
interface CacheOptions {
  /** 캐시 만료 시간 (밀리초) */
  ttl?: number;
  /** 강제로 캐시를 갱신할지 여부 */
  forceRefresh?: boolean;
}

// 기본 캐시 TTL: 5분
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

/**
 * 캐시 키 생성 함수
 * @param endpoint API 엔드포인트
 * @param params 요청 파라미터
 * @returns 캐시 키
 */
export const generateCacheKey = (endpoint: string, params?: Record<string, any>): string => {
  const baseKey = `beaver_cache_${endpoint}`;
  
  if (!params) {
    return baseKey;
  }
  
  // 파라미터를 정렬하여 일관된 키 생성
  const paramsString = Object.entries(params)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => {
      // 날짜 객체는 ISO 문자열로 변환
      if (value instanceof Date) {
        return `${key}=${value.toISOString()}`;
      }
      
      // 객체는 JSON 문자열로 변환
      if (typeof value === 'object' && value !== null) {
        return `${key}=${JSON.stringify(value)}`;
      }
      
      return `${key}=${String(value)}`;
    })
    .join('&');
  
  return `${baseKey}_${paramsString}`;
};

/**
 * 캐시에서 데이터 가져오기
 * @param key 캐시 키
 * @returns 캐시된 데이터 또는 null (만료된 경우)
 */
export const getFromCache = <T>(key: string): T | null => {
  try {
    const cachedItem = localStorage.getItem(key);
    
    if (!cachedItem) {
      return null;
    }
    
    const { data, expiresAt }: CacheItem<T> = JSON.parse(cachedItem);
    
    // 캐시가 만료되었는지 확인
    if (Date.now() > expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('캐시에서 데이터를 가져오는 중 오류 발생:', error);
    return null;
  }
};

/**
 * 데이터를 캐시에 저장
 * @param key 캐시 키
 * @param data 저장할 데이터
 * @param options 캐시 옵션
 */
export const saveToCache = <T>(key: string, data: T, options?: CacheOptions): void => {
  try {
    const ttl = options?.ttl || DEFAULT_CACHE_TTL;
    const now = Date.now();
    
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl
    };
    
    localStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('데이터를 캐시에 저장하는 중 오류 발생:', error);
  }
};

/**
 * 특정 키로 시작하는 모든 캐시 삭제
 * @param keyPrefix 캐시 키 접두사
 */
export const clearCacheByPrefix = (keyPrefix: string): void => {
  try {
    // 해당 접두사로 시작하는 모든 키 찾기
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(keyPrefix)) {
        keysToRemove.push(key);
      }
    }
    
    // 모든 해당 키 삭제
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log(`캐시 삭제 완료: ${keysToRemove.length}개 항목 제거됨 (접두사: ${keyPrefix})`);
  } catch (error) {
    console.error('캐시 삭제 중 오류 발생:', error);
  }
};

/**
 * 모든 API 캐시 삭제
 */
export const clearAllCache = (): void => {
  clearCacheByPrefix('beaver_cache_');
};

/**
 * API 요청 캐싱 래퍼 함수
 * @param key 캐시 키
 * @param fetchFunction API 호출 함수
 * @param options 캐시 옵션
 * @returns API 응답 데이터
 */
export const cachedApiRequest = async <T>(
  key: string, 
  fetchFunction: () => Promise<T>, 
  options?: CacheOptions
): Promise<T> => {
  // 캐시 갱신이 강제되지 않았다면 캐시 확인
  if (!options?.forceRefresh) {
    const cachedData = getFromCache<T>(key);
    
    if (cachedData) {
      console.log(`캐시에서 데이터 로드: ${key}`);
      return cachedData;
    }
  }
  
  // 캐시가 없거나 만료되었으면 API 호출
  console.log(`API에서 새 데이터 로드: ${key}`);
  const data = await fetchFunction();
  
  // 데이터를 캐시에 저장
  saveToCache(key, data, options);
  
  return data;
}; 