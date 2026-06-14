import { PosCustomerDisplayClient } from "@/components/pos/pos-customer-display-client";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

export const metadata = {
  title: "Customer Display — POS",
  description: "Second-screen customer-facing order total for multi-monitor desktop POS.",
};

/** PAGE_LAYOUT_EXCEPTION — fullscreen customer display (second monitor). */

export default function PosCustomerDisplayPage() {
  return (
    <SuspenseWave1PageBoundary sector="pos">
      <PosCustomerDisplayClient />
    </SuspenseWave1PageBoundary>
  );
}
