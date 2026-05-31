-- CreateTable
CREATE TABLE "capital_lender_oauth_grants" (
    "id" UUID NOT NULL,
    "referral_id" UUID NOT NULL,
    "installation_id" UUID NOT NULL,
    "partner_slug" VARCHAR(80) NOT NULL,
    "workspace_id" UUID NOT NULL,
    "scopes_granted" TEXT[],
    "revoked_at" TIMESTAMP(3),
    "last_access_at" TIMESTAMP(3),
    "access_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capital_lender_oauth_grants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "capital_lender_oauth_grants_referral_id_key" ON "capital_lender_oauth_grants"("referral_id");

-- CreateIndex
CREATE INDEX "capital_lender_oauth_grants_installation_id_idx" ON "capital_lender_oauth_grants"("installation_id");

-- CreateIndex
CREATE INDEX "capital_lender_oauth_grants_partner_slug_workspace_id_idx" ON "capital_lender_oauth_grants"("partner_slug", "workspace_id");

-- CreateIndex
CREATE INDEX "capital_lender_oauth_grants_workspace_id_created_at_idx" ON "capital_lender_oauth_grants"("workspace_id", "created_at");

-- AddForeignKey
ALTER TABLE "capital_lender_oauth_grants" ADD CONSTRAINT "capital_lender_oauth_grants_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "capital_partner_referrals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capital_lender_oauth_grants" ADD CONSTRAINT "capital_lender_oauth_grants_installation_id_fkey" FOREIGN KEY ("installation_id") REFERENCES "partner_app_installations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capital_lender_oauth_grants" ADD CONSTRAINT "capital_lender_oauth_grants_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
