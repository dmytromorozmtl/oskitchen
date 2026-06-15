import type { Metadata } from "next";

import { CateringCrmPanel } from "@/components/catering/catering-crm-panel";
import {
  CATERING_CRM_P3_150_HEADLINE,
  CATERING_CRM_P3_150_POLICY_ID,
  CATERING_CRM_P3_150_ROUTE,
} from "@/lib/catering/catering-crm-p3-150-policy";

export const metadata: Metadata = {
  title: "Catering CRM — Tripleseat parity",
  description:
    "Tripleseat parity catering CRM at /dashboard/catering/crm — quotes, deposits, event sheets, and quote-to-order conversion.",
};

export default function CateringCrmPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <CateringCrmPanel />
      <p className="sr-only">
        Policy {CATERING_CRM_P3_150_POLICY_ID} · {CATERING_CRM_P3_150_HEADLINE} ·{" "}
        {CATERING_CRM_P3_150_ROUTE}
      </p>
    </div>
  );
}
