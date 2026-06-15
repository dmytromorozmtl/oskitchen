ALTER TABLE "cron_execution_heartbeats"
ADD COLUMN "auto_escalation_follow_up_at" TIMESTAMP(3),
ADD COLUMN "auto_escalation_follow_up_for_marker" VARCHAR(120),
ADD COLUMN "auto_escalation_follow_up_kind" VARCHAR(40);

CREATE INDEX "cron_execution_heartbeats_auto_escalation_follow_up_at_idx"
ON "cron_execution_heartbeats"("auto_escalation_follow_up_at");
