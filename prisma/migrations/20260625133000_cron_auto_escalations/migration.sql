ALTER TABLE "cron_execution_heartbeats"
ADD COLUMN "auto_escalated_at" TIMESTAMP(3),
ADD COLUMN "auto_escalated_for_marker" VARCHAR(120),
ADD COLUMN "auto_escalation_reason" VARCHAR(40),
ADD COLUMN "auto_escalation_ticket_id" UUID,
ADD COLUMN "auto_escalation_ticket_ref" VARCHAR(32);

CREATE INDEX "cron_execution_heartbeats_auto_escalated_at_idx"
ON "cron_execution_heartbeats"("auto_escalated_at");

CREATE INDEX "cron_execution_heartbeats_auto_escalation_ticket_id_idx"
ON "cron_execution_heartbeats"("auto_escalation_ticket_id");
