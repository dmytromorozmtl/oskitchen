-- Notification Center
-- Additive only. Existing rows in notification_logs / notification_rules unchanged.

-- notification_logs: new optional columns
ALTER TABLE "notification_logs"
  ADD COLUMN IF NOT EXISTS "status" VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "category" VARCHAR(32),
  ADD COLUMN IF NOT EXISTS "channel" VARCHAR(24),
  ADD COLUMN IF NOT EXISTS "provider" VARCHAR(24),
  ADD COLUMN IF NOT EXISTS "template_key" VARCHAR(80),
  ADD COLUMN IF NOT EXISTS "rule_id" UUID,
  ADD COLUMN IF NOT EXISTS "recipient_user_id" UUID,
  ADD COLUMN IF NOT EXISTS "recipient_customer_id" UUID,
  ADD COLUMN IF NOT EXISTS "subject" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "trigger_type" VARCHAR(60),
  ADD COLUMN IF NOT EXISTS "source_type" VARCHAR(60),
  ADD COLUMN IF NOT EXISTS "source_id" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "provider_message_id" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "error_message" VARCHAR(1000),
  ADD COLUMN IF NOT EXISTS "sent_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "delivered_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "failed_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "retry_count" INTEGER NOT NULL DEFAULT 0;

DO $$ BEGIN
  ALTER TABLE "notification_logs"
    ADD CONSTRAINT "notification_logs_rule_fkey"
    FOREIGN KEY ("rule_id") REFERENCES "notification_rules"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "notification_logs_user_status_idx" ON "notification_logs"("user_id", "status");
CREATE INDEX IF NOT EXISTS "notification_logs_user_template_idx" ON "notification_logs"("user_id", "template_key");
CREATE INDEX IF NOT EXISTS "notification_logs_user_recipient_idx" ON "notification_logs"("user_id", "recipient");
CREATE INDEX IF NOT EXISTS "notification_logs_user_source_idx" ON "notification_logs"("user_id", "source_type", "source_id");
CREATE INDEX IF NOT EXISTS "notification_logs_provider_message_idx" ON "notification_logs"("provider_message_id");

-- notification_rules: new optional columns
ALTER TABLE "notification_rules"
  ADD COLUMN IF NOT EXISTS "rule_key" VARCHAR(80),
  ADD COLUMN IF NOT EXISTS "category" VARCHAR(32),
  ADD COLUMN IF NOT EXISTS "audience" VARCHAR(40),
  ADD COLUMN IF NOT EXISTS "template_key" VARCHAR(80),
  ADD COLUMN IF NOT EXISTS "trigger_key" VARCHAR(60),
  ADD COLUMN IF NOT EXISTS "conditions_json" JSONB,
  ADD COLUMN IF NOT EXISTS "dedupe_window_minutes" INTEGER,
  ADD COLUMN IF NOT EXISTS "brand_id" UUID,
  ADD COLUMN IF NOT EXISTS "location_id" UUID;

CREATE UNIQUE INDEX IF NOT EXISTS "notification_rules_user_rule_key_idx" ON "notification_rules"("user_id", "rule_key");
CREATE INDEX IF NOT EXISTS "notification_rules_user_enabled_idx" ON "notification_rules"("user_id", "enabled");
CREATE INDEX IF NOT EXISTS "notification_rules_user_trigger_idx" ON "notification_rules"("user_id", "trigger_key");

-- notification_templates
CREATE TABLE IF NOT EXISTS "notification_templates" (
  "id"             UUID PRIMARY KEY,
  "user_id"        UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "brand_id"       UUID,
  "location_id"    UUID,
  "template_key"   VARCHAR(80) NOT NULL,
  "category"       VARCHAR(32) NOT NULL,
  "name"           VARCHAR(255) NOT NULL,
  "subject"        VARCHAR(255) NOT NULL,
  "preheader"      VARCHAR(255),
  "body_html"      TEXT NOT NULL,
  "body_text"      TEXT NOT NULL,
  "variables_json" JSONB,
  "active"         BOOLEAN NOT NULL DEFAULT TRUE,
  "system_template" BOOLEAN NOT NULL DEFAULT FALSE,
  "version"        INTEGER NOT NULL DEFAULT 1,
  "created_at"     TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updated_at"     TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "notification_templates_user_key_brand_loc_idx"
  ON "notification_templates"("user_id", "template_key", "brand_id", "location_id");
CREATE INDEX IF NOT EXISTS "notification_templates_user_key_idx"
  ON "notification_templates"("user_id", "template_key");
CREATE INDEX IF NOT EXISTS "notification_templates_user_category_idx"
  ON "notification_templates"("user_id", "category");

-- notification_events
CREATE TABLE IF NOT EXISTS "notification_events" (
  "id"                UUID PRIMARY KEY,
  "user_id"           UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "log_id"            UUID REFERENCES "notification_logs"("id") ON DELETE SET NULL,
  "event_type"        VARCHAR(60) NOT NULL,
  "provider"          VARCHAR(24) NOT NULL,
  "provider_event_id" VARCHAR(255) UNIQUE,
  "metadata_json"     JSONB,
  "created_at"        TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "notification_events_user_created_idx"
  ON "notification_events"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "notification_events_user_type_idx"
  ON "notification_events"("user_id", "event_type");
CREATE INDEX IF NOT EXISTS "notification_events_log_idx"
  ON "notification_events"("log_id");

-- notification_preferences
CREATE TABLE IF NOT EXISTS "notification_preferences" (
  "id"                              UUID PRIMARY KEY,
  "user_id"                         UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "customer_id"                     UUID,
  "staff_member_id"                 UUID,
  "target_user_id"                  UUID,
  "email_transactional_enabled"     BOOLEAN NOT NULL DEFAULT TRUE,
  "email_reminder_enabled"          BOOLEAN NOT NULL DEFAULT TRUE,
  "email_marketing_enabled"         BOOLEAN NOT NULL DEFAULT FALSE,
  "internal_alerts_enabled"         BOOLEAN NOT NULL DEFAULT TRUE,
  "muted_until"                     TIMESTAMP(3),
  "created_at"                      TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updated_at"                      TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "notification_preferences_user_customer_idx"
  ON "notification_preferences"("user_id", "customer_id");
CREATE UNIQUE INDEX IF NOT EXISTS "notification_preferences_user_staff_idx"
  ON "notification_preferences"("user_id", "staff_member_id");
CREATE UNIQUE INDEX IF NOT EXISTS "notification_preferences_user_target_user_idx"
  ON "notification_preferences"("user_id", "target_user_id");
CREATE INDEX IF NOT EXISTS "notification_preferences_user_idx"
  ON "notification_preferences"("user_id");
