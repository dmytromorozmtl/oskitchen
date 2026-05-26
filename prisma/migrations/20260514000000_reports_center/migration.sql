-- Reports Center: SavedReport
CREATE TABLE IF NOT EXISTS "saved_reports" (
    "id"           UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id"      UUID NOT NULL,
    "report_key"   VARCHAR(80) NOT NULL,
    "name"         VARCHAR(255) NOT NULL,
    "description"  TEXT,
    "filters_json" JSONB,
    "columns_json" JSONB,
    "pinned"       BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_reports_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'saved_reports_user_profile_fkey'
  ) THEN
    ALTER TABLE "saved_reports"
      ADD CONSTRAINT "saved_reports_user_profile_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "saved_reports_user_id_name_key"
  ON "saved_reports"("user_id", "name");

CREATE INDEX IF NOT EXISTS "saved_reports_user_id_report_key_idx"
  ON "saved_reports"("user_id", "report_key");
