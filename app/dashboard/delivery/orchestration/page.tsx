import type { Metadata } from "next";

import { DeliveryOrchestrationPanel } from "@/components/delivery/delivery-orchestration-panel";
import {
  DELIVERY_ORCHESTRATION_P3_147_HEADLINE,
  DELIVERY_ORCHESTRATION_P3_147_POLICY_ID,
  DELIVERY_ORCHESTRATION_P3_147_ROUTE,
} from "@/lib/delivery/delivery-orchestration-p3-147-policy";

export const metadata: Metadata = {
  title: "Delivery orchestration — Olo parity",
  description:
    "Olo parity delivery orchestration at /dashboard/delivery/orchestration — order hub, dispatch, routes, and fleet tracking.",
};

export default function DeliveryOrchestrationPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <DeliveryOrchestrationPanel />
      <p className="sr-only">
        Policy {DELIVERY_ORCHESTRATION_P3_147_POLICY_ID} · {DELIVERY_ORCHESTRATION_P3_147_HEADLINE} ·{" "}
        {DELIVERY_ORCHESTRATION_P3_147_ROUTE}
      </p>
    </div>
  );
}
