import { auditLog } from "@/services/audit/audit-service";

export async function auditStorefrontExperimentConcluded(input: {
  userId: string;
  email?: string | null;
  storefrontId: string;
  storeSlug: string;
  outcome: string;
}) {
  await auditLog({
    actor: { userId: input.userId, email: input.email ?? null },
    action: "storefront.experiment.concluded",
    category: "SETTINGS",
    source: "USER",
    entity: { type: "storefront_settings", id: input.storefrontId, label: input.storeSlug },
    metadata: { storeSlug: input.storeSlug, outcome: input.outcome },
  });
}

export async function auditStorefrontExperimentEdgeRetry(input: {
  userId: string;
  email?: string | null;
  storefrontId: string;
  storeSlug: string;
  jobId: string;
}) {
  await auditLog({
    actor: { userId: input.userId, email: input.email ?? null },
    action: "storefront.experiment.edge_retry",
    category: "SETTINGS",
    source: "USER",
    entity: { type: "storefront_edge_sync_job", id: input.jobId, label: input.storeSlug },
    metadata: { storeSlug: input.storeSlug, jobId: input.jobId },
  });
}

export async function auditStorefrontExperimentApplyWinner(input: {
  userId: string;
  email?: string | null;
  storefrontId: string;
  storeSlug: string;
}) {
  await auditLog({
    actor: { userId: input.userId, email: input.email ?? null },
    action: "storefront.experiment.apply_winner",
    category: "SETTINGS",
    source: "USER",
    entity: { type: "storefront_settings", id: input.storefrontId, label: input.storeSlug },
    metadata: { storeSlug: input.storeSlug },
  });
}

export async function auditStorefrontExperimentEdgeDlq(input: {
  storefrontId: string;
  storeSlug: string;
  jobId: string;
  expectedVersion: number;
  attemptCount: number;
  lastError: string | null;
}) {
  await auditLog({
    actor: { userId: null, email: null },
    action: "storefront.experiment.edge_dlq",
    category: "SETTINGS",
    source: "SYSTEM",
    entity: { type: "storefront_edge_sync_job", id: input.jobId, label: input.storeSlug },
    metadata: {
      storeSlug: input.storeSlug,
      expectedVersion: input.expectedVersion,
      attemptCount: input.attemptCount,
      lastError: input.lastError,
    },
  });
}
