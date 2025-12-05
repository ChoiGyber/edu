-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "tenant_default";

-- CreateEnum
CREATE TYPE "public"."SubscriptionPlan" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "tenant_default"."UserRole" AS ENUM ('ADMIN', 'SUB_ADMIN', 'USER', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "tenant_default"."Industry" AS ENUM ('CONSTRUCTION', 'MANUFACTURING', 'LOGISTICS', 'FOOD', 'CHEMICAL', 'ELECTRICITY', 'SERVICE', 'ETC');

-- CreateEnum
CREATE TYPE "tenant_default"."VideoProvider" AS ENUM ('VIMEO', 'CLOUDFLARE');

-- CreateTable
CREATE TABLE "public"."companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "schema_name" TEXT NOT NULL,
    "logo_url" TEXT,
    "ip_ranges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "subscription_plan" "public"."SubscriptionPlan" NOT NULL DEFAULT 'INDIVIDUAL',
    "subscription_expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_default"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "company_name" TEXT,
    "site_name" TEXT,
    "industry" "tenant_default"."Industry",
    "provider" TEXT,
    "provider_id" TEXT,
    "password_hash" TEXT,
    "role" "tenant_default"."UserRole" NOT NULL DEFAULT 'USER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "preferred_languages" TEXT[] DEFAULT ARRAY['ko']::TEXT[],
    "notification_email" TEXT,
    "email_notification" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_default"."accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_default"."sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_default"."videos" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "thumbnail_url" TEXT NOT NULL,
    "provider" "tenant_default"."VideoProvider" NOT NULL,
    "provider_id" TEXT NOT NULL,
    "video_url" TEXT NOT NULL,
    "embed_html" TEXT,
    "category" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "industry" "tenant_default"."Industry"[],
    "has_korean_audio" BOOLEAN NOT NULL DEFAULT true,
    "subtitles" JSONB,
    "ai_translation" BOOLEAN NOT NULL DEFAULT false,
    "uploaded_by" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "used_in_courses" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_default"."education_courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "nodes" JSONB NOT NULL,
    "edges" JSONB NOT NULL,
    "total_duration" INTEGER NOT NULL DEFAULT 0,
    "owner_id" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "shared_with" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_default"."education_histories" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "course_title_snapshot" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "total_attendees" INTEGER NOT NULL,
    "attendees" JSONB NOT NULL,
    "by_nationality" JSONB,
    "certificate_url" TEXT,
    "screenshots" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "qr_token_expiry" INTEGER NOT NULL DEFAULT 30,
    "executed_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "education_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_default"."system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_domain_key" ON "public"."companies"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "companies_schema_name_key" ON "public"."companies"("schema_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "tenant_default"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "tenant_default"."accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "tenant_default"."sessions"("token");

-- CreateIndex
CREATE INDEX "videos_provider_provider_id_idx" ON "tenant_default"."videos"("provider", "provider_id");

-- CreateIndex
CREATE INDEX "videos_industry_idx" ON "tenant_default"."videos"("industry");

-- CreateIndex
CREATE INDEX "education_courses_owner_id_idx" ON "tenant_default"."education_courses"("owner_id");

-- CreateIndex
CREATE INDEX "education_histories_course_id_idx" ON "tenant_default"."education_histories"("course_id");

-- CreateIndex
CREATE INDEX "education_histories_executed_by_completed_at_idx" ON "tenant_default"."education_histories"("executed_by", "completed_at");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "tenant_default"."system_settings"("key");

-- AddForeignKey
ALTER TABLE "tenant_default"."accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tenant_default"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_default"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tenant_default"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_default"."education_courses" ADD CONSTRAINT "education_courses_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "tenant_default"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_default"."education_histories" ADD CONSTRAINT "education_histories_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "tenant_default"."education_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_default"."education_histories" ADD CONSTRAINT "education_histories_executed_by_fkey" FOREIGN KEY ("executed_by") REFERENCES "tenant_default"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

