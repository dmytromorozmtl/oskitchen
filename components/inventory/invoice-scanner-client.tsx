"use client";

import { InvoiceScannerMobile } from "@/components/inventory/invoice-scanner-mobile";
import type { InvoiceScanHistoryEntry } from "@/services/ai/invoice-scanner-service";

type Props = {
  history: InvoiceScanHistoryEntry[];
  aiConfigured: boolean;
};

/** Desktop shell — delegates to mobile-first scanner UX. */
export function InvoiceScannerClient(props: Props) {
  return <InvoiceScannerMobile {...props} />;
}
