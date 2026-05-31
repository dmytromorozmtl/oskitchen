import type { PosConflictResolutionStrategy } from "@/lib/pos/pos-settings";

export type HandheldProduct = {
  id: string;
  title: string;
  price: number;
  category: string;
};

export type HandheldTable = {
  id: string;
  name: string;
  section: string | null;
  capacity: number;
  status: string;
};

export type HandheldTab = {
  id: string;
  name: string;
  tableId: string | null;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
};

export type HandheldCartLine = {
  key: string;
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
};

export type HandheldOrderingBootstrap = {
  registers: Array<{ id: string; name: string; locationId: string | null }>;
  staff: Array<{ id: string; name: string }>;
  products: HandheldProduct[];
  tables: HandheldTable[];
  tabs: HandheldTab[];
  openShiftsByRegisterId: Record<string, { id: string } | null>;
  offlineQueueEnabled: boolean;
  conflictResolution: PosConflictResolutionStrategy;
};

export function groupHandheldProducts(products: HandheldProduct[]): Array<{
  category: string;
  products: HandheldProduct[];
}> {
  const map = new Map<string, HandheldProduct[]>();
  for (const product of products) {
    const category = product.category?.trim() || "Other";
    const bucket = map.get(category) ?? [];
    bucket.push(product);
    map.set(category, bucket);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, rows]) => ({
      category,
      products: rows.sort((a, b) => a.title.localeCompare(b.title)),
    }));
}

export function findOpenTabForTable(tabs: HandheldTab[], tableId: string | null): HandheldTab | null {
  if (!tableId) return null;
  return tabs.find((tab) => tab.tableId === tableId) ?? null;
}

export function handheldCartSubtotal(lines: HandheldCartLine[]): number {
  return Math.round(lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0) * 100) / 100;
}

export function tableStatusTone(status: string): "default" | "secondary" | "outline" {
  switch (status) {
    case "OCCUPIED":
      return "default";
    case "RESERVED":
      return "secondary";
    default:
      return "outline";
  }
}

export const HANDHELD_PWA_SCOPE = "/dashboard/pos/handheld";
