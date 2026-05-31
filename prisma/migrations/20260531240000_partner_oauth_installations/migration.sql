-- Partner OAuth app installations (App Marketplace Phase 3)

CREATE TYPE "PartnerAppInstallationStatus" AS ENUM ('ACTIVE', 'REVOKED');

CREATE TABLE "partner_app_installations" (
    "id" UUID NOT NULL,
    "client_id" VARCHAR(128) NOT NULL,
    "user_id" UUID NOT NULL,
    "workspace_id" UUID,
    "installed_by_user_id" UUID NOT NULL,
    "scopes_granted" TEXT[],
    "access_token_hash" VARCHAR(128) NOT NULL,
    "token_prefix" VARCHAR(16) NOT NULL,
    "status" "PartnerAppInstallationStatus" NOT NULL DEFAULT 'ACTIVE',
    "installed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_app_installations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "oauth_authorization_codes" (
    "id" UUID NOT NULL,
    "code_hash" VARCHAR(128) NOT NULL,
    "client_id" VARCHAR(128) NOT NULL,
    "user_id" UUID NOT NULL,
    "workspace_id" UUID,
    "installed_by_user_id" UUID NOT NULL,
    "scopes" TEXT[],
    "redirect_uri" TEXT NOT NULL,
    "state" VARCHAR(512),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oauth_authorization_codes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "partner_app_installations_access_token_hash_key" ON "partner_app_installations"("access_token_hash");
CREATE UNIQUE INDEX "partner_app_installations_workspace_id_client_id_key" ON "partner_app_installations"("workspace_id", "client_id");
CREATE INDEX "partner_app_installations_user_id_idx" ON "partner_app_installations"("user_id");
CREATE INDEX "partner_app_installations_client_id_idx" ON "partner_app_installations"("client_id");
CREATE INDEX "partner_app_installations_status_idx" ON "partner_app_installations"("status");

CREATE UNIQUE INDEX "oauth_authorization_codes_code_hash_key" ON "oauth_authorization_codes"("code_hash");
CREATE INDEX "oauth_authorization_codes_client_id_expires_at_idx" ON "oauth_authorization_codes"("client_id", "expires_at");
CREATE INDEX "oauth_authorization_codes_user_id_idx" ON "oauth_authorization_codes"("user_id");

ALTER TABLE "partner_app_installations" ADD CONSTRAINT "partner_app_installations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "partner_app_installations" ADD CONSTRAINT "partner_app_installations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "partner_app_installations" ADD CONSTRAINT "partner_app_installations_installed_by_user_id_fkey" FOREIGN KEY ("installed_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "oauth_authorization_codes" ADD CONSTRAINT "oauth_authorization_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "oauth_authorization_codes" ADD CONSTRAINT "oauth_authorization_codes_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
