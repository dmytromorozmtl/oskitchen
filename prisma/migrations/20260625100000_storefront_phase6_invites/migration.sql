-- Phase 6: dedicated storefront team invites
CREATE TABLE IF NOT EXISTS "storefront_team_invites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "storefront_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" "WorkspaceMemberRole" NOT NULL DEFAULT 'STAFF',
    "token" VARCHAR(64) NOT NULL,
    "invited_by_user_id" UUID NOT NULL,
    "invited_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMPTZ,
    "accepted_user_id" UUID,
    "last_reminder_at" TIMESTAMPTZ,
    "expires_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "storefront_team_invites_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "storefront_team_invites_token_key" ON "storefront_team_invites"("token");
CREATE INDEX IF NOT EXISTS "storefront_team_invites_storefront_id_idx" ON "storefront_team_invites"("storefront_id");
CREATE INDEX IF NOT EXISTS "storefront_team_invites_workspace_id_idx" ON "storefront_team_invites"("workspace_id");
CREATE INDEX IF NOT EXISTS "storefront_team_invites_email_idx" ON "storefront_team_invites"("email");

DO $$ BEGIN
  ALTER TABLE "storefront_team_invites" ADD CONSTRAINT "storefront_team_invites_storefront_id_fkey"
    FOREIGN KEY ("storefront_id") REFERENCES "storefront_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "storefront_team_invites" ADD CONSTRAINT "storefront_team_invites_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "storefront_team_invites" ADD CONSTRAINT "storefront_team_invites_invited_by_user_id_fkey"
    FOREIGN KEY ("invited_by_user_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "storefront_team_invites" ADD CONSTRAINT "storefront_team_invites_accepted_user_id_fkey"
    FOREIGN KEY ("accepted_user_id") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
