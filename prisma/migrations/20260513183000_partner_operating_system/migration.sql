-- Partner Operating System: org metadata, member roles, client workspace links, revenue, support tickets.

CREATE TYPE "PartnerOrgType" AS ENUM (
  'AGENCY',
  'CONSULTANCY',
  'IMPLEMENTATION_FIRM',
  'RESELLER',
  'FRANCHISE_GROUP',
  'REGIONAL_OPERATOR',
  'ENTERPRISE_DEPLOYMENT',
  'WHITE_LABEL',
  'SUPPORT_CONTRACTOR',
  'OTHER'
);

CREATE TYPE "PartnerTier" AS ENUM ('FOUNDING', 'STANDARD', 'PREMIUM', 'ENTERPRISE');

CREATE TYPE "PartnerMemberRole" AS ENUM (
  'PARTNER_OWNER',
  'PARTNER_MANAGER',
  'IMPLEMENTATION_SPECIALIST',
  'ONBOARDING_SPECIALIST',
  'SUPPORT_AGENT',
  'CONSULTANT',
  'TRAINER',
  'FINANCE_MANAGER',
  'VIEWER'
);

CREATE TYPE "PartnerImplementationStage" AS ENUM (
  'DISCOVERY',
  'CONTRACT_SIGNED',
  'DATA_MIGRATION',
  'MENU_SETUP',
  'INTEGRATIONS',
  'STAFF_SETUP',
  'TRAINING',
  'QA',
  'SOFT_LAUNCH',
  'GO_LIVE',
  'STABILIZATION',
  'EXPANSION'
);

CREATE TYPE "PartnerSupportTier" AS ENUM ('STANDARD', 'PRIORITY', 'ENTERPRISE');

CREATE TYPE "PartnerRevenueType" AS ENUM (
  'COMMISSION',
  'IMPLEMENTATION_FEE',
  'SUBSCRIPTION_SHARE',
  'UPSELL',
  'OTHER'
);

CREATE TYPE "PartnerPayoutStatus" AS ENUM ('PENDING', 'PAID', 'HELD', 'FAILED');

CREATE TYPE "PartnerManagedTicketStatus" AS ENUM ('NEW', 'OPEN', 'WAITING', 'RESOLVED', 'CLOSED');

CREATE TYPE "PartnerManagedTicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TYPE "PartnerManagedTicketCategory" AS ENUM (
  'INTEGRATION',
  'BILLING',
  'ONBOARDING',
  'TRAINING',
  'DATA',
  'GENERAL'
);

-- partner_accounts
ALTER TABLE "partner_accounts" ADD COLUMN "slug" VARCHAR(120);
UPDATE "partner_accounts" SET "slug" = 'org-' || substring(replace("id"::text, '-', ''), 1, 12) WHERE "slug" IS NULL;
ALTER TABLE "partner_accounts" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "partner_accounts_slug_key" ON "partner_accounts"("slug");

ALTER TABLE "partner_accounts" ADD COLUMN "org_type" "PartnerOrgType" NOT NULL DEFAULT 'AGENCY';
ALTER TABLE "partner_accounts" ADD COLUMN "tier" "PartnerTier" NOT NULL DEFAULT 'STANDARD';
ALTER TABLE "partner_accounts" ADD COLUMN "logo_url" TEXT;
ALTER TABLE "partner_accounts" ADD COLUMN "website_url" VARCHAR(512);
ALTER TABLE "partner_accounts" ADD COLUMN "region" VARCHAR(120);
ALTER TABLE "partner_accounts" ADD COLUMN "timezone" VARCHAR(64);
ALTER TABLE "partner_accounts" ADD COLUMN "billing_owner_user_id" UUID;
ALTER TABLE "partner_accounts" ADD COLUMN "white_label_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "partner_accounts" ADD COLUMN "custom_domain" VARCHAR(255);
ALTER TABLE "partner_accounts" ADD COLUMN "support_email" VARCHAR(255);
ALTER TABLE "partner_accounts" ADD COLUMN "onboarding_manager_user_id" UUID;

ALTER TABLE "partner_accounts" ADD CONSTRAINT "partner_accounts_billing_owner_user_id_fkey" FOREIGN KEY ("billing_owner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "partner_accounts" ADD CONSTRAINT "partner_accounts_onboarding_manager_user_id_fkey" FOREIGN KEY ("onboarding_manager_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "partner_accounts_org_type_idx" ON "partner_accounts"("org_type");

-- partner_members: role enum + user link + invites
ALTER TABLE "partner_members" ADD COLUMN "user_id" UUID;
ALTER TABLE "partner_members" ADD COLUMN "permissions" JSONB;
ALTER TABLE "partner_members" ADD COLUMN "invited_at" TIMESTAMP(3);
ALTER TABLE "partner_members" ADD COLUMN "accepted_at" TIMESTAMP(3);

ALTER TABLE "partner_members" ADD COLUMN "role_new" "PartnerMemberRole";

UPDATE "partner_members" SET "role_new" = CASE lower(trim("role"))
  WHEN 'owner' THEN 'PARTNER_OWNER'::"PartnerMemberRole"
  WHEN 'manager' THEN 'PARTNER_MANAGER'::"PartnerMemberRole"
  ELSE 'CONSULTANT'::"PartnerMemberRole"
END;

ALTER TABLE "partner_members" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "partner_members" DROP COLUMN "role";
ALTER TABLE "partner_members" RENAME COLUMN "role_new" TO "role";
ALTER TABLE "partner_members" ALTER COLUMN "role" SET NOT NULL;
ALTER TABLE "partner_members" ALTER COLUMN "role" SET DEFAULT 'CONSULTANT'::"PartnerMemberRole";

ALTER TABLE "partner_members" ADD CONSTRAINT "partner_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "partner_members_user_id_idx" ON "partner_members"("user_id");

-- partner_clients
ALTER TABLE "partner_clients" ADD COLUMN "workspace_id" UUID;
ALTER TABLE "partner_clients" ADD COLUMN "assigned_manager_user_id" UUID;
ALTER TABLE "partner_clients" ADD COLUMN "implementation_stage" "PartnerImplementationStage" NOT NULL DEFAULT 'DISCOVERY';
ALTER TABLE "partner_clients" ADD COLUMN "onboarding_status_label" VARCHAR(120);
ALTER TABLE "partner_clients" ADD COLUMN "launch_date" TIMESTAMP(3);
ALTER TABLE "partner_clients" ADD COLUMN "health_score" INTEGER;
ALTER TABLE "partner_clients" ADD COLUMN "mrr_cents" INTEGER;
ALTER TABLE "partner_clients" ADD COLUMN "expansion_potential" INTEGER;
ALTER TABLE "partner_clients" ADD COLUMN "support_tier" "PartnerSupportTier" NOT NULL DEFAULT 'STANDARD';
ALTER TABLE "partner_clients" ADD COLUMN "integration_status_summary" VARCHAR(255);
ALTER TABLE "partner_clients" ADD COLUMN "launch_readiness_pct" INTEGER;
ALTER TABLE "partner_clients" ADD COLUMN "last_activity_at" TIMESTAMP(3);
ALTER TABLE "partner_clients" ADD COLUMN "internal_notes" TEXT;
ALTER TABLE "partner_clients" ADD COLUMN "partner_tags" JSONB;

ALTER TABLE "partner_clients" ADD CONSTRAINT "partner_clients_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "partner_clients" ADD CONSTRAINT "partner_clients_assigned_manager_user_id_fkey" FOREIGN KEY ("assigned_manager_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "partner_clients_workspace_id_idx" ON "partner_clients"("workspace_id");
CREATE INDEX "partner_clients_implementation_stage_idx" ON "partner_clients"("implementation_stage");

-- partner_revenue
CREATE TABLE "partner_revenue" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "partner_account_id" UUID NOT NULL,
    "partner_client_id" UUID,
    "workspace_id" UUID,
    "revenue_type" "PartnerRevenueType" NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "payout_status" "PartnerPayoutStatus" NOT NULL DEFAULT 'PENDING',
    "period_start" TIMESTAMP(3),
    "period_end" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_revenue_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "partner_revenue_partner_account_id_created_at_idx" ON "partner_revenue"("partner_account_id", "created_at");
CREATE INDEX "partner_revenue_payout_status_idx" ON "partner_revenue"("payout_status");

ALTER TABLE "partner_revenue" ADD CONSTRAINT "partner_revenue_partner_account_id_fkey" FOREIGN KEY ("partner_account_id") REFERENCES "partner_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "partner_revenue" ADD CONSTRAINT "partner_revenue_partner_client_id_fkey" FOREIGN KEY ("partner_client_id") REFERENCES "partner_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "partner_revenue" ADD CONSTRAINT "partner_revenue_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- partner_support_tickets
CREATE TABLE "partner_support_tickets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "partner_account_id" UUID NOT NULL,
    "partner_client_id" UUID,
    "workspace_id" UUID,
    "priority" "PartnerManagedTicketPriority" NOT NULL,
    "category" "PartnerManagedTicketCategory" NOT NULL,
    "assigned_to_user_id" UUID,
    "status" "PartnerManagedTicketStatus" NOT NULL DEFAULT 'NEW',
    "subject" VARCHAR(255) NOT NULL,
    "body" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_support_tickets_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "partner_support_tickets_partner_account_id_status_idx" ON "partner_support_tickets"("partner_account_id", "status");
CREATE INDEX "partner_support_tickets_workspace_id_idx" ON "partner_support_tickets"("workspace_id");

ALTER TABLE "partner_support_tickets" ADD CONSTRAINT "partner_support_tickets_partner_account_id_fkey" FOREIGN KEY ("partner_account_id") REFERENCES "partner_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "partner_support_tickets" ADD CONSTRAINT "partner_support_tickets_partner_client_id_fkey" FOREIGN KEY ("partner_client_id") REFERENCES "partner_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "partner_support_tickets" ADD CONSTRAINT "partner_support_tickets_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "partner_support_tickets" ADD CONSTRAINT "partner_support_tickets_assigned_to_user_id_fkey" FOREIGN KEY ("assigned_to_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
