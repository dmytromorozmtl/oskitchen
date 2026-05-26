-- Phase 7b — team invite audit log (requires storefront_team_invites from phase 6)

CREATE TABLE IF NOT EXISTS storefront_team_invite_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_id UUID REFERENCES storefront_team_invites(id) ON DELETE SET NULL,
  storefront_id UUID NOT NULL REFERENCES storefront_settings(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  event_type VARCHAR(32) NOT NULL,
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  target_email VARCHAR(255),
  metadata_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS storefront_team_invite_events_storefront_idx
  ON storefront_team_invite_events(storefront_id);

CREATE INDEX IF NOT EXISTS storefront_team_invite_events_invite_idx
  ON storefront_team_invite_events(invite_id);
