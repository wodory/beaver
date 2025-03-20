-- 설정 테이블이 이미 존재하는지 확인하고 없으면 생성
CREATE TABLE IF NOT EXISTS "settings" (
  "id" serial PRIMARY KEY NOT NULL,
  "type" text NOT NULL,
  "user_id" integer NOT NULL,
  "data" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- 인덱스가 존재하지 않는 경우에만 생성
DO
$$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'settings_type_user_id_idx'
  ) THEN
    CREATE INDEX "settings_type_user_id_idx" ON "settings" ("type", "user_id");
  END IF;
END
$$; 