-- Phase N4: Postgres RLS for external auditors (run as superuser / migration).
-- Grants read-only on experiment audit stream only; no workspace PII tables.

-- CREATE ROLE experiment_auditor_readonly NOLOGIN;
-- GRANT CONNECT ON DATABASE kitchenos TO experiment_auditor_readonly;
-- GRANT USAGE ON SCHEMA public TO experiment_auditor_readonly;
-- GRANT SELECT ON storefront_experiment_audit_events TO experiment_auditor_readonly;

ALTER TABLE storefront_experiment_audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS auditor_readonly_select ON storefront_experiment_audit_events;

CREATE POLICY auditor_readonly_select ON storefront_experiment_audit_events
  FOR SELECT
  TO experiment_auditor_readonly
  USING (true);

-- Revoke broad access; auditors use application role + redactAuditorMetadata for JSON fields.
