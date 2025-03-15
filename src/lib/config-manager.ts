import { Octokit } from "@octokit/rest";
import { Repository, TimeRange } from '../types/github';
import configData from '../config.json';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM 환경에서 현재 파일 경로 가져오기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 설정 파일 경로
const CONFIG_PATH = path.resolve(__dirname, '../config.json');

/**
 * 설정 파일 인터페이스
 */
export interface Config {
  repositories: Repository[];
  defaultTimeRange: TimeRange;
  refreshInterval: number;
}

/**
 * 설정 파일에서 저장소 목록 가져오기
 */
export function getRepositories(): Repository[] {
  return configData.repositories;
}

/**
 * 설정 파일에서 기본 시간 범위 가져오기
 */
export function getDefaultTimeRange(): TimeRange {
  return configData.defaultTimeRange;
}

/**
 * 설정 파일에서 새로고침 간격(밀리초) 가져오기
 */
export function getRefreshInterval(): number {
  return configData.refreshInterval;
}

/**
 * 전체 설정 가져오기
 */
export function getConfig(): Config {
  return configData as Config;
}

/**
 * 저장소 이름만으로 GitHub API를 사용하여 소유자 정보 찾기
 */
export async function findRepositoryOwner(repoName: string, token: string): Promise<Repository | null> {
  const octokit = new Octokit({ auth: token });
  
  try {
    // 저장소 이름으로 검색
    const searchResult = await octokit.search.repos({
      q: `${repoName} in:name`,
      sort: 'stars',
      order: 'desc',
      per_page: 10
    });
    
    if (searchResult.data.total_count === 0) {
      return null;
    }
    
    // 검색 결과에서 정확히 일치하는 이름 찾기
    const exactMatch = searchResult.data.items.find(
      repo => repo.name.toLowerCase() === repoName.toLowerCase()
    );
    
    if (!exactMatch || !exactMatch.owner) {
      return null;
    }
    
    // 저장소 정보 반환
    return {
      name: exactMatch.name,
      owner: exactMatch.owner.login,
      description: exactMatch.description || `${exactMatch.owner.login}의 ${exactMatch.name} 저장소`
    };
    
  } catch (error) {
    console.error('저장소 검색 중 오류 발생:', error);
    return null;
  }
}

/**
 * 설정 파일에 저장소 추가
 */
export async function addRepository(
  repoNameOrConfig: string | Repository, 
  token: string
): Promise<Repository | null> {
  // 현재 설정 로드
  const config = getConfig();
  let newRepo: Repository | null = null;
  
  // 문자열(저장소 이름)이 전달된 경우, API로 소유자 검색
  if (typeof repoNameOrConfig === 'string') {
    newRepo = await findRepositoryOwner(repoNameOrConfig, token);
    if (!newRepo) {
      console.error(`저장소 "${repoNameOrConfig}"을(를) 찾을 수 없습니다.`);
      return null;
    }
  } else {
    // 저장소 객체가 전달된 경우, 그대로 사용
    newRepo = repoNameOrConfig;
    
    // owner가 없는 경우, API로 검색 시도
    if (!newRepo.owner) {
      const foundRepo = await findRepositoryOwner(newRepo.name, token);
      if (!foundRepo) {
        console.error(`저장소 "${newRepo.name}"의 소유자를 찾을 수 없습니다.`);
        return null;
      }
      newRepo = foundRepo;
    }
  }
  
  // 이미 있는 저장소인지 확인
  const exists = config.repositories.some(
    repo => repo.name === newRepo?.name && repo.owner === newRepo?.owner
  );
  
  if (exists) {
    console.log(`저장소 "${newRepo.owner}/${newRepo.name}"은(는) 이미 설정에 있습니다.`);
    return newRepo;
  }
  
  // 새 저장소 추가
  config.repositories.push(newRepo);
  
  // 설정 파일 업데이트
  await saveConfig(config);
  
  console.log(`저장소 "${newRepo.owner}/${newRepo.name}"이(가) 설정에 추가되었습니다.`);
  return newRepo;
}

/**
 * 설정 파일에서 저장소 제거
 */
export async function removeRepository(owner: string, name: string): Promise<boolean> {
  // 현재 설정 로드
  const config = getConfig();
  
  // 저장소 찾기
  const index = config.repositories.findIndex(
    repo => repo.owner === owner && repo.name === name
  );
  
  if (index === -1) {
    console.error(`저장소 "${owner}/${name}"을(를) 찾을 수 없습니다.`);
    return false;
  }
  
  // 저장소 제거
  config.repositories.splice(index, 1);
  
  // 설정 파일 업데이트
  await saveConfig(config);
  
  console.log(`저장소 "${owner}/${name}"이(가) 설정에서 제거되었습니다.`);
  return true;
}

/**
 * 설정 파일 저장
 */
async function saveConfig(config: Config): Promise<void> {
  try {
    await fs.promises.writeFile(
      CONFIG_PATH,
      JSON.stringify(config, null, 2),
      'utf-8'
    );
  } catch (error) {
    console.error('설정 파일 저장 중 오류 발생:', error);
    throw error;
  }
} 