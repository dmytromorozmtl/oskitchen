-- Restaurant Capital Phase 2 — signed revenue attestation exports

CREATE TABLE "revenue_attestations" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "payload_json" JSONB NOT NULL,
    "signature" VARCHAR(128) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revenue_attestations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "revenue_attestations_workspace_id_created_at_idx" ON "revenue_attestations"("workspace_id", "created_at");
CREATE INDEX "revenue_attestations_user_id_created_at_idx" ON "revenue_attestations"("user_id", "created_at");
CREATE INDEX "revenue_attestations_expires_at_idx" ON "revenue_attestations"("expires_at");

ALTER TABLE "revenue_attestations" ADD CONSTRAINT "revenue_attestations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "revenue_attestations" ADD CONSTRAINT "revenue_attestations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
