-- Go-to-market: beta leads, demos, feedback, usage, referrals, health, releases, tours

CREATE TYPE "BetaLeadStatus" AS ENUM ('NEW', 'QUALIFIED', 'CONTACTED', 'DEMO_BOOKED', 'ONBOARDED', 'REJECTED', 'CUSTOMER');

CREATE TYPE "DemoRequestStatus" AS ENUM ('NEW', 'SCHEDULED', 'COMPLETED', 'NO_SHOW', 'WON', 'LOST');

CREATE TYPE "AppFeedbackType" AS ENUM ('BUG', 'FEATURE_REQUEST', 'CONFUSION', 'PRICING', 'INTEGRATION_REQUEST', 'GENERAL');

CREATE TYPE "AppFeedbackPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TYPE "AppFeedbackStatus" AS ENUM ('NEW', 'REVIEWED', 'PLANNED', 'IN_PROGRESS', 'DONE', 'REJECTED');

CREATE TYPE "CustomerHealthLevel" AS ENUM ('HEALTHY', 'NEEDS_ATTENTION', 'AT_RISK', 'NEW_ACCOUNT');

CREATE TABLE "beta_leads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "phone" VARCHAR(40),
    "business_name" VARCHAR(255) NOT NULL,
    "business_website" TEXT,
    "business_type" "BusinessType" NOT NULL,
    "current_channels" JSONB NOT NULL,
    "weekly_order_volume" VARCHAR(160),
    "biggest_pain" TEXT,
    "interested_features" JSONB NOT NULL,
    "country" VARCHAR(120),
    "timezone" VARCHAR(120),
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "source" VARCHAR(120),
    "referral_snapshot" VARCHAR(80),
    "status" "BetaLeadStatus" NOT NULL DEFAULT 'NEW',
    "score" INTEGER NOT NULL DEFAULT 0,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beta_leads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "beta_lead_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "beta_lead_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beta_lead_notes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "demo_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "beta_lead_id" UUID,
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "phone" VARCHAR(40),
    "business_name" VARCHAR(255) NOT NULL,
    "website" TEXT,
    "business_type" "BusinessType" NOT NULL,
    "current_platform" TEXT,
    "weekly_order_volume" VARCHAR(160),
    "pain_points" TEXT,
    "preferred_time" VARCHAR(255),
    "status" "DemoRequestStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demo_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "app_feedback" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "email" VARCHAR(320),
    "type" "AppFeedbackType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "route" VARCHAR(512) NOT NULL,
    "screenshot_url" TEXT,
    "feature_area" VARCHAR(120),
    "priority" "AppFeedbackPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "AppFeedbackStatus" NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_feedback_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "onboarding_calls" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "beta_lead_id" UUID,
    "demo_request_id" UUID,
    "business_name" VARCHAR(255) NOT NULL,
    "contact_name" VARCHAR(255) NOT NULL,
    "call_date" DATE NOT NULL,
    "stage" VARCHAR(120),
    "goals" TEXT,
    "current_workflow" TEXT,
    "pain_points" TEXT,
    "integrations_needed" TEXT,
    "objections" TEXT,
    "next_steps" TEXT,
    "next_step_date" DATE,
    "success_criteria" TEXT,
    "outcome" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_calls_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "usage_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "event_name" VARCHAR(120) NOT NULL,
    "route" VARCHAR(512),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "activation_states" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "business_settings_completed" BOOLEAN NOT NULL DEFAULT false,
    "first_menu_created" BOOLEAN NOT NULL DEFAULT false,
    "first_product_created" BOOLEAN NOT NULL DEFAULT false,
    "first_order_created" BOOLEAN NOT NULL DEFAULT false,
    "first_production_completed" BOOLEAN NOT NULL DEFAULT false,
    "first_packing_exported" BOOLEAN NOT NULL DEFAULT false,
    "first_integration_connected" BOOLEAN NOT NULL DEFAULT false,
    "billing_started" BOOLEAN NOT NULL DEFAULT false,
    "checklist_dismissed" BOOLEAN NOT NULL DEFAULT false,
    "activated_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activation_states_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "referral_codes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_codes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "referral_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "referral_code_id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "source" VARCHAR(120),
    "converted_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "customer_health_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "status" "CustomerHealthLevel" NOT NULL,
    "signals" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_health_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "release_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" VARCHAR(32) NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "release_notes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_tour_states" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "tour_name" VARCHAR(120) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_tour_states_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "beta_leads_email_idx" ON "beta_leads"("email");
CREATE INDEX "beta_leads_status_created_at_idx" ON "beta_leads"("status", "created_at");
CREATE INDEX "beta_leads_business_type_idx" ON "beta_leads"("business_type");

CREATE INDEX "beta_lead_notes_beta_lead_id_created_at_idx" ON "beta_lead_notes"("beta_lead_id", "created_at");

CREATE INDEX "demo_requests_email_idx" ON "demo_requests"("email");
CREATE INDEX "demo_requests_status_created_at_idx" ON "demo_requests"("status", "created_at");
CREATE INDEX "demo_requests_beta_lead_id_idx" ON "demo_requests"("beta_lead_id");

CREATE INDEX "app_feedback_user_id_idx" ON "app_feedback"("user_id");
CREATE INDEX "app_feedback_status_created_at_idx" ON "app_feedback"("status", "created_at");
CREATE INDEX "app_feedback_type_idx" ON "app_feedback"("type");

CREATE INDEX "onboarding_calls_user_id_idx" ON "onboarding_calls"("user_id");
CREATE INDEX "onboarding_calls_call_date_idx" ON "onboarding_calls"("call_date");

CREATE INDEX "usage_events_user_id_created_at_idx" ON "usage_events"("user_id", "created_at");
CREATE INDEX "usage_events_event_name_created_at_idx" ON "usage_events"("event_name", "created_at");

CREATE UNIQUE INDEX "activation_states_user_id_key" ON "activation_states"("user_id");

CREATE UNIQUE INDEX "referral_codes_code_key" ON "referral_codes"("code");
CREATE INDEX "referral_codes_user_id_idx" ON "referral_codes"("user_id");

CREATE INDEX "referral_events_referral_code_id_idx" ON "referral_events"("referral_code_id");
CREATE INDEX "referral_events_email_idx" ON "referral_events"("email");

CREATE INDEX "customer_health_snapshots_user_id_created_at_idx" ON "customer_health_snapshots"("user_id", "created_at");

CREATE UNIQUE INDEX "release_notes_slug_key" ON "release_notes"("slug");
CREATE INDEX "release_notes_published_published_at_idx" ON "release_notes"("published", "published_at");

CREATE UNIQUE INDEX "user_tour_states_user_id_tour_name_key" ON "user_tour_states"("user_id", "tour_name");

ALTER TABLE "beta_lead_notes" ADD CONSTRAINT "beta_lead_notes_beta_lead_id_fkey" FOREIGN KEY ("beta_lead_id") REFERENCES "beta_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "demo_requests" ADD CONSTRAINT "demo_requests_beta_lead_id_fkey" FOREIGN KEY ("beta_lead_id") REFERENCES "beta_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "app_feedback" ADD CONSTRAINT "app_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "onboarding_calls" ADD CONSTRAINT "onboarding_calls_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "onboarding_calls" ADD CONSTRAINT "onboarding_calls_beta_lead_id_fkey" FOREIGN KEY ("beta_lead_id") REFERENCES "beta_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "onboarding_calls" ADD CONSTRAINT "onboarding_calls_demo_request_id_fkey" FOREIGN KEY ("demo_request_id") REFERENCES "demo_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "activation_states" ADD CONSTRAINT "activation_states_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "referral_events" ADD CONSTRAINT "referral_events_referral_code_id_fkey" FOREIGN KEY ("referral_code_id") REFERENCES "referral_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "customer_health_snapshots" ADD CONSTRAINT "customer_health_snapshots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_tour_states" ADD CONSTRAINT "user_tour_states_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
