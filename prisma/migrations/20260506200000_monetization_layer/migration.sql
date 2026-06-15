-- Monetization: trials, lifecycle, cancellations, integration health, API keys, branding/tax prefs

CREATE TYPE "TrialRecordStatus" AS ENUM ('ACTIVE', 'CONVERTED', 'EXPIRED', 'CANCELLED');
CREATE TYPE "LifecycleEmailSendStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');
CREATE TYPE "IntegrationHealthStatus" AS ENUM ('OK', 'DEGRADED', 'ERROR', 'UNKNOWN');

CREATE TABLE "trial_states" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'STARTER',
    "trial_started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trial_ends_at" TIMESTAMP(3) NOT NULL,
    "converted_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "status" "TrialRecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trial_states_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "trial_states_user_id_key" ON "trial_states"("user_id");

ALTER TABLE "trial_states" ADD CONSTRAINT "trial_states_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "lifecycle_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "event_name" VARCHAR(120) NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lifecycle_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "lifecycle_events_user_id_created_at_idx" ON "lifecycle_events"("user_id", "created_at");
CREATE INDEX "lifecycle_events_event_name_idx" ON "lifecycle_events"("event_name");

ALTER TABLE "lifecycle_events" ADD CONSTRAINT "lifecycle_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "lifecycle_emails" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "email_type" VARCHAR(80) NOT NULL,
    "status" "LifecycleEmailSendStatus" NOT NULL DEFAULT 'PENDING',
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lifecycle_emails_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "lifecycle_emails_user_id_email_type_idx" ON "lifecycle_emails"("user_id", "email_type");

ALTER TABLE "lifecycle_emails" ADD CONSTRAINT "lifecycle_emails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "cancellation_feedback" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "reason" VARCHAR(80) NOT NULL,
    "details" TEXT,
    "current_plan" "SubscriptionPlan" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cancellation_feedback_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "cancellation_feedback_user_id_idx" ON "cancellation_feedback"("user_id");

ALTER TABLE "cancellation_feedback" ADD CONSTRAINT "cancellation_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "integration_health_checks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "connection_id" UUID NOT NULL,
    "status" "IntegrationHealthStatus" NOT NULL DEFAULT 'UNKNOWN',
    "latency_ms" INTEGER,
    "error_message" TEXT,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_health_checks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "integration_health_checks_connection_id_checked_at_idx" ON "integration_health_checks"("connection_id", "checked_at");

ALTER TABLE "integration_health_checks" ADD CONSTRAINT "integration_health_checks_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "integration_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "api_keys" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "key_hash" VARCHAR(128) NOT NULL,
    "prefix" VARCHAR(16) NOT NULL,
    "last_used_at" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");
CREATE INDEX "api_keys_user_id_idx" ON "api_keys"("user_id");
CREATE INDEX "api_keys_prefix_idx" ON "api_keys"("prefix");

ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "kitchen_settings" ADD COLUMN "brand_color_hex" VARCHAR(16),
ADD COLUMN "storefront_theme_key" VARCHAR(64),
ADD COLUMN "custom_domain_hint" VARCHAR(255),
ADD COLUMN "email_footer_branding" TEXT,
ADD COLUMN "hide_kitchenos_branding" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "tax_display_name" VARCHAR(120),
ADD COLUMN "default_tax_rate" DECIMAL(8,4),
ADD COLUMN "tax_included_in_prices" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "date_format_preference" VARCHAR(32),
ADD COLUMN "weight_unit_preference" VARCHAR(16),
ADD COLUMN "distance_unit_preference" VARCHAR(16);
