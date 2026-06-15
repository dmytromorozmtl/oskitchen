-- Audited platform support sessions (workspace-scoped), separate from user-user impersonation.

CREATE TYPE "PlatformSupportSessionMode" AS ENUM ('READ_ONLY', 'ASSISTED_EDIT');

CREATE TYPE "PlatformSupportSessionStatus" AS ENUM ('ACTIVE', 'ENDED', 'EXPIRED', 'REVOKED');

CREATE TABLE "platform_support_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_user_id" UUID NOT NULL,
    "actor_email" VARCHAR(255),
    "target_workspace_id" UUID NOT NULL,
    "target_user_id" UUID NOT NULL,
    "mode" "PlatformSupportSessionMode" NOT NULL,
    "reason" VARCHAR(500) NOT NULL,
    "status" "PlatformSupportSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3),
    "metadata_json" JSONB,

    CONSTRAINT "platform_support_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "platform_support_sessions_actor_user_id_status_idx" ON "platform_support_sessions"("actor_user_id", "status");

CREATE INDEX "platform_support_sessions_target_user_id_status_idx" ON "platform_support_sessions"("target_user_id", "status");

CREATE INDEX "platform_support_sessions_target_workspace_id_status_idx" ON "platform_support_sessions"("target_workspace_id", "status");

ALTER TABLE "platform_support_sessions" ADD CONSTRAINT "platform_support_sessions_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "platform_support_sessions" ADD CONSTRAINT "platform_support_sessions_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "platform_support_sessions" ADD CONSTRAINT "platform_support_sessions_target_workspace_id_fkey" FOREIGN KEY ("target_workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
