#!/usr/bin/env node

import { exec } from 'child_process';
import { platform } from 'os';

const PORT = 3000;

console.log(`포트 ${PORT} 확인 중...`);

const isWindows = platform() === 'win32';

// 운영체제에 따라 적절한 명령어 설정
const findProcessCommand = isWindows
  ? `netstat -ano | findstr :${PORT}`
  : `lsof -i :${PORT} | grep LISTEN`;

const killProcessCommand = (pid) => isWindows
  ? `taskkill /F /PID ${pid}`
  : `kill -9 ${pid}`;

// 포트 사용 여부 확인 및 프로세스 종료
exec(findProcessCommand, (error, stdout, stderr) => {
  if (error) {
    // 오류가 발생했거나 프로세스를 찾지 못한 경우 (포트가 사용 중이지 않음)
    console.log(`포트 ${PORT}가 사용 중이지 않습니다. 개발 서버를 시작합니다.`);
    return;
  }

  // 출력 결과에서 PID 추출
  let pids = [];
  if (isWindows) {
    // Windows: netstat 출력에서 PID 추출
    const lines = stdout.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && trimmed.includes(`0.0.0.0:${PORT}`) || trimmed.includes(`127.0.0.1:${PORT}`) || trimmed.includes(`:::${PORT}`)) {
        const parts = trimmed.split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(parseInt(pid))) {
          pids.push(pid);
        }
      }
    }
  } else {
    // macOS/Linux: lsof 출력에서 PID 추출
    const lines = stdout.split('\n');
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length > 1) {
        const pid = parts[1];
        if (pid && !isNaN(parseInt(pid))) {
          pids.push(pid);
        }
      }
    }
  }

  // 중복 PID 제거
  pids = [...new Set(pids)];

  if (pids.length === 0) {
    console.log(`포트 ${PORT}가 사용 중이지만 종료할 프로세스를 찾을 수 없습니다.`);
    process.exit(1);
  }

  console.log(`포트 ${PORT}가 다음 PID에 의해 사용 중입니다: ${pids.join(', ')}`);

  // 모든 PID에 대해 프로세스 종료
  for (const pid of pids) {
    exec(killProcessCommand(pid), (killError, killStdout, killStderr) => {
      if (killError) {
        console.error(`PID ${pid} 종료 중 오류 발생:`, killError);
        return;
      }
      console.log(`PID ${pid} 종료 완료`);
    });
  }

  // 잠시 대기 후 개발 서버 시작
  console.log('포트가 완전히 해제될 때까지 잠시 대기 중...');
  setTimeout(() => {
    console.log(`포트 ${PORT}가 해제되었습니다. 개발 서버를 시작합니다.`);
  }, 1000);
}); 