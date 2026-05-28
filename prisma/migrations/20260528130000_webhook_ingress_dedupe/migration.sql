-- Era 16 Cycle 7: ingress dedupe for platform/bearer webhook routes (Uber Direct, Slack).

CREATE TABLE "webhook_ingress_dedupe" (
    "id" UUID NOT NULL,
    "route_key" VARCHAR(120) NOT NULL,
    "external_event_id" VARCHAR(512) NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_ingress_dedupe_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "webhook_ingress_dedupe_route_key_external_event_id_key" ON "webhook_ingress_dedupe"("route_key", "external_event_id");

CREATE INDEX "webhook_ingress_dedupe_route_key_received_at_idx" ON "webhook_ingress_dedupe"("route_key", "received_at");
