import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  KDS_DAISY_CHAIN_CONFIG_ABSOLUTE_FINAL_POLICY_ID,
  KDS_DAISY_CHAIN_CONFIG_PANEL_PATH,
  KDS_DAISY_CHAIN_CONFIG_ROUTE,
} from "@/lib/kitchen/kds-daisy-chain-config-absolute-final-policy";
import {
  KDS_DAISY_CHAIN_GTM_SCALE_DOC_PATH,
  KDS_DAISY_CHAIN_GTM_SCALE_HONESTY_MARKERS,
  KDS_DAISY_CHAIN_GTM_SCALE_WIRING_PATHS,
} from "@/lib/marketing/kds-daisy-chain-gtm-scale-absolute-final-policy";

export type KdsDaisyChainGtmScaleAudit = {
  ok: boolean;
  failures: string[];
};

export function auditKdsDaisyChainGtmScaleWiring(
  root = process.cwd(),
): KdsDaisyChainGtmScaleAudit {
  const failures: string[] = [];

  for (const rel of KDS_DAISY_CHAIN_GTM_SCALE_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const docSource = readFileSync(join(root, KDS_DAISY_CHAIN_GTM_SCALE_DOC_PATH), "utf8");
  const panelSource = readFileSync(join(root, KDS_DAISY_CHAIN_CONFIG_PANEL_PATH), "utf8");

  for (const marker of KDS_DAISY_CHAIN_GTM_SCALE_HONESTY_MARKERS) {
    if (!docSource.includes(marker)) {
      failures.push(`doc missing honesty marker: ${marker}`);
    }
  }

  if (!docSource.includes(KDS_DAISY_CHAIN_CONFIG_PANEL_PATH)) {
    failures.push("doc missing feature panel path");
  }

  if (!docSource.includes(KDS_DAISY_CHAIN_CONFIG_ROUTE)) {
    failures.push("doc missing daisy-chain route");
  }

  if (!docSource.includes("/dashboard/kitchen/routing-rules")) {
    failures.push("doc missing routing rules cross-link");
  }

  if (
    !panelSource.includes("kds-daisy-chain-config-absolute-final-v1") &&
    !panelSource.includes(KDS_DAISY_CHAIN_CONFIG_ABSOLUTE_FINAL_POLICY_ID)
  ) {
    failures.push("panel missing feature policy id");
  }

  if (!docSource.includes("kds-daisy-chain-gtm-scale-absolute-final-v1")) {
    failures.push("doc missing GTM policy id reference");
  }

  return { ok: failures.length === 0, failures };
}
