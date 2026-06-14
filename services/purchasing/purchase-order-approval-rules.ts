export interface ApprovalRule {
  minAmount: number;
  requiredApprovers: number;
  allowedRoles: string[];
}

export const DEFAULT_APPROVAL_RULES: ApprovalRule[] = [
  { minAmount: 0, requiredApprovers: 1, allowedRoles: ["owner", "admin", "manager"] },
  { minAmount: 500, requiredApprovers: 1, allowedRoles: ["owner", "admin"] },
  { minAmount: 2000, requiredApprovers: 2, allowedRoles: ["owner", "admin"] },
  { minAmount: 10000, requiredApprovers: 2, allowedRoles: ["owner"] },
];

export function getApprovalRule(amount: number): ApprovalRule {
  return (
    [...DEFAULT_APPROVAL_RULES]
      .reverse()
      .find((rule) => amount >= rule.minAmount) ?? DEFAULT_APPROVAL_RULES[0]!
  );
}

export function canUserApprove(role: string | null | undefined, amount: number): boolean {
  const rule = getApprovalRule(amount);
  const normalized = (role ?? "manager").toLowerCase();
  return rule.allowedRoles.includes(normalized);
}

export async function getPurchaseOrderApprovalStatus(
  purchaseOrderId: string,
  total: number,
) {
  const { prisma } = await import("@/lib/prisma");
  const events = await prisma.purchaseApprovalEvent.findMany({
    where: { purchaseOrderId, action: "APPROVED" },
    include: { performedBy: { select: { id: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });
  const rule = getApprovalRule(total);
  const approvals = events.length;
  const remaining = Math.max(0, rule.requiredApprovers - approvals);

  return {
    rule,
    approvals,
    remaining,
    approvedBy: events.map((e) => e.performedBy?.email ?? "Unknown"),
    isFullyApproved: approvals >= rule.requiredApprovers,
  };
}
