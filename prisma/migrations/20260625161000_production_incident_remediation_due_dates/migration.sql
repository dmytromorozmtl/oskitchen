ALTER TABLE "production_incidents"
ADD COLUMN "remediation_due_at" TIMESTAMP(3);

CREATE INDEX "production_incidents_remediation_due_at_idx"
ON "production_incidents"("remediation_due_at");

CREATE INDEX "production_incidents_review_status_remediation_due_at_idx"
ON "production_incidents"("review_status", "remediation_due_at");
