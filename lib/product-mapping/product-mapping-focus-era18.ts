import type { ProductMappingConfidence, ProductMappingStatus } from "@prisma/client";

import { isBulkApprovable } from "@/lib/product-mapping/matching-confidence";
import {
  ORDER_HUB_FAILED_ROUTE,
  PRODUCT_MAPPING_CONFLICTS_ROUTE,
  PRODUCT_MAPPING_DUPLICATE_EXTERNAL_ANCHOR,
  PRODUCT_MAPPING_DUPLICATE_INTERNAL_ANCHOR,
  PRODUCT_MAPPING_EXPLICIT_CONFLICTS_ANCHOR,
  PRODUCT_MAPPING_ORDER_HUB_CONFLICTS_ANCHOR,
  PRODUCT_MAPPING_SUGGESTIONS_ROUTE,
  PRODUCT_MAPPING_UNMAPPED_ROUTE,
} from "@/lib/product-mapping/product-mapping-focus-era18-policy";

export type ProductMappingFocusSnapshot = {
  unmapped: number;
  suggested: number;
  needsReview: number;
  conflicts: number;
  blockedOrderLines: number;
  highConfidenceSuggested: number;
};

export type ProductMappingAttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
  tone: "urgent" | "normal";
};

export type ProductMappingFocusRow = {
  id: string;
  status: ProductMappingStatus;
  confidenceLabel: ProductMappingConfidence;
  hasCandidate: boolean;
};

export type ProductMappingRowNextAction = {
  label: string;
  href: string;
  tone: "urgent" | "normal";
};

export type ProductMappingConflictsFocusSnapshot = {
  explicitConflictCount: number;
  duplicateInternalGroupCount: number;
  duplicateExternalGroupCount: number;
  blockedOrderLines: number;
};

export type ChannelMappingConflictFocusRow = {
  id: string;
  recordId: string | null;
};

export function productMappingAnchor(mappingId: string): string {
  return `#mapping-${mappingId}`;
}

export function buildProductMappingFocusSnapshot(input: {
  unmapped: number;
  suggested: number;
  needsReview: number;
  conflicts: number;
  blockedOrderLines: number;
  highConfidenceSuggested: number;
}): ProductMappingFocusSnapshot {
  return {
    unmapped: input.unmapped,
    suggested: input.suggested,
    needsReview: input.needsReview,
    conflicts: input.conflicts,
    blockedOrderLines: input.blockedOrderLines,
    highConfidenceSuggested: input.highConfidenceSuggested,
  };
}

export function summarizeProductMappingFocus(snapshot: ProductMappingFocusSnapshot): {
  totalSignals: number;
  hasUrgent: boolean;
} {
  const totalSignals =
    snapshot.unmapped +
    snapshot.suggested +
    snapshot.needsReview +
    snapshot.conflicts +
    snapshot.blockedOrderLines;

  const hasUrgent =
    snapshot.blockedOrderLines > 0 ||
    snapshot.conflicts > 0 ||
    snapshot.unmapped > 0 ||
    snapshot.needsReview > 0;

  return { totalSignals, hasUrgent };
}

/** Catalog mapping categories — blocked orders and conflicts before bulk suggestions. */
export function pickProductMappingAttentionItems(
  snapshot: ProductMappingFocusSnapshot,
): ProductMappingAttentionItem[] {
  const items: ProductMappingAttentionItem[] = [];

  if (snapshot.blockedOrderLines > 0) {
    items.push({
      id: "blocked-order-lines",
      title: `${snapshot.blockedOrderLines} order line${snapshot.blockedOrderLines === 1 ? "" : "s"} blocked by missing mapping`,
      detail: "Channel imports cannot resolve menu targets — map SKUs before the next sync window.",
      href: PRODUCT_MAPPING_UNMAPPED_ROUTE,
      priority: 1,
      tone: "urgent",
    });
  }

  if (snapshot.conflicts > 0) {
    items.push({
      id: "mapping-conflicts",
      title: `${snapshot.conflicts} mapping conflict${snapshot.conflicts === 1 ? "" : "s"}`,
      detail: "Duplicate or incompatible targets — resolve before approving channel catalog rows.",
      href: PRODUCT_MAPPING_CONFLICTS_ROUTE,
      priority: 2,
      tone: "urgent",
    });
  }

  if (snapshot.unmapped > 0) {
    items.push({
      id: "unmapped-catalog",
      title: `${snapshot.unmapped} unmapped external product${snapshot.unmapped === 1 ? "" : "s"}`,
      detail: "No KitchenOS menu target — pick candidates from the unmapped queue.",
      href: PRODUCT_MAPPING_UNMAPPED_ROUTE,
      priority: 3,
      tone: "urgent",
    });
  }

  if (snapshot.needsReview > 0) {
    items.push({
      id: "needs-review",
      title: `${snapshot.needsReview} mapping${snapshot.needsReview === 1 ? "" : "s"} need review`,
      detail: "Low-confidence matches require operator verification before approval.",
      href: PRODUCT_MAPPING_UNMAPPED_ROUTE,
      priority: 4,
      tone: "normal",
    });
  }

  if (snapshot.highConfidenceSuggested > 0) {
    items.push({
      id: "high-confidence-suggested",
      title: `${snapshot.highConfidenceSuggested} high-confidence suggestion${snapshot.highConfidenceSuggested === 1 ? "" : "s"}`,
      detail: "Exact SKU or high match — verify once, then approve to unblock imports.",
      href: PRODUCT_MAPPING_SUGGESTIONS_ROUTE,
      priority: 5,
      tone: "normal",
    });
  } else if (snapshot.suggested > 0) {
    items.push({
      id: "suggested-mappings",
      title: `${snapshot.suggested} suggested mapping${snapshot.suggested === 1 ? "" : "s"}`,
      detail: "Review matcher output before approving — never bulk-approve below HIGH confidence.",
      href: PRODUCT_MAPPING_SUGGESTIONS_ROUTE,
      priority: 6,
      tone: "normal",
    });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

export function buildProductMappingConflictsFocusSnapshot(input: {
  explicitConflictCount: number;
  duplicateInternalGroupCount: number;
  duplicateExternalGroupCount: number;
  blockedOrderLines: number;
}): ProductMappingConflictsFocusSnapshot {
  return {
    explicitConflictCount: input.explicitConflictCount,
    duplicateInternalGroupCount: input.duplicateInternalGroupCount,
    duplicateExternalGroupCount: input.duplicateExternalGroupCount,
    blockedOrderLines: input.blockedOrderLines,
  };
}

/** Conflicts page categories — blocked orders and explicit flags before duplicate groups. */
export function pickProductMappingConflictsAttentionItems(
  snapshot: ProductMappingConflictsFocusSnapshot,
): ProductMappingAttentionItem[] {
  const items: ProductMappingAttentionItem[] = [];

  if (snapshot.blockedOrderLines > 0) {
    items.push({
      id: "blocked-order-lines",
      title: `${snapshot.blockedOrderLines} order line${snapshot.blockedOrderLines === 1 ? "" : "s"} blocked by missing mapping`,
      detail: "Resolve catalog mapping, then reprocess failed channel orders in order hub.",
      href: `${PRODUCT_MAPPING_CONFLICTS_ROUTE}${PRODUCT_MAPPING_ORDER_HUB_CONFLICTS_ANCHOR}`,
      priority: 1,
      tone: "urgent",
    });
  }

  if (snapshot.explicitConflictCount > 0) {
    items.push({
      id: "explicit-conflicts",
      title: `${snapshot.explicitConflictCount} explicit mapping conflict${snapshot.explicitConflictCount === 1 ? "" : "s"}`,
      detail: "Rows flagged CONFLICT — pick a single KitchenOS target or reject duplicates.",
      href: `${PRODUCT_MAPPING_CONFLICTS_ROUTE}${PRODUCT_MAPPING_EXPLICIT_CONFLICTS_ANCHOR}`,
      priority: 2,
      tone: "urgent",
    });
  }

  if (snapshot.duplicateExternalGroupCount > 0) {
    items.push({
      id: "duplicate-external",
      title: `${snapshot.duplicateExternalGroupCount} duplicate external product group${snapshot.duplicateExternalGroupCount === 1 ? "" : "s"}`,
      detail: "Same external id mapped more than once — archive or reject older rows.",
      href: `${PRODUCT_MAPPING_CONFLICTS_ROUTE}${PRODUCT_MAPPING_DUPLICATE_EXTERNAL_ANCHOR}`,
      priority: 3,
      tone: "normal",
    });
  }

  if (snapshot.duplicateInternalGroupCount > 0) {
    items.push({
      id: "duplicate-internal",
      title: `${snapshot.duplicateInternalGroupCount} duplicate KitchenOS target group${snapshot.duplicateInternalGroupCount === 1 ? "" : "s"}`,
      detail: "Multiple externals share one menu item — confirm this is intentional for your channels.",
      href: `${PRODUCT_MAPPING_CONFLICTS_ROUTE}${PRODUCT_MAPPING_DUPLICATE_INTERNAL_ANCHOR}`,
      priority: 4,
      tone: "normal",
    });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

/** Per-row next action for workbench and unmapped queue lists. */
export function resolveProductMappingRowNextAction(
  row: ProductMappingFocusRow,
  basePath = "/dashboard/product-mapping",
): ProductMappingRowNextAction | null {
  const anchor = `${basePath}${productMappingAnchor(row.id)}`;

  if (row.status === "CONFLICT") {
    return {
      label: "Resolve conflict",
      href: `${PRODUCT_MAPPING_CONFLICTS_ROUTE}${productMappingAnchor(row.id)}`,
      tone: "urgent",
    };
  }

  if (row.status === "UNMAPPED" && !row.hasCandidate) {
    return {
      label: "Pick menu target",
      href: anchor,
      tone: "urgent",
    };
  }

  if (row.status === "NEEDS_REVIEW") {
    return {
      label: "Review mapping decision",
      href: anchor,
      tone: "urgent",
    };
  }

  if (row.status === "UNMAPPED" && row.hasCandidate) {
    return {
      label: "Review candidate match",
      href: anchor,
      tone: "normal",
    };
  }

  if (row.status === "SUGGESTED") {
    if (isBulkApprovable(row.confidenceLabel)) {
      return {
        label: "Verify high-confidence match",
        href:
          basePath === PRODUCT_MAPPING_SUGGESTIONS_ROUTE
            ? anchor
            : `${PRODUCT_MAPPING_SUGGESTIONS_ROUTE}${productMappingAnchor(row.id)}`,
        tone: "normal",
      };
    }
    return {
      label: "Review suggestion",
      href:
        basePath === PRODUCT_MAPPING_SUGGESTIONS_ROUTE
          ? anchor
          : `${PRODUCT_MAPPING_SUGGESTIONS_ROUTE}${productMappingAnchor(row.id)}`,
      tone: "normal",
    };
  }

  return null;
}

/** Order hub channel conflict row — map SKU then reprocess. */
export function resolveChannelMappingConflictRowNextAction(
  row: ChannelMappingConflictFocusRow,
): ProductMappingRowNextAction {
  return {
    label: row.recordId ? "Map SKU to unblock order" : "Review blocked channel orders",
    href: row.recordId
      ? `${PRODUCT_MAPPING_UNMAPPED_ROUTE}${productMappingAnchor(row.recordId)}`
      : ORDER_HUB_FAILED_ROUTE,
    tone: "urgent",
  };
}

/** Duplicate group row — jump to first mapping in the group. */
export function resolveDuplicateMappingGroupRowNextAction(mappingId: string): ProductMappingRowNextAction {
  return {
    label: "Review mapping row",
    href: `${PRODUCT_MAPPING_CONFLICTS_ROUTE}${productMappingAnchor(mappingId)}`,
    tone: "normal",
  };
}

/** When channel orders are blocked, link operators to order hub failed tab. */
export function resolveProductMappingBlockedOrdersNextAction(
  blockedOrderLines: number,
): ProductMappingRowNextAction | null {
  if (blockedOrderLines <= 0) return null;
  return {
    label: "Review blocked channel orders",
    href: ORDER_HUB_FAILED_ROUTE,
    tone: "urgent",
  };
}
