-- CreateTable
CREATE TABLE "cron_execution_heartbeats" (
    "slug" VARCHAR(120) NOT NULL,
    "production_tier" BOOLEAN NOT NULL DEFAULT false,
    "last_started_at" TIMESTAMP(3),
    "last_succeeded_at" TIMESTAMP(3),
    "last_failed_at" TIMESTAMP(3),
    "last_duration_ms" INTEGER,
    "last_status_code" INTEGER,
    "consecutive_failures" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cron_execution_heartbeats_pkey" PRIMARY KEY ("slug")
);

-- CreateIndex
CREATE INDEX "cron_execution_heartbeats_production_tier_last_succeeded_at_idx"
ON "cron_execution_heartbeats"("production_tier", "last_succeeded_at");

-- CreateIndex
CREATE INDEX "cron_execution_heartbeats_production_tier_last_failed_at_idx"
ON "cron_execution_heartbeats"("production_tier", "last_failed_at");

-- Seed production allowlist rows so readiness can track first-run grace windows.
INSERT INTO "cron_execution_heartbeats" ("slug", "production_tier", "created_at", "updated_at")
VALUES
    ('webhook-jobs', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('reminders', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('storefront-domain-recheck', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('storefront-cart-recovery', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('storefront-theme-publish', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('storefront-team-invite-reminders', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('storefront-webhook-retention', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('storefront-invite-audit-retention', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('storefront-ga4-parity', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('storefront-edge-sync', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('pilot-daily-health', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('meal-plan-auto-renew', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('menu-rotation', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('doordash-sync', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kds-overdue-alerts', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
