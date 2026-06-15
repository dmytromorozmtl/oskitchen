-- AI Copilot: insights, conversations, messages, action drafts, audit, settings

DO $$ BEGIN
  CREATE TYPE "CopilotInsightSeverity" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "CopilotMessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM', 'TOOL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "CopilotRedactionLevel" AS ENUM ('NONE', 'OPERATIONAL_SUMMARY', 'PII_REDACTED', 'FULL_INTERNAL_ALLOWED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "CopilotActionStatus" AS ENUM ('DRAFT', 'NEEDS_APPROVAL', 'APPROVED', 'EXECUTED', 'REJECTED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "copilot_insights" (
    "id"                  UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id"             UUID NOT NULL,
    "type"                VARCHAR(80) NOT NULL,
    "severity"            "CopilotInsightSeverity" NOT NULL DEFAULT 'INFO',
    "title"               VARCHAR(255) NOT NULL,
    "summary"             TEXT NOT NULL,
    "source_type"         VARCHAR(80),
    "source_id"           VARCHAR(120),
    "recommended_action"  TEXT,
    "action_route"        VARCHAR(512),
    "deterministic"       BOOLEAN NOT NULL DEFAULT TRUE,
    "metadata_json"       JSONB,
    "resolved_at"         TIMESTAMP(3),
    "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "copilot_insights_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'copilot_insights_user_fkey') THEN
    ALTER TABLE "copilot_insights"
      ADD CONSTRAINT "copilot_insights_user_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "copilot_insights_user_created_idx" ON "copilot_insights"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "copilot_insights_user_severity_idx" ON "copilot_insights"("user_id", "severity");
CREATE INDEX IF NOT EXISTS "copilot_insights_user_type_idx" ON "copilot_insights"("user_id", "type");

CREATE TABLE IF NOT EXISTS "copilot_conversations" (
    "id"         UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id"    UUID NOT NULL,
    "title"      VARCHAR(255) NOT NULL,
    "mode"       VARCHAR(40) NOT NULL DEFAULT 'ASK',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "copilot_conversations_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'copilot_conversations_user_fkey') THEN
    ALTER TABLE "copilot_conversations"
      ADD CONSTRAINT "copilot_conversations_user_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "copilot_conversations_user_updated_idx" ON "copilot_conversations"("user_id", "updated_at");

CREATE TABLE IF NOT EXISTS "copilot_messages" (
    "id"              UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL,
    "role"            "CopilotMessageRole" NOT NULL,
    "content"         TEXT NOT NULL,
    "redaction_level" "CopilotRedactionLevel" NOT NULL DEFAULT 'PII_REDACTED',
    "metadata_json"   JSONB,
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "copilot_messages_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'copilot_messages_conv_fkey') THEN
    ALTER TABLE "copilot_messages"
      ADD CONSTRAINT "copilot_messages_conv_fkey"
      FOREIGN KEY ("conversation_id") REFERENCES "copilot_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "copilot_messages_conv_created_idx" ON "copilot_messages"("conversation_id", "created_at");

CREATE TABLE IF NOT EXISTS "copilot_action_drafts" (
    "id"               UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id"          UUID NOT NULL,
    "conversation_id"  UUID,
    "action_type"      VARCHAR(80) NOT NULL,
    "title"            VARCHAR(255) NOT NULL,
    "description"      TEXT NOT NULL,
    "payload_json"     JSONB NOT NULL,
    "status"           "CopilotActionStatus" NOT NULL DEFAULT 'NEEDS_APPROVAL',
    "created_by"       VARCHAR(255) NOT NULL,
    "approved_by"      VARCHAR(255),
    "rejected_reason"  TEXT,
    "executed_at"      TIMESTAMP(3),
    "executed_summary" TEXT,
    "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "copilot_action_drafts_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'copilot_action_drafts_user_fkey') THEN
    ALTER TABLE "copilot_action_drafts"
      ADD CONSTRAINT "copilot_action_drafts_user_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'copilot_action_drafts_conv_fkey') THEN
    ALTER TABLE "copilot_action_drafts"
      ADD CONSTRAINT "copilot_action_drafts_conv_fkey"
      FOREIGN KEY ("conversation_id") REFERENCES "copilot_conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "copilot_action_drafts_user_status_idx" ON "copilot_action_drafts"("user_id", "status");
CREATE INDEX IF NOT EXISTS "copilot_action_drafts_user_type_idx" ON "copilot_action_drafts"("user_id", "action_type");
CREATE INDEX IF NOT EXISTS "copilot_action_drafts_conv_idx" ON "copilot_action_drafts"("conversation_id");

CREATE TABLE IF NOT EXISTS "copilot_audit_events" (
    "id"            UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id"       UUID NOT NULL,
    "event_type"    VARCHAR(80) NOT NULL,
    "performed_by"  VARCHAR(255) NOT NULL,
    "metadata_json" JSONB,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "copilot_audit_events_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'copilot_audit_events_user_fkey') THEN
    ALTER TABLE "copilot_audit_events"
      ADD CONSTRAINT "copilot_audit_events_user_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "copilot_audit_events_user_created_idx" ON "copilot_audit_events"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "copilot_audit_events_user_type_idx" ON "copilot_audit_events"("user_id", "event_type");

CREATE TABLE IF NOT EXISTS "copilot_settings" (
    "id"                     UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id"                UUID NOT NULL,
    "ai_narrative_enabled"   BOOLEAN NOT NULL DEFAULT TRUE,
    "deterministic_only"     BOOLEAN NOT NULL DEFAULT FALSE,
    "redaction_level"        "CopilotRedactionLevel" NOT NULL DEFAULT 'PII_REDACTED',
    "require_approval_all"   BOOLEAN NOT NULL DEFAULT TRUE,
    "max_context_rows"       INTEGER NOT NULL DEFAULT 50,
    "allowed_sources_json"   JSONB,
    "allowed_actions_json"   JSONB,
    "summary_retention_days" INTEGER NOT NULL DEFAULT 30,
    "privacy_disclaimer"     TEXT,
    "updated_at"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "copilot_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "copilot_settings_user_key" ON "copilot_settings"("user_id");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'copilot_settings_user_fkey') THEN
    ALTER TABLE "copilot_settings"
      ADD CONSTRAINT "copilot_settings_user_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
