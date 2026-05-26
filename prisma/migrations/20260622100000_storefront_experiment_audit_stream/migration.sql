-- Append-only experiment audit stream (compliance / immutable log)
CREATE TABLE IF NOT EXISTS "storefront_experiment_audit_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "storefront_id" UUID NOT NULL,
  "action" VARCHAR(120) NOT NULL,
  "severity" VARCHAR(20),
  "source" VARCHAR(40),
  "actor_email" VARCHAR(255),
  "metadata_json" JSONB,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "storefront_experiment_audit_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "storefront_experiment_audit_events_storefront_created_idx"
  ON "storefront_experiment_audit_events" ("storefront_id", "created_at" DESC);

ALTER TABLE "storefront_experiment_audit_events"
  ADD CONSTRAINT "storefront_experiment_audit_events_storefront_id_fkey"
  FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
