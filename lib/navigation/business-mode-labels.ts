import type { BusinessType } from "@prisma/client";

import { resolveBusinessType } from "@/lib/business-modes";

/** Human label for the Orders nav entry by operating mode (sidebar + command palette). */
export function ordersNavLabelForBusinessType(businessType: BusinessType | null | undefined): string {
  const mode = resolveBusinessType(businessType);
  if (mode === "MEAL_PREP" || mode === "BAKERY") return "Preorders";
  if (mode === "CATERING") return "Orders & events";
  return "Orders";
}
