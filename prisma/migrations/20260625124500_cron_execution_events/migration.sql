-- CreateTable
CREATE TABLE "cron_execution_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" VARCHAR(120) NOT NULL,
    "event_type" VARCHAR(40) NOT NULL,
    "production_tier" BOOLEAN NOT NULL DEFAULT false,
    "status_code" INTEGER,
    "duration_ms" INTEGER,
    "error_message" TEXT,
    "incident_marker" VARCHAR(120),
    "actor_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cron_execution_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cron_execution_events_slug_created_at_idx"
ON "cron_execution_events"("slug", "created_at");

-- CreateIndex
CREATE INDEX "cron_execution_events_event_type_created_at_idx"
ON "cron_execution_events"("event_type", "created_at");

-- CreateIndex
CREATE INDEX "cron_execution_events_actor_user_id_idx"
ON "cron_execution_events"("actor_user_id");

-- AddForeignKey
ALTER TABLE "cron_execution_events"
ADD CONSTRAINT "cron_execution_events_actor_user_id_fkey"
FOREIGN KEY ("actor_user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
