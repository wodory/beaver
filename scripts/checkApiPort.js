/**
 * API 서버 포트 체크 스크립트
 * 
 * 이 스크립트는 API 서버에서 사용할 포트(3001)가 이미 사용 중인지 확인하고,
 * 사용 중이라면 해당 프로세스를 종료합니다.
 */
import { execSync } from 'child_process';

// API 서버 포트
const API_PORT = 3001;

console.log(`포트 ${API_PORT} 확인 중...`);

try {
  // macOS나 Linux에서 포트를 사용 중인 프로세스 확인
  const command = process.platform === 'win32'
    ? `netstat -ano | findstr :${API_PORT}`
    : `lsof -i:${API_PORT} -t`;
  
  let pids = [];
  
  if (process.platform === 'win32') {
    const output = execSync(command, { encoding: 'utf-8' });
    const lines = output.split('\n').filter(Boolean);
    if (lines.length > 0) {
      const lastLine = lines[lines.length - 1];
      pids.push(lastLine.trim().split(/\s+/).pop());
    }
  } else {
    // 여러 PID를 반환할 수 있으므로 줄바꿈으로 분리하여 배열로 처리
    const output = execSync(command, { encoding: 'utf-8' }).trim();
    if (output) {
      pids = output.split('\n').filter(Boolean);
    }
  }
  
  if (pids.length > 0) {
    console.log(`포트 ${API_PORT}가 다음 PID에 의해 사용 중입니다: ${pids.join(', ')}`);
    console.log(`포트가 완전히 해제될 때까지 잠시 대기 중...`);
    
    // 모든 프로세스 종료
    let terminationSuccess = true;
    for (const pid of pids) {
      try {
        if (process.platform === 'win32') {
          execSync(`taskkill /F /PID ${pid}`);
        } else {
          execSync(`kill -9 ${pid}`);
        }
        console.log(`PID ${pid} 종료 완료`);
      } catch (killError) {
        console.error(`PID ${pid} 종료 실패: ${killError.message}`);
        terminationSuccess = false;
      }
    }
    
    if (!terminationSuccess) {
      console.error(`일부 프로세스를 종료하지 못했습니다. 수동으로 포트를 확인해주세요.`);
      process.exit(1);
    }
    
    // 짧은 대기 후 계속 진행
    console.log(`포트 ${API_PORT}가 해제되었습니다. API 서버를 시작합니다.`);
  } else {
    console.log(`포트 ${API_PORT}는 사용 가능합니다. API 서버를 시작합니다.`);
  }
} catch (error) {
  if (error.status === 1) {
    // 프로세스가 없는 경우 (정상 상태)
    console.log(`포트 ${API_PORT}는 사용 가능합니다. API 서버를 시작합니다.`);
  } else {
    console.error(`포트 확인 중 오류 발생: ${error.message}`);
    process.exit(1);
  }
} 