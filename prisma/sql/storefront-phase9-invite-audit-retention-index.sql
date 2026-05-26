-- Phase 9: speed up 90-day invite audit retention purge (optional; safe to re-run).
CREATE INDEX IF NOT EXISTS idx_storefront_team_invite_events_created_at
  ON storefront_team_invite_events (created_at);
