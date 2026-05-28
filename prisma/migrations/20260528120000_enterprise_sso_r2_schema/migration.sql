-- Era 16 Cycle 2: SSO R2 pilot foundation schema (disabled by default; not production SSO).

CREATE TYPE "SsoIdpVendor" AS ENUM ('OKTA', 'ENTRA_ID');

CREATE TYPE "SsoPilotPhase" AS ENUM ('DISABLED', 'PILOT_CONFIGURED', 'PILOT_ACTIVE');

CREATE TABLE "workspace_sso_settings" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "idp_vendor" "SsoIdpVendor",
    "allowed_email_domains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "supabase_sso_provider_ref" VARCHAR(255),
    "break_glass_owner_enabled" BOOLEAN NOT NULL DEFAULT true,
    "pilot_phase" "SsoPilotPhase" NOT NULL DEFAULT 'DISABLED',
    "login_hint_domain" VARCHAR(255),
    "notes" TEXT,
    "configured_by_user_id" UUID,
    "configured_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_sso_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sso_identities" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "idp_vendor" "SsoIdpVendor" NOT NULL,
    "idp_subject" VARCHAR(512) NOT NULL,
    "email_at_link" VARCHAR(255),
    "last_login_at" TIMESTAMP(3),
    "linked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sso_identities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "workspace_sso_settings_workspace_id_key" ON "workspace_sso_settings"("workspace_id");

CREATE INDEX "sso_identities_user_id_idx" ON "sso_identities"("user_id");

CREATE UNIQUE INDEX "sso_identities_workspace_id_idp_vendor_idp_subject_key" ON "sso_identities"("workspace_id", "idp_vendor", "idp_subject");

CREATE UNIQUE INDEX "sso_identities_workspace_id_user_id_idp_vendor_key" ON "sso_identities"("workspace_id", "user_id", "idp_vendor");

ALTER TABLE "workspace_sso_settings" ADD CONSTRAINT "workspace_sso_settings_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "workspace_sso_settings" ADD CONSTRAINT "workspace_sso_settings_configured_by_user_id_fkey" FOREIGN KEY ("configured_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "sso_identities" ADD CONSTRAINT "sso_identities_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sso_identities" ADD CONSTRAINT "sso_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
