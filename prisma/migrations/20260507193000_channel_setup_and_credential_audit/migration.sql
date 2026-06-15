-- Channel setup progress + credential audit (no secrets in audit rows)
CREATE TYPE "ChannelCredentialAuditAction" AS ENUM ('SAVE', 'ROTATE_REQUESTED', 'DISCONNECT', 'TEST_CONNECTION');

CREATE TABLE "channel_setup_progress" (
    "id" UUID NOT NULL,
    "connection_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "current_step" INTEGER NOT NULL DEFAULT 0,
    "completed_steps_json" JSONB,
    "skipped_steps_json" JSONB,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channel_setup_progress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "channel_setup_progress_connection_id_key" ON "channel_setup_progress"("connection_id");
CREATE INDEX "channel_setup_progress_user_id_idx" ON "channel_setup_progress"("user_id");

ALTER TABLE "channel_setup_progress" ADD CONSTRAINT "channel_setup_progress_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "integration_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "channel_setup_progress" ADD CONSTRAINT "channel_setup_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "channel_credential_audits" (
    "id" UUID NOT NULL,
    "connection_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "action" "ChannelCredentialAuditAction" NOT NULL,
    "performed_by" VARCHAR(320) NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "channel_credential_audits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "channel_credential_audits_connection_id_created_at_idx" ON "channel_credential_audits"("connection_id", "created_at");

ALTER TABLE "channel_credential_audits" ADD CONSTRAINT "channel_credential_audits_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "integration_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "channel_credential_audits" ADD CONSTRAINT "channel_credential_audits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "webhook_events_connection_id_received_at_idx" ON "webhook_events"("connection_id", "received_at");
