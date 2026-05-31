-- Outbound webhook subscriptions (App Marketplace Phase 2)

CREATE TYPE "OutboundWebhookDeliveryStatus" AS ENUM ('QUEUED', 'DELIVERING', 'SUCCEEDED', 'FAILED', 'DEAD');

CREATE TABLE "outbound_webhook_subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "workspace_id" UUID,
    "name" VARCHAR(255) NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT[],
    "secret_encrypted" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_delivery_at" TIMESTAMP(3),
    "last_success_at" TIMESTAMP(3),
    "last_failure_at" TIMESTAMP(3),
    "consecutive_failures" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "outbound_webhook_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "outbound_webhook_deliveries" (
    "id" UUID NOT NULL,
    "subscription_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "workspace_id" UUID,
    "event_type" VARCHAR(128) NOT NULL,
    "payload_json" JSONB NOT NULL,
    "status" "OutboundWebhookDeliveryStatus" NOT NULL DEFAULT 'QUEUED',
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 8,
    "next_attempt_at" TIMESTAMP(3),
    "http_status" INTEGER,
    "response_snippet" TEXT,
    "last_error" TEXT,
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outbound_webhook_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "outbound_webhook_subscriptions_user_id_idx" ON "outbound_webhook_subscriptions"("user_id");
CREATE INDEX "outbound_webhook_subscriptions_workspace_id_idx" ON "outbound_webhook_subscriptions"("workspace_id");
CREATE INDEX "outbound_webhook_subscriptions_workspace_id_active_idx" ON "outbound_webhook_subscriptions"("workspace_id", "active");

CREATE INDEX "outbound_webhook_deliveries_status_next_attempt_at_idx" ON "outbound_webhook_deliveries"("status", "next_attempt_at");
CREATE INDEX "outbound_webhook_deliveries_subscription_id_created_at_idx" ON "outbound_webhook_deliveries"("subscription_id", "created_at");
CREATE INDEX "outbound_webhook_deliveries_user_id_created_at_idx" ON "outbound_webhook_deliveries"("user_id", "created_at");

ALTER TABLE "outbound_webhook_subscriptions" ADD CONSTRAINT "outbound_webhook_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "outbound_webhook_subscriptions" ADD CONSTRAINT "outbound_webhook_subscriptions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "outbound_webhook_deliveries" ADD CONSTRAINT "outbound_webhook_deliveries_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "outbound_webhook_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "outbound_webhook_deliveries" ADD CONSTRAINT "outbound_webhook_deliveries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "outbound_webhook_deliveries" ADD CONSTRAINT "outbound_webhook_deliveries_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
