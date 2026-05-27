import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import { auditLog, resolveWorkspaceIdForOwner } from "@/services/audit/audit-service";

export async function logStorefrontPaymentFailedWorkspaceAudit(input: {
  merchantUserId: string;
  storefrontOrderId: string;
  publicToken?: string | null;
  phase: string;
  reason: string;
}): Promise<void> {
  const workspaceId = await resolveWorkspaceIdForOwner(input.merchantUserId);
  if (!workspaceId) return;

  await auditLog({
    workspaceId,
    actor: { userId: input.merchantUserId, role: "storefront_guest" },
    action: AUDIT_ACTIONS.STOREFRONT_PAYMENT_FAILED,
    category: "ORDERS",
    source: "SYSTEM",
    severity: "WARNING",
    entity: {
      type: "StorefrontOrder",
      id: input.storefrontOrderId,
      label: "Storefront payment failed",
    },
    metadata: {
      phase: input.phase,
      reason: input.reason,
      publicToken: input.publicToken ?? undefined,
    },
    maskPiiInMetadata: true,
  });
}

export async function logStorefrontPaymentRetryWorkspaceAudit(input: {
  merchantUserId: string;
  storefrontOrderId: string;
  publicToken?: string | null;
  paymentStatusBefore: string;
}): Promise<void> {
  const workspaceId = await resolveWorkspaceIdForOwner(input.merchantUserId);
  if (!workspaceId) return;

  await auditLog({
    workspaceId,
    actor: { userId: input.merchantUserId, role: "storefront_guest" },
    action: AUDIT_ACTIONS.STOREFRONT_PAYMENT_RETRY_STARTED,
    category: "ORDERS",
    source: "SYSTEM",
    severity: "INFO",
    entity: {
      type: "StorefrontOrder",
      id: input.storefrontOrderId,
      label: "Storefront payment retry",
    },
    metadata: {
      paymentStatusBefore: input.paymentStatusBefore,
      publicToken: input.publicToken ?? undefined,
    },
    maskPiiInMetadata: true,
  });
}
