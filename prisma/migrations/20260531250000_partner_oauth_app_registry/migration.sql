-- Partner OAuth app registry + review pipeline (App Marketplace Phase 4)

CREATE TYPE "PartnerOAuthAppRegistryStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'SANDBOX', 'SUSPENDED');

CREATE TABLE "partner_oauth_app_registry" (
    "id" UUID NOT NULL,
    "client_id" VARCHAR(128) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "publisher" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "PartnerOAuthAppRegistryStatus" NOT NULL DEFAULT 'DRAFT',
    "redirect_uris" TEXT[],
    "allowed_scopes" TEXT[],
    "embed_url" TEXT,
    "embed_origins" TEXT[],
    "honesty_note" TEXT,
    "review_notes" TEXT,
    "checklist_json" JSONB,
    "submitted_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by_user_id" UUID,
    "contact_email" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_oauth_app_registry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "partner_oauth_app_registry_client_id_key" ON "partner_oauth_app_registry"("client_id");
CREATE INDEX "partner_oauth_app_registry_status_submitted_at_idx" ON "partner_oauth_app_registry"("status", "submitted_at");

ALTER TABLE "partner_oauth_app_registry" ADD CONSTRAINT "partner_oauth_app_registry_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
