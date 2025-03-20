-- settings 테이블에 accounts 타입 추가를 위한 스크립트

-- 기존 설정 삭제 (필요한 경우)
DELETE FROM settings WHERE type = 'accounts' AND user_id = 1;

-- accounts 타입 설정 추가 (기본값)
INSERT INTO settings (type, user_id, data, created_at, updated_at)
VALUES ('accounts', 1, '{
  "accounts": [],
  "repositories": []
}'::jsonb, NOW(), NOW());

-- 설정 확인
SELECT * FROM settings WHERE type = 'accounts' AND user_id = 1; 