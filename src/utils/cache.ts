/**
 * 캐시 유틸리티
 * 
 * API 응답을 캐싱하여 불필요한 네트워크 요청을 줄입니다.
 */

/**
 * 캐시 항목 인터페이스
 */
interface CacheItem<T> {
  /** 캐시된 데이터 */
  data: T;
  /** 캐시 생성 시간 (타임스탬프) */
  timestamp: number;
  /** 캐시 만료 시간 (타임스탬프) */
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

// 메모리 캐시 (localStorage를 사용할 수 없는 환경용)
const memoryCache: Record<string, string> = {};

// localStorage 사용 가능 여부 확인
const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__test_localStorage__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.warn('localStorage를 사용할 수 없습니다. 메모리 캐시를 사용합니다.', e);
    return false;
  }
};

// 로컬 스토리지 사용 가능 여부
const useLocalStorage = isLocalStorageAvailable();

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
    let cachedItem: string | null = null;
    
    if (useLocalStorage) {
      cachedItem = localStorage.getItem(key);
    } else {
      cachedItem = memoryCache[key] || null;
    }
    
    if (!cachedItem) {
      return null;
    }
    
    const { data, expiresAt }: CacheItem<T> = JSON.parse(cachedItem);
    
    // 캐시가 만료되었는지 확인
    if (Date.now() > expiresAt) {
      if (useLocalStorage) {
        localStorage.removeItem(key);
      } else {
        delete memoryCache[key];
      }
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
    
    const serialized = JSON.stringify(cacheItem);
    
    if (useLocalStorage) {
      localStorage.setItem(key, serialized);
    } else {
      memoryCache[key] = serialized;
    }
  } catch (error) {
    console.error('데이터를 캐시에 저장하는 중 오류 발생:', error);
  }
};

/**
 * 캐시에서 항목 삭제
 * @param key 캐시 키
 */
export const removeFromCache = (key: string): void => {
  try {
    if (useLocalStorage) {
      localStorage.removeItem(key);
    } else {
      delete memoryCache[key];
    }
  } catch (error) {
    console.error('캐시에서 항목을 삭제하는 중 오류 발생:', error);
  }
};

/**
 * 모든 캐시 항목 삭제
 */
export const clearCache = (): void => {
  try {
    if (useLocalStorage) {
      // 'beaver_cache_' 접두사를 가진 항목만 삭제
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('beaver_cache_')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } else {
      // 메모리 캐시의 모든 항목 삭제
      Object.keys(memoryCache).forEach(key => {
        if (key.startsWith('beaver_cache_')) {
          delete memoryCache[key];
        }
      });
    }
  } catch (error) {
    console.error('캐시를 초기화하는 중 오류 발생:', error);
  }
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