-- Phase 6 — storefront team invites (idempotent)
-- Note: UserProfile maps to table "users" in Prisma (not user_profiles).

CREATE TABLE IF NOT EXISTS storefront_team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storefront_id UUID NOT NULL REFERENCES storefront_settings(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'STAFF',
  token VARCHAR(64) NOT NULL,
  invited_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  accepted_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  last_reminder_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS storefront_team_invites_token_key ON storefront_team_invites(token);

CREATE UNIQUE INDEX IF NOT EXISTS storefront_team_invites_workspace_email_key
  ON storefront_team_invites(workspace_id, lower(email));

CREATE INDEX IF NOT EXISTS storefront_team_invites_email_idx
  ON storefront_team_invites(lower(email));

CREATE INDEX IF NOT EXISTS storefront_team_invites_storefront_pending_idx
  ON storefront_team_invites(storefront_id) WHERE accepted_at IS NULL;
