ALTER TABLE "production_incidents"
ADD COLUMN "review_status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
ADD COLUMN "root_cause_category" VARCHAR(40),
ADD COLUMN "remediation_owner_id" UUID,
ADD COLUMN "review_summary" TEXT,
ADD COLUMN "reviewed_at" TIMESTAMP(3),
ADD COLUMN "reviewed_by_user_id" UUID;

CREATE INDEX "production_incidents_remediation_owner_id_idx"
ON "production_incidents"("remediation_owner_id");

CREATE INDEX "production_incidents_reviewed_by_user_id_idx"
ON "production_incidents"("reviewed_by_user_id");

CREATE INDEX "production_incidents_review_status_idx"
ON "production_incidents"("review_status");

ALTER TABLE "production_incidents"
ADD CONSTRAINT "production_incidents_remediation_owner_id_fkey"
FOREIGN KEY ("remediation_owner_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "production_incidents"
ADD CONSTRAINT "production_incidents_reviewed_by_user_id_fkey"
FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
