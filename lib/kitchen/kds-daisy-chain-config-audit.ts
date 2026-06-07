import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  KDS_DAISY_CHAIN_CONFIG_PANEL_PATH,
  KDS_DAISY_CHAIN_CONFIG_ROUTE,
  KDS_DAISY_CHAIN_CONFIG_SERVICE_PATH,
  KDS_DAISY_CHAIN_CONFIG_WIRING_PATHS,
} from "@/lib/kitchen/kds-daisy-chain-config-absolute-final-policy";

export type KdsDaisyChainConfigAudit = {
  ok: boolean;
  failures: string[];
};

export function auditKdsDaisyChainConfigWiring(root = process.cwd()): KdsDaisyChainConfigAudit {
  const failures: string[] = [];

  for (const rel of KDS_DAISY_CHAIN_CONFIG_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const panelSource = readFileSync(join(root, KDS_DAISY_CHAIN_CONFIG_PANEL_PATH), "utf8");
  const serviceSource = readFileSync(join(root, KDS_DAISY_CHAIN_CONFIG_SERVICE_PATH), "utf8");
  const pageSource = readFileSync(
    join(root, "app/dashboard/kitchen/daisy-chain/page.tsx"),
    "utf8",
  );
  const routingPanel = readFileSync(
    join(root, "components/dashboard/kitchen/kds-station-routing-rules-panel.tsx"),
    "utf8",
  );

  if (!panelSource.includes('data-testid="kds-daisy-chain-config-panel"')) {
    failures.push("panel missing root test id");
  }
  if (!panelSource.includes("NCR Aloha parity")) {
    failures.push("panel missing NCR Aloha parity marker");
  }
  if (!panelSource.includes("bump handoff")) {
    failures.push("panel missing bump handoff honesty marker");
  }
  if (!pageSource.includes("KdsDaisyChainConfigPanel")) {
    failures.push("page missing KdsDaisyChainConfigPanel");
  }
  if (!serviceSource.includes("resolveDaisyChainNextStation")) {
    failures.push("service missing resolveDaisyChainNextStation");
  }
  if (!serviceSource.includes("loadKdsDaisyChainLinks")) {
    failures.push("service missing loadKdsDaisyChainLinks");
  }
  if (!routingPanel.includes(KDS_DAISY_CHAIN_CONFIG_ROUTE)) {
    failures.push("routing rules panel missing daisy-chain link");
  }
  if (!panelSource.includes("kds-daisy-chain-config-absolute-final-v1")) {
    failures.push("panel missing policy id reference");
  }

  return { ok: failures.length === 0, failures };
}
