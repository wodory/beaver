// 간단한 테스트 파일
console.log('간단한 테스트 파일이 실행되었습니다.');

// 환경 변수 확인
console.log('NODE_ENV:', process.env.NODE_ENV);

// ESM에서는 __dirname 대신 import.meta.url 사용
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('__dirname (ESM):', __dirname);
console.log('__filename (ESM):', __filename);

// 모듈 타입 확인
console.log('import.meta.url:', import.meta.url);

// 종료
console.log('테스트 완료'); 