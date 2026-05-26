CREATE TABLE "production_incidents" (
  "id" UUID NOT NULL,
  "source" VARCHAR(40) NOT NULL,
  "source_key" VARCHAR(191) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "summary" TEXT NOT NULL,
  "severity" VARCHAR(20) NOT NULL,
  "workflow_status" VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  "href" VARCHAR(512) NOT NULL,
  "owner_label" VARCHAR(255) NOT NULL,
  "assigned_to_id" UUID,
  "acknowledged_at" TIMESTAMP(3),
  "acknowledged_by_user_id" UUID,
  "resolved_at" TIMESTAMP(3),
  "resolved_by_user_id" UUID,
  "resolution_summary" TEXT,
  "auto_resolved" BOOLEAN NOT NULL DEFAULT false,
  "source_detected_at" TIMESTAMP(3),
  "first_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadata_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "production_incidents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "production_incident_events" (
  "id" UUID NOT NULL,
  "incident_id" UUID NOT NULL,
  "event_type" VARCHAR(40) NOT NULL,
  "summary" VARCHAR(500) NOT NULL,
  "performed_by_id" UUID,
  "metadata_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "production_incident_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "production_incidents_source_key_key"
ON "production_incidents"("source_key");

CREATE INDEX "production_incidents_source_workflow_status_idx"
ON "production_incidents"("source", "workflow_status");

CREATE INDEX "production_incidents_assigned_to_id_idx"
ON "production_incidents"("assigned_to_id");

CREATE INDEX "production_incidents_acknowledged_by_user_id_idx"
ON "production_incidents"("acknowledged_by_user_id");

CREATE INDEX "production_incidents_resolved_by_user_id_idx"
ON "production_incidents"("resolved_by_user_id");

CREATE INDEX "production_incidents_last_seen_at_idx"
ON "production_incidents"("last_seen_at");

CREATE INDEX "production_incidents_created_at_idx"
ON "production_incidents"("created_at");

CREATE INDEX "production_incident_events_incident_id_created_at_idx"
ON "production_incident_events"("incident_id", "created_at");

CREATE INDEX "production_incident_events_event_type_created_at_idx"
ON "production_incident_events"("event_type", "created_at");

CREATE INDEX "production_incident_events_performed_by_id_idx"
ON "production_incident_events"("performed_by_id");

ALTER TABLE "production_incidents"
ADD CONSTRAINT "production_incidents_assigned_to_id_fkey"
FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "production_incidents"
ADD CONSTRAINT "production_incidents_acknowledged_by_user_id_fkey"
FOREIGN KEY ("acknowledged_by_user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "production_incidents"
ADD CONSTRAINT "production_incidents_resolved_by_user_id_fkey"
FOREIGN KEY ("resolved_by_user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "production_incident_events"
ADD CONSTRAINT "production_incident_events_incident_id_fkey"
FOREIGN KEY ("incident_id") REFERENCES "production_incidents"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "production_incident_events"
ADD CONSTRAINT "production_incident_events_performed_by_id_fkey"
FOREIGN KEY ("performed_by_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
