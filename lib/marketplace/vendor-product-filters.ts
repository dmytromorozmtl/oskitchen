import type { MarketplaceProductStatus } from "@prisma/client";

export type VendorProductFilters = {
  q?: string;
  status?: MarketplaceProductStatus;
  page: number;
  pageSize: number;
  highlight?: string;
};

const DEFAULT_PAGE_SIZE = 20;

export function parseVendorProductFilters(
  searchParams: Record<string, string | string[] | undefined>,
): VendorProductFilters {
  const statusRaw = pickString(searchParams.status);
  const status = MARKETPLACE_PRODUCT_STATUSES.includes(statusRaw as MarketplaceProductStatus)
    ? (statusRaw as MarketplaceProductStatus)
    : undefined;

  return {
    q: pickString(searchParams.q) || undefined,
    status,
    highlight: pickString(searchParams.highlight) || undefined,
    page: Math.max(1, Number(pickString(searchParams.page) ?? "1") || 1),
    pageSize: DEFAULT_PAGE_SIZE,
  };
}

export const MARKETPLACE_PRODUCT_STATUSES: MarketplaceProductStatus[] = [
  "DRAFT",
  "PENDING_REVIEW",
  "ACTIVE",
  "OUT_OF_STOCK",
  "ARCHIVED",
];

function pickString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function vendorProductStatusLabel(status: MarketplaceProductStatus): string {
  return status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export function vendorProductStatusBadgeVariant(
  status: MarketplaceProductStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "ARCHIVED":
      return "destructive";
    case "PENDING_REVIEW":
      return "secondary";
    case "OUT_OF_STOCK":
      return "outline";
    default:
      return "outline";
  }
}

export function slugifyVendorProduct(name: string, sku: string): string {
  const base = name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const skuPart = sku.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `${base}-${skuPart}`.replace(/-+/g, "-").slice(0, 240);
}
