-- 관리자 계정 생성
-- 이메일: admin@safety-edu.com
-- 비밀번호: admin
-- bcrypt hash of 'admin' with salt rounds 12

INSERT INTO "tenant_default"."users" (
  "id",
  "email",
  "name",
  "phone",
  "company_name",
  "industry",
  "role",
  "password_hash",
  "is_active",
  "preferred_languages",
  "email_notification",
  "created_at",
  "updated_at"
) VALUES (
  gen_random_uuid(),
  'admin@safety-edu.com',
  '시스템 관리자',
  '010-0000-0000',
  '안전교육 플랫폼',
  'CONSTRUCTION',
  'ADMIN',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aeGUQYzHpN8i',
  true,
  ARRAY['ko'],
  false,
  NOW(),
  NOW()
);
