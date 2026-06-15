-- AlterTable
ALTER TABLE "cron_execution_heartbeats"
ADD COLUMN "incident_acknowledged_at" TIMESTAMP(3),
ADD COLUMN "incident_acknowledged_for_marker" VARCHAR(120),
ADD COLUMN "incident_acknowledged_by_user_id" UUID;

-- CreateIndex
CREATE INDEX "cron_execution_heartbeats_incident_acknowledged_by_user_id_idx"
ON "cron_execution_heartbeats"("incident_acknowledged_by_user_id");

-- AddForeignKey
ALTER TABLE "cron_execution_heartbeats"
ADD CONSTRAINT "cron_execution_heartbeats_incident_acknowledged_by_user_id_fkey"
FOREIGN KEY ("incident_acknowledged_by_user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
