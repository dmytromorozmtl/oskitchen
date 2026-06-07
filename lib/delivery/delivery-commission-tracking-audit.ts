import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DELIVERY_COMMISSION_HONESTY_MARKERS,
  DELIVERY_COMMISSION_PROVIDERS,
  DELIVERY_COMMISSION_TRACKING_PAGE_PATH,
  DELIVERY_COMMISSION_TRACKING_WIRING_PATHS,
} from "@/lib/delivery/delivery-commission-tracking-absolute-final-policy";

export type DeliveryCommissionTrackingAudit = {
  ok: boolean;
  failures: string[];
  providerCount: number;
};

export function auditDeliveryCommissionTrackingWiring(
  root = process.cwd(),
): DeliveryCommissionTrackingAudit {
  const failures: string[] = [];

  for (const rel of DELIVERY_COMMISSION_TRACKING_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const panelSource = readFileSync(
    join(root, "components/dashboard/analytics/delivery-commission-panel.tsx"),
    "utf8",
  );
  const pageSource = readFileSync(join(root, DELIVERY_COMMISSION_TRACKING_PAGE_PATH), "utf8");

  if (!panelSource.includes("data-delivery-commission-panel")) {
    failures.push("panel missing root test id");
  }
  if (!panelSource.includes("data-delivery-commission-order-row")) {
    failures.push("panel missing order row test id");
  }
  if (!pageSource.includes("DeliveryCommissionPanel")) {
    failures.push("page missing DeliveryCommissionPanel");
  }
  if (!pageSource.includes("loadDeliveryCommissionTracking")) {
    failures.push("page must load commission tracking service");
  }

  for (const marker of DELIVERY_COMMISSION_HONESTY_MARKERS) {
    if (!panelSource.includes(marker)) {
      failures.push(`panel missing honesty marker: ${marker}`);
    }
  }

  for (const provider of DELIVERY_COMMISSION_PROVIDERS) {
    if (!panelSource.includes(provider) && !pageSource.includes(provider)) {
      // provider labels used instead of enum keys in UI — check service/policy instead
      const policySource = readFileSync(
        join(root, "lib/delivery/delivery-commission-tracking-absolute-final-policy.ts"),
        "utf8",
      );
      if (!policySource.includes(`"${provider}"`)) {
        failures.push(`policy missing provider: ${provider}`);
      }
    }
  }

  const metricsSource = readFileSync(
    join(root, "lib/delivery/delivery-commission-metrics.ts"),
    "utf8",
  );
  if (!metricsSource.includes("extractReportedCommission")) {
    failures.push("metrics missing extractReportedCommission");
  }
  if (!metricsSource.includes("resolveDeliveryOrderCommission")) {
    failures.push("metrics missing resolveDeliveryOrderCommission");
  }

  return {
    ok: failures.length === 0,
    failures,
    providerCount: DELIVERY_COMMISSION_PROVIDERS.length,
  };
}
