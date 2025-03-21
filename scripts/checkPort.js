#!/usr/bin/env node

import { execSync } from 'child_process';
import { platform } from 'os';

const PORT = 3000;

console.log(`포트 ${PORT} 확인 중...`);

const isWindows = platform() === 'win32';

try {
  // 운영체제에 따라 적절한 명령어 설정
  const findProcessCommand = isWindows
    ? `netstat -ano | findstr :${PORT}`
    : `lsof -i:${PORT} -t`;
  
  let pids = [];
  
  if (isWindows) {
    // Windows: netstat 출력에서 PID 추출
    const output = execSync(findProcessCommand, { encoding: 'utf-8' });
    const lines = output.split('\n').filter(Boolean);
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && (trimmed.includes(`0.0.0.0:${PORT}`) || trimmed.includes(`127.0.0.1:${PORT}`) || trimmed.includes(`:::${PORT}`))) {
        const parts = trimmed.split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(parseInt(pid))) {
          pids.push(pid);
        }
      }
    }
  } else {
    // macOS/Linux: lsof 출력에서 PID 추출
    const output = execSync(findProcessCommand, { encoding: 'utf-8' }).trim();
    if (output) {
      pids = output.split('\n').filter(Boolean);
    }
  }
  
  // 중복 PID 제거
  pids = [...new Set(pids)];
  
  if (pids.length > 0) {
    console.log(`포트 ${PORT}가 다음 PID에 의해 사용 중입니다: ${pids.join(', ')}`);
    console.log(`포트가 완전히 해제될 때까지 잠시 대기 중...`);
    
    // 모든 프로세스 종료
    let terminationSuccess = true;
    for (const pid of pids) {
      try {
        if (isWindows) {
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
    
    console.log(`포트 ${PORT}가 해제되었습니다. 개발 서버를 시작합니다.`);
  } else {
    console.log(`포트 ${PORT}는 사용 가능합니다. 개발 서버를 시작합니다.`);
  }
} catch (error) {
  if (error.status === 1) {
    // 프로세스가 없는 경우 (정상 상태)
    console.log(`포트 ${PORT}는 사용 가능합니다. 개발 서버를 시작합니다.`);
  } else {
    console.error(`포트 확인 중 오류 발생: ${error.message}`);
    process.exit(1);
  }
} 