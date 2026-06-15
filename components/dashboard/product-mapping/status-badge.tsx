import type { ProductMappingConfidence, ProductMappingStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import {
  PRODUCT_MAPPING_STATUS_LABEL,
  PRODUCT_MAPPING_STATUS_TONE,
} from "@/lib/product-mapping/mapping-status";
import {
  CONFIDENCE_LABEL,
  CONFIDENCE_TONE,
} from "@/lib/product-mapping/matching-confidence";

const TONE_CLASS: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-sky-100 text-sky-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
};

export function MappingStatusBadge({ status }: { status: ProductMappingStatus }) {
  return (
    <Badge className={TONE_CLASS[PRODUCT_MAPPING_STATUS_TONE[status]]}>
      {PRODUCT_MAPPING_STATUS_LABEL[status]}
    </Badge>
  );
}

export function ConfidenceBadge({ label }: { label: ProductMappingConfidence | null | undefined }) {
  if (!label) return <Badge className={TONE_CLASS.neutral}>—</Badge>;
  return <Badge className={TONE_CLASS[CONFIDENCE_TONE[label]]}>{CONFIDENCE_LABEL[label]}</Badge>;
}
