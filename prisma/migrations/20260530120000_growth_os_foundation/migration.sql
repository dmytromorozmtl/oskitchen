-- Growth OS: extend GTM schema (additive)

-- Demo pipeline stages
ALTER TYPE "DemoRequestStatus" ADD VALUE 'QUALIFIED';
ALTER TYPE "DemoRequestStatus" ADD VALUE 'NURTURE';

-- BetaLead attribution + CRM ownership
ALTER TABLE "beta_leads" ADD COLUMN IF NOT EXISTS "utm_source" VARCHAR(120);
ALTER TABLE "beta_leads" ADD COLUMN IF NOT EXISTS "utm_medium" VARCHAR(120);
ALTER TABLE "beta_leads" ADD COLUMN IF NOT EXISTS "utm_campaign" VARCHAR(120);
ALTER TABLE "beta_leads" ADD COLUMN IF NOT EXISTS "lifecycle_stage" VARCHAR(40);
ALTER TABLE "beta_leads" ADD COLUMN IF NOT EXISTS "owner_user_id" UUID;

CREATE INDEX IF NOT EXISTS "beta_leads_lifecycle_stage_idx" ON "beta_leads"("lifecycle_stage");
CREATE INDEX IF NOT EXISTS "beta_leads_utm_source_idx" ON "beta_leads"("utm_source");

-- Demo request operations fields
ALTER TABLE "demo_requests" ADD COLUMN IF NOT EXISTS "qualification_score" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "demo_requests" ADD COLUMN IF NOT EXISTS "assigned_to_user_id" UUID;
ALTER TABLE "demo_requests" ADD COLUMN IF NOT EXISTS "meeting_url" TEXT;
ALTER TABLE "demo_requests" ADD COLUMN IF NOT EXISTS "follow_up_at" TIMESTAMP(3);

-- Founder outbound campaigns (lightweight)
CREATE TABLE IF NOT EXISTS "outreach_campaigns" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(200) NOT NULL,
    "channel" VARCHAR(60) NOT NULL,
    "audience" VARCHAR(200) NOT NULL,
    "status" VARCHAR(40) NOT NULL DEFAULT 'DRAFT',
    "metrics_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outreach_campaigns_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "outreach_campaigns_status_created_at_idx" ON "outreach_campaigns"("status", "created_at");
