-- Beta program operations: pipeline stages, scoring dimensions, cohorts, invitations, feedback.

CREATE TYPE "BetaProgramStage" AS ENUM (
  'NEW',
  'REVIEWING',
  'QUALIFIED',
  'WAITLISTED',
  'APPROVED',
  'INVITED',
  'ONBOARDING',
  'ACTIVATED',
  'POWER_USER',
  'CONVERTED',
  'CHURNED',
  'REJECTED'
);

CREATE TYPE "BetaFeedbackCategory" AS ENUM (
  'FEATURE_REQUEST',
  'ONBOARDING_BLOCKER',
  'BUG',
  'UX_FRICTION',
  'INTEGRATION',
  'WORKFLOW_GAP',
  'GENERAL'
);

CREATE TYPE "BetaFeedbackSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'BLOCKER');

CREATE TABLE "beta_cohorts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(200) NOT NULL,
    "launch_date" TIMESTAMP(3),
    "target_vertical" "BusinessType",
    "target_region" VARCHAR(120),
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beta_cohorts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "beta_cohorts_active_launch_date_idx" ON "beta_cohorts"("active", "launch_date");

ALTER TABLE "beta_leads" ADD COLUMN "program_stage" "BetaProgramStage" NOT NULL DEFAULT 'NEW';
ALTER TABLE "beta_leads" ADD COLUMN "locations_count" INTEGER;
ALTER TABLE "beta_leads" ADD COLUMN "team_size" INTEGER;
ALTER TABLE "beta_leads" ADD COLUMN "referral_source" VARCHAR(160);
ALTER TABLE "beta_leads" ADD COLUMN "onboarding_readiness" INTEGER;
ALTER TABLE "beta_leads" ADD COLUMN "expansion_potential" INTEGER;
ALTER TABLE "beta_leads" ADD COLUMN "internal_tags" JSONB;
ALTER TABLE "beta_leads" ADD COLUMN "founder_notes" TEXT;
ALTER TABLE "beta_leads" ADD COLUMN "expansion_score" INTEGER;
ALTER TABLE "beta_leads" ADD COLUMN "activation_probability" INTEGER;
ALTER TABLE "beta_leads" ADD COLUMN "risk_score" INTEGER;
ALTER TABLE "beta_leads" ADD COLUMN "onboarding_complexity" INTEGER;
ALTER TABLE "beta_leads" ADD COLUMN "estimated_onboarding_days" INTEGER;
ALTER TABLE "beta_leads" ADD COLUMN "arr_potential_score" INTEGER;
ALTER TABLE "beta_leads" ADD COLUMN "pinned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "beta_leads" ADD COLUMN "last_activity_at" TIMESTAMP(3);
ALTER TABLE "beta_leads" ADD COLUMN "languages" TEXT;
ALTER TABLE "beta_leads" ADD COLUMN "integrations_needed" TEXT;
ALTER TABLE "beta_leads" ADD COLUMN "onboarding_urgency" VARCHAR(80);
ALTER TABLE "beta_leads" ADD COLUMN "beta_cohort_id" UUID;
ALTER TABLE "beta_leads" ADD COLUMN "approved_at" TIMESTAMP(3);
ALTER TABLE "beta_leads" ADD COLUMN "rejected_at" TIMESTAMP(3);
ALTER TABLE "beta_leads" ADD COLUMN "invited_at" TIMESTAMP(3);
ALTER TABLE "beta_leads" ADD COLUMN "onboarded_at" TIMESTAMP(3);
ALTER TABLE "beta_leads" ADD COLUMN "converted_to_customer_at" TIMESTAMP(3);
ALTER TABLE "beta_leads" ADD COLUMN "churned_at" TIMESTAMP(3);

UPDATE "beta_leads" SET "program_stage" = CASE "status"::text
  WHEN 'REJECTED' THEN 'REJECTED'::"BetaProgramStage"
  WHEN 'CUSTOMER' THEN 'CONVERTED'::"BetaProgramStage"
  WHEN 'ONBOARDED' THEN 'ONBOARDING'::"BetaProgramStage"
  WHEN 'QUALIFIED' THEN 'QUALIFIED'::"BetaProgramStage"
  WHEN 'CONTACTED' THEN 'REVIEWING'::"BetaProgramStage"
  WHEN 'DEMO_BOOKED' THEN 'REVIEWING'::"BetaProgramStage"
  ELSE 'NEW'::"BetaProgramStage"
END;

CREATE INDEX "beta_leads_program_stage_created_at_idx" ON "beta_leads"("program_stage", "created_at");
CREATE INDEX "beta_leads_beta_cohort_id_idx" ON "beta_leads"("beta_cohort_id");

ALTER TABLE "beta_leads" ADD CONSTRAINT "beta_leads_beta_cohort_id_fkey" FOREIGN KEY ("beta_cohort_id") REFERENCES "beta_cohorts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "beta_invitations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "beta_lead_id" UUID NOT NULL,
    "cohort_id" UUID,
    "invite_token" VARCHAR(64) NOT NULL,
    "sent_at" TIMESTAMP(3),
    "accepted_at" TIMESTAMP(3),
    "expired_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beta_invitations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "beta_invitations_invite_token_key" ON "beta_invitations"("invite_token");
CREATE INDEX "beta_invitations_beta_lead_id_created_at_idx" ON "beta_invitations"("beta_lead_id", "created_at");
CREATE INDEX "beta_invitations_cohort_id_idx" ON "beta_invitations"("cohort_id");

ALTER TABLE "beta_invitations" ADD CONSTRAINT "beta_invitations_beta_lead_id_fkey" FOREIGN KEY ("beta_lead_id") REFERENCES "beta_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "beta_invitations" ADD CONSTRAINT "beta_invitations_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "beta_cohorts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "beta_feedback" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "beta_lead_id" UUID NOT NULL,
    "category" "BetaFeedbackCategory" NOT NULL,
    "severity" "BetaFeedbackSeverity" NOT NULL DEFAULT 'MEDIUM',
    "feedback" TEXT NOT NULL,
    "requested_feature" TEXT,
    "source" VARCHAR(80),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beta_feedback_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "beta_feedback_beta_lead_id_created_at_idx" ON "beta_feedback"("beta_lead_id", "created_at");
CREATE INDEX "beta_feedback_category_idx" ON "beta_feedback"("category");

ALTER TABLE "beta_feedback" ADD CONSTRAINT "beta_feedback_beta_lead_id_fkey" FOREIGN KEY ("beta_lead_id") REFERENCES "beta_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
