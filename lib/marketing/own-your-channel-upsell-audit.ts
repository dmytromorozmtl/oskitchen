import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  OWN_YOUR_CHANNEL_COMMISSION_CALCULATOR_PATH,
  OWN_YOUR_CHANNEL_DELIVERY_COMMISSION_PANEL_PATH,
  OWN_YOUR_CHANNEL_HONESTY_MARKERS,
  OWN_YOUR_CHANNEL_REQUIRED_MARKERS,
  OWN_YOUR_CHANNEL_UPSELL_COMPONENT_PATH,
  OWN_YOUR_CHANNEL_UPSELL_CONTENT_PATH,
  OWN_YOUR_CHANNEL_UPSELL_PAGE_PATH,
  OWN_YOUR_CHANNEL_UPSELL_ROUTE,
  OWN_YOUR_CHANNEL_UPSELL_STRIP_PATH,
  OWN_YOUR_CHANNEL_WIRING_PATHS,
} from "@/lib/marketing/own-your-channel-upsell-absolute-final-policy";

export type OwnYourChannelUpsellAudit = {
  ok: boolean;
  failures: string[];
};

export function auditOwnYourChannelUpsellWiring(
  root = process.cwd(),
): OwnYourChannelUpsellAudit {
  const failures: string[] = [];

  for (const rel of OWN_YOUR_CHANNEL_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const componentSource = readFileSync(
    join(root, OWN_YOUR_CHANNEL_UPSELL_COMPONENT_PATH),
    "utf8",
  );
  const contentSource = readFileSync(
    join(root, OWN_YOUR_CHANNEL_UPSELL_CONTENT_PATH),
    "utf8",
  );
  const pageSource = readFileSync(join(root, OWN_YOUR_CHANNEL_UPSELL_PAGE_PATH), "utf8");
  const stripSource = readFileSync(join(root, OWN_YOUR_CHANNEL_UPSELL_STRIP_PATH), "utf8");
  const calculatorSource = readFileSync(
    join(root, OWN_YOUR_CHANNEL_COMMISSION_CALCULATOR_PATH),
    "utf8",
  );
  const panelSource = readFileSync(
    join(root, OWN_YOUR_CHANNEL_DELIVERY_COMMISSION_PANEL_PATH),
    "utf8",
  );

  for (const marker of OWN_YOUR_CHANNEL_REQUIRED_MARKERS) {
    if (!componentSource.includes(marker)) {
      failures.push(`upsell flow missing marker: ${marker}`);
    }
  }

  for (const marker of OWN_YOUR_CHANNEL_HONESTY_MARKERS) {
    if (!componentSource.includes(marker) && !contentSource.includes(marker)) {
      failures.push(`missing honesty marker: ${marker}`);
    }
  }

  if (!contentSource.includes(OWN_YOUR_CHANNEL_UPSELL_ROUTE)) {
    failures.push("content missing upsell route");
  }

  if (!pageSource.includes("OwnYourChannelUpsellFlow")) {
    failures.push("page missing OwnYourChannelUpsellFlow");
  }

  if (!stripSource.includes("OWN_YOUR_CHANNEL_UPSELL_ROUTE")) {
    failures.push("dashboard strip missing upsell route reference");
  }

  if (!calculatorSource.includes("OWN_YOUR_CHANNEL_UPSELL_ROUTE")) {
    failures.push("commission calculator missing upsell link");
  }

  if (!panelSource.includes("OwnYourChannelUpsellStrip")) {
    failures.push("delivery commission panel missing upsell strip");
  }

  return { ok: failures.length === 0, failures };
}
