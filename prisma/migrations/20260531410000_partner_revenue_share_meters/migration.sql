-- AlterTable
ALTER TABLE "outbound_webhook_subscriptions" ADD COLUMN "partner_client_id" VARCHAR(128),
ADD COLUMN "partner_installation_id" UUID;

-- CreateIndex
CREATE INDEX "outbound_webhook_subscriptions_partner_installation_id_idx" ON "outbound_webhook_subscriptions"("partner_installation_id");
