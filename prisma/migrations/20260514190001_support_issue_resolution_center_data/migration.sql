-- Support & issue resolution center — phase 2: runs after phase 1 commits (safe to use new enum labels).

UPDATE "support_tickets" SET "status" = 'IN_PROGRESS' WHERE "status" = 'OPEN';
UPDATE "support_tickets" SET "status" = 'WAITING_ON_CUSTOMER' WHERE "status" = 'WAITING';

ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "requester_name" VARCHAR(255);
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "severity" "SupportTicketSeverity" NOT NULL DEFAULT 'MODERATE';
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "source" "SupportTicketSource" NOT NULL DEFAULT 'DASHBOARD';
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "assigned_to_id" UUID;
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "partner_account_id" UUID;
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "related_entity_type" VARCHAR(80);
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "related_entity_id" VARCHAR(255);
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "module_key" VARCHAR(80);
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "browser_info_json" JSONB;
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "diagnostics_consent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "attachments_json" JSONB;
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "tags_json" JSONB;
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "sla_due_at" TIMESTAMP(3);
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "first_response_at" TIMESTAMP(3);
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "resolution_summary" TEXT;
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "resolved_at" TIMESTAMP(3);
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "closed_at" TIMESTAMP(3);
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "escalated_at" TIMESTAMP(3);
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "last_customer_reply_at" TIMESTAMP(3);
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "last_staff_reply_at" TIMESTAMP(3);

DO $$ BEGIN
  ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_partner_account_id_fkey" FOREIGN KEY ("partner_account_id") REFERENCES "partner_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "support_tickets_workspace_id_status_idx" ON "support_tickets"("workspace_id", "status");
CREATE INDEX IF NOT EXISTS "support_tickets_workspace_id_created_at_idx" ON "support_tickets"("workspace_id", "created_at");
CREATE INDEX IF NOT EXISTS "support_tickets_priority_idx" ON "support_tickets"("priority");
CREATE INDEX IF NOT EXISTS "support_tickets_severity_idx" ON "support_tickets"("severity");
CREATE INDEX IF NOT EXISTS "support_tickets_assigned_to_id_idx" ON "support_tickets"("assigned_to_id");
CREATE INDEX IF NOT EXISTS "support_tickets_sla_due_at_idx" ON "support_tickets"("sla_due_at");
CREATE INDEX IF NOT EXISTS "support_tickets_related_entity_idx" ON "support_tickets"("related_entity_type", "related_entity_id");
CREATE INDEX IF NOT EXISTS "support_tickets_partner_account_id_idx" ON "support_tickets"("partner_account_id");

CREATE TABLE IF NOT EXISTS "support_ticket_comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ticket_id" UUID NOT NULL,
    "author_user_id" UUID,
    "author_staff_id" UUID,
    "author_type" "SupportCommentAuthorType" NOT NULL,
    "visibility" "SupportCommentVisibility" NOT NULL DEFAULT 'CUSTOMER',
    "message" TEXT NOT NULL,
    "attachments_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "support_ticket_comments_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "support_ticket_comments" ADD CONSTRAINT "support_ticket_comments_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "support_ticket_comments" ADD CONSTRAINT "support_ticket_comments_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "support_ticket_comments" ADD CONSTRAINT "support_ticket_comments_author_staff_id_fkey" FOREIGN KEY ("author_staff_id") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "support_ticket_comments_ticket_id_created_at_idx" ON "support_ticket_comments"("ticket_id", "created_at");
CREATE INDEX IF NOT EXISTS "support_ticket_comments_visibility_idx" ON "support_ticket_comments"("visibility");

CREATE TABLE IF NOT EXISTS "support_ticket_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ticket_id" UUID NOT NULL,
    "event_type" "SupportTicketEventType" NOT NULL,
    "performed_by_id" UUID,
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "support_ticket_events_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "support_ticket_events" ADD CONSTRAINT "support_ticket_events_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "support_ticket_events" ADD CONSTRAINT "support_ticket_events_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "support_ticket_events_ticket_id_created_at_idx" ON "support_ticket_events"("ticket_id", "created_at");
CREATE INDEX IF NOT EXISTS "support_ticket_events_event_type_idx" ON "support_ticket_events"("event_type");

CREATE TABLE IF NOT EXISTS "support_sla_policies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID,
    "category" "SupportTicketCategory",
    "priority" "SupportTicketPriority",
    "first_response_minutes" INTEGER NOT NULL,
    "resolution_minutes" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "support_sla_policies_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "support_sla_policies" ADD CONSTRAINT "support_sla_policies_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "support_sla_policies_workspace_id_active_idx" ON "support_sla_policies"("workspace_id", "active");
CREATE INDEX IF NOT EXISTS "support_sla_policies_category_priority_idx" ON "support_sla_policies"("category", "priority");

CREATE TABLE IF NOT EXISTS "support_saved_views" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "workspace_id" UUID,
    "name" VARCHAR(120) NOT NULL,
    "filters_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "support_saved_views_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "support_saved_views" ADD CONSTRAINT "support_saved_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "support_saved_views" ADD CONSTRAINT "support_saved_views_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "support_saved_views_user_id_idx" ON "support_saved_views"("user_id");
CREATE INDEX IF NOT EXISTS "support_saved_views_workspace_id_idx" ON "support_saved_views"("workspace_id");

CREATE TABLE IF NOT EXISTS "support_macros" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID,
    "title" VARCHAR(160) NOT NULL,
    "category" "SupportTicketCategory",
    "response_template" TEXT NOT NULL,
    "internal_only" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "support_macros_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "support_macros" ADD CONSTRAINT "support_macros_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "support_macros_workspace_id_active_idx" ON "support_macros"("workspace_id", "active");

INSERT INTO "support_sla_policies" ("id","workspace_id","category","priority","first_response_minutes","resolution_minutes","active","created_at","updated_at")
SELECT gen_random_uuid(), NULL, NULL, 'CRITICAL'::"SupportTicketPriority", 60, 1440, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "support_sla_policies" s WHERE s.workspace_id IS NULL AND s.category IS NULL AND s.priority = 'CRITICAL'::"SupportTicketPriority");

INSERT INTO "support_sla_policies" ("id","workspace_id","category","priority","first_response_minutes","resolution_minutes","active","created_at","updated_at")
SELECT gen_random_uuid(), NULL, NULL, 'URGENT'::"SupportTicketPriority", 240, 2880, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "support_sla_policies" s WHERE s.workspace_id IS NULL AND s.category IS NULL AND s.priority = 'URGENT'::"SupportTicketPriority");

INSERT INTO "support_sla_policies" ("id","workspace_id","category","priority","first_response_minutes","resolution_minutes","active","created_at","updated_at")
SELECT gen_random_uuid(), NULL, NULL, 'HIGH'::"SupportTicketPriority", 480, 4320, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "support_sla_policies" s WHERE s.workspace_id IS NULL AND s.category IS NULL AND s.priority = 'HIGH'::"SupportTicketPriority");

INSERT INTO "support_sla_policies" ("id","workspace_id","category","priority","first_response_minutes","resolution_minutes","active","created_at","updated_at")
SELECT gen_random_uuid(), NULL, NULL, 'MEDIUM'::"SupportTicketPriority", 1440, 2400, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "support_sla_policies" s WHERE s.workspace_id IS NULL AND s.category IS NULL AND s.priority = 'MEDIUM'::"SupportTicketPriority");

INSERT INTO "support_sla_policies" ("id","workspace_id","category","priority","first_response_minutes","resolution_minutes","active","created_at","updated_at")
SELECT gen_random_uuid(), NULL, NULL, 'LOW'::"SupportTicketPriority", 2880, 10080, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "support_sla_policies" s WHERE s.workspace_id IS NULL AND s.category IS NULL AND s.priority = 'LOW'::"SupportTicketPriority");

INSERT INTO "support_macros" ("id","workspace_id","title","category","response_template","internal_only","active","created_at","updated_at")
SELECT gen_random_uuid(), NULL, v.title, NULL, v.body, v.internal, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
  ('Stripe not configured', 'Billing automation requires Stripe keys in the deployment environment. Configure `STRIPE_SECRET_KEY` and related billing env vars, then retry checkout or portal.', false),
  ('Resend not configured', 'Outbound email is optional. Tickets are stored and visible in Support. Configure Resend + `GROWTH_NOTIFY_EMAIL` or support recipient when ready — we do not simulate sends.', false),
  ('Product mapping issue', 'Please share the channel, SKU or external ID, and a sample of the mapping screen. If import-related, attach the batch id from Import Center.', false),
  ('Import CSV validation', 'Share the template type, row count, and first error line from Import Center. Do not paste secrets or full customer PII — redact as needed.', false),
  ('Supabase migration', 'If this is a deployment error, capture the migration name and error text from CI or `prisma migrate deploy`. Never paste database passwords.', true),
  ('Sales channel webhook', 'Include channel name, recent webhook delivery status, and correlation id if shown in Integration Health.', false),
  ('Billing portal issue', 'Confirm which workspace and whether the user reached the Stripe portal or an in-app billing screen. Include approximate time (UTC).', false),
  ('Go-live blocker', 'List the checklist item blocked, owner, and whether this is data, training, or integration dependent.', false)
) AS v(title, body, internal)
WHERE NOT EXISTS (SELECT 1 FROM "support_macros" m WHERE m.workspace_id IS NULL AND m.title = v.title);
