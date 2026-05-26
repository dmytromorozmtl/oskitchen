ALTER TABLE "production_incidents"
ADD COLUMN "remediation_control_status" VARCHAR(30) NOT NULL DEFAULT 'TRACKING',
ADD COLUMN "remediation_snoozed_until" TIMESTAMP(3),
ADD COLUMN "remediation_control_summary" TEXT,
ADD COLUMN "remediation_control_updated_at" TIMESTAMP(3),
ADD COLUMN "remediation_control_updated_by_user_id" UUID;

CREATE INDEX "production_incidents_remediation_control_status_idx"
ON "production_incidents"("remediation_control_status");

CREATE INDEX "production_incidents_remediation_snoozed_until_idx"
ON "production_incidents"("remediation_snoozed_until");

CREATE INDEX "production_incidents_remediation_control_updated_by_user_id_idx"
ON "production_incidents"("remediation_control_updated_by_user_id");

CREATE INDEX "production_incidents_review_status_remediation_control_status_idx"
ON "production_incidents"("review_status", "remediation_control_status");

ALTER TABLE "production_incidents"
ADD CONSTRAINT "production_incidents_remediation_control_updated_by_user_id_fkey"
FOREIGN KEY ("remediation_control_updated_by_user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
