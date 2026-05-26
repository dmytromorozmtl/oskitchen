-- Phase 8 — Supabase RLS templates for storefront multi-tenant tables.
-- Apply in Supabase SQL editor when using Supabase Auth + direct client access.
-- App server (Prisma service role) bypasses RLS; these policies protect anon/authenticated clients.

ALTER TABLE storefront_team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE storefront_team_invite_events ENABLE ROW LEVEL SECURITY;

-- Invites: invitee can read own pending row by token (via RPC); owners/staff via workspace membership.
DROP POLICY IF EXISTS storefront_invites_workspace_member_select ON storefront_team_invites;
CREATE POLICY storefront_invites_workspace_member_select ON storefront_team_invites
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = storefront_team_invites.workspace_id
        AND wm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS storefront_invite_events_workspace_member_select ON storefront_team_invite_events;
CREATE POLICY storefront_invite_events_workspace_member_select ON storefront_team_invite_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = storefront_team_invite_events.workspace_id
        AND wm.user_id = auth.uid()
    )
  );

-- Service role (Prisma) should use connection that bypasses RLS or use SECURITY DEFINER RPCs for admin writes.
