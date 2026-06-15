import type { PurchaseOrderSourceType } from "@prisma/client";

export type PurchaseOrderDraftInput = {
  supplierId: string;
  locationId?: string | null;
  brandId?: string | null;
  demandRunId?: string | null;
  sourceType: PurchaseOrderSourceType;
  lines: {
    ingredientId: string;
    description: string;
    quantity: number;
    unit: string;
    unitCost: number;
    requiredByDate?: Date | null;
    demandRunLineId?: string | null;
    supplierItemId?: string | null;
  }[];
};

export type ReorderQueueDraftLine = {
  ingredientId: string;
  unit: string;
  requiredQuantity: number;
  shortageQuantity: number | null;
  suggestedPurchaseQuantity: number;
  urgency: string;
  requiredByDate: Date;
  sourceType: PurchaseOrderSourceType;
  sourceId?: string | null;
  supplierId?: string | null;
};
