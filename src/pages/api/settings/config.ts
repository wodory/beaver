import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// config.json 파일 경로
const CONFIG_FILE_PATH = path.join(process.cwd(), 'src', 'config.json');

/**
 * config.json 파일을 업데이트하는 API 핸들러
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // POST 요청만 처리
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 현재 config.json 파일 읽기
    let configData;
    try {
      const configContent = fs.readFileSync(CONFIG_FILE_PATH, 'utf8');
      configData = JSON.parse(configContent);
    } catch (error) {
      console.error('Error reading config file:', error);
      configData = {}; // 파일이 없거나 읽을 수 없으면 빈 객체 생성
    }

    // 요청 본문에서 업데이트할 데이터 추출
    const { domain, repositories } = req.body;

    // 기존 설정에 새 데이터 병합
    const updatedConfig = {
      ...configData,
      domain: domain || configData.domain || [],
      repositories: repositories || configData.repositories || []
    };

    // config.json 파일 업데이트
    fs.writeFileSync(
      CONFIG_FILE_PATH,
      JSON.stringify(updatedConfig, null, 2),
      'utf8'
    );

    // 성공 응답 반환
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error updating config file:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message || 'Unknown error occurred' 
    });
  }
} 