export type EdiDistributor = "SYSCO" | "US_FOODS";

export function isEdiConfigured(distributor: EdiDistributor): boolean {
  if (distributor === "SYSCO") return Boolean(process.env.SYSCO_API_KEY?.trim());
  return Boolean(process.env.USFOODS_API_KEY?.trim());
}

export async function submitEdi850PurchaseOrder(
  userId: string,
  distributor: EdiDistributor,
  po: { orderNumber: string; lines: Array<{ sku: string; quantity: number; unit: string }> },
) {
  if (!isEdiConfigured(distributor)) {
    return {
      ok: false as const,
      message: `Set ${distributor === "SYSCO" ? "SYSCO_API_KEY" : "USFOODS_API_KEY"} for live EDI 850.`,
    };
  }
  return {
    ok: false as const,
    message: `EDI 850 scaffold for ${distributor} — credentials detected for PO ${po.orderNumber}.`,
    userId,
  };
}
