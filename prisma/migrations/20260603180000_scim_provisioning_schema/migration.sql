-- SCIM 2.0 provisioning foundation (pilot — disabled by default).

CREATE TYPE "ScimPilotPhase" AS ENUM ('DISABLED', 'PILOT_CONFIGURED', 'PILOT_ACTIVE');

CREATE TABLE "workspace_scim_settings" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "token_hash" VARCHAR(128) NOT NULL,
    "pilot_phase" "ScimPilotPhase" NOT NULL DEFAULT 'DISABLED',
    "last_rotated_at" TIMESTAMP(3),
    "configured_by_user_id" UUID,
    "configured_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_scim_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "scim_provisioned_users" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "external_id" VARCHAR(512),
    "idp_subject" VARCHAR(512),
    "user_name" VARCHAR(255) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "role" "WorkspaceMemberRole" NOT NULL DEFAULT 'STAFF',
    "last_sync_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scim_provisioned_users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "workspace_scim_settings_workspace_id_key" ON "workspace_scim_settings"("workspace_id");

CREATE UNIQUE INDEX "scim_provisioned_users_workspace_id_user_name_key" ON "scim_provisioned_users"("workspace_id", "user_name");

CREATE UNIQUE INDEX "scim_provisioned_users_workspace_id_external_id_key" ON "scim_provisioned_users"("workspace_id", "external_id");

CREATE INDEX "scim_provisioned_users_user_id_idx" ON "scim_provisioned_users"("user_id");

ALTER TABLE "workspace_scim_settings" ADD CONSTRAINT "workspace_scim_settings_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "workspace_scim_settings" ADD CONSTRAINT "workspace_scim_settings_configured_by_user_id_fkey" FOREIGN KEY ("configured_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "scim_provisioned_users" ADD CONSTRAINT "scim_provisioned_users_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "scim_provisioned_users" ADD CONSTRAINT "scim_provisioned_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
