-- ====================================
-- Supabase 데이터베이스 초기화 스크립트
-- ====================================
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요
-- https://supabase.com/dashboard/project/fppuxfiitvvgxmmjairb/sql

-- 1. tenant_default 스키마 생성
CREATE SCHEMA IF NOT EXISTS tenant_default;

-- 2. public 스키마 권한 (이미 존재)
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO postgres;

-- 3. tenant_default 스키마 권한 설정
GRANT USAGE ON SCHEMA tenant_default TO postgres;
GRANT ALL ON SCHEMA tenant_default TO postgres;

-- 4. 확인
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name IN ('public', 'tenant_default');
