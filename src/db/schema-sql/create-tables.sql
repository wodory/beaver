-- 저장소 테이블 생성
CREATE TABLE IF NOT EXISTS repositories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL UNIQUE,
  clone_url TEXT NOT NULL,
  local_path TEXT,
  type TEXT NOT NULL DEFAULT 'github',
  api_url TEXT,
  api_token TEXT,
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 사용자 테이블 생성
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  login TEXT NOT NULL UNIQUE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 커밋 테이블 생성
CREATE TABLE IF NOT EXISTS commits (
  id SERIAL PRIMARY KEY,
  repo_id INTEGER NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  sha TEXT NOT NULL,
  author_id INTEGER REFERENCES users(id),
  committer_id INTEGER REFERENCES users(id),
  message TEXT NOT NULL,
  committed_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(repo_id, sha)
);

-- 풀 리퀘스트 테이블 생성
CREATE TABLE IF NOT EXISTS pull_requests (
  id SERIAL PRIMARY KEY,
  repo_id INTEGER NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  title TEXT NOT NULL,
  state TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id),
  created_at_gh TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at_gh TIMESTAMP WITH TIME ZONE NOT NULL,
  closed_at TIMESTAMP WITH TIME ZONE,
  merged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(repo_id, number)
);

-- 리뷰 테이블 생성
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  pull_request_id INTEGER NOT NULL REFERENCES pull_requests(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  state TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 팀 테이블 생성
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  repo_ids INTEGER[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 메트릭 캐시 테이블 생성
CREATE TABLE IF NOT EXISTS metric_cache (
  id SERIAL PRIMARY KEY,
  repo_id INTEGER REFERENCES repositories(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  time_range TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(repo_id, metric_type, time_range)
);

-- JIRA 이슈 테이블 생성
CREATE TABLE IF NOT EXISTS jira_issues (
  id SERIAL PRIMARY KEY,
  issue_key TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  description TEXT,
  issue_type TEXT NOT NULL,
  status TEXT NOT NULL,
  assignee TEXT,
  reporter TEXT,
  priority TEXT,
  created TEXT NOT NULL,
  updated TEXT NOT NULL,
  resolved TEXT,
  project_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
); 