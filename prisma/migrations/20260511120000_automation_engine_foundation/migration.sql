-- Automation engine foundation: rules, triggers, actions, execution audit trail.

CREATE TYPE "AutomationExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'SKIPPED');

CREATE TYPE "AutomationTriggerType" AS ENUM (
    'ORDER_CREATED',
    'ORDER_STATUS_CHANGED',
    'PRODUCTION_COMPLETED',
    'PACKING_COMPLETED',
    'INVENTORY_LOW',
    'SCHEDULED_CRON',
    'INTEGRATION_FAILED',
    'WEBHOOK_FAILED',
    'MANUAL'
);

CREATE TYPE "AutomationActionType" AS ENUM (
    'NOTIFY_EMAIL',
    'NOTIFY_IN_APP',
    'CREATE_TASK',
    'WEBHOOK_OUTBOUND',
    'LOG_ONLY'
);

CREATE TABLE "automation_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "template_key" VARCHAR(120),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_rules_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "automation_rules_user_id_enabled_idx" ON "automation_rules"("user_id", "enabled");

ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "automation_triggers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rule_id" UUID NOT NULL,
    "type" "AutomationTriggerType" NOT NULL,
    "config" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "automation_triggers_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "automation_triggers_rule_id_idx" ON "automation_triggers"("rule_id");

ALTER TABLE "automation_triggers" ADD CONSTRAINT "automation_triggers_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "automation_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "automation_actions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rule_id" UUID NOT NULL,
    "type" "AutomationActionType" NOT NULL,
    "config" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "automation_actions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "automation_actions_rule_id_idx" ON "automation_actions"("rule_id");

ALTER TABLE "automation_actions" ADD CONSTRAINT "automation_actions_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "automation_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "automation_executions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rule_id" UUID NOT NULL,
    "status" "AutomationExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "trigger_type" "AutomationTriggerType",
    "input_payload" JSONB,
    "output_payload" JSONB,
    "error_message" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "automation_executions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "automation_executions_rule_id_started_at_idx" ON "automation_executions"("rule_id", "started_at");

ALTER TABLE "automation_executions" ADD CONSTRAINT "automation_executions_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "automation_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
