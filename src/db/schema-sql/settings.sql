-- 시스템 설정 테이블 생성
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 사용자 설정 테이블 생성
CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  dark_mode_enabled BOOLEAN DEFAULT FALSE,
  auto_update_enabled BOOLEAN DEFAULT TRUE,
  refresh_interval INTEGER DEFAULT 5,
  language TEXT DEFAULT 'ko',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- GitHub 설정 테이블 생성
CREATE TABLE IF NOT EXISTS github_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token TEXT,
  organization TEXT,
  token_type TEXT DEFAULT 'personal',
  repositories TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Jira 설정 테이블 생성
CREATE TABLE IF NOT EXISTS jira_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  url TEXT,
  email TEXT,
  api_token TEXT,
  project_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 기본 설정 데이터 삽입
INSERT INTO system_settings (key, value) 
VALUES ('default_settings', '{"refreshInterval": 5, "language": "ko"}')
ON CONFLICT (key) DO NOTHING;

-- 기본 사용자 설정 추가 (ID 1인 사용자용)
INSERT INTO user_settings (user_id, notifications_enabled, dark_mode_enabled, auto_update_enabled, refresh_interval, language)
VALUES (1, TRUE, FALSE, TRUE, 5, 'ko')
ON CONFLICT DO NOTHING;

-- 기본 GitHub 설정 추가
INSERT INTO github_settings (user_id, token, organization, repositories)
VALUES (1, '', '', ARRAY[]::TEXT[])
ON CONFLICT DO NOTHING;

-- 기본 Jira 설정 추가
INSERT INTO jira_settings (user_id, url, email, api_token, project_key)
VALUES (1, '', '', '', '')
ON CONFLICT DO NOTHING; 