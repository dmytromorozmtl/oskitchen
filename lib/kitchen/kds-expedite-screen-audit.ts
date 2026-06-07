import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  KDS_EXPEDITE_SCREEN_COMPONENT_PATH,
  KDS_EXPEDITE_SCREEN_HONESTY_MARKERS,
  KDS_EXPEDITE_SCREEN_MIN_TOUCH_PX,
  KDS_EXPEDITE_SCREEN_REQUIRED_MARKERS,
  KDS_EXPEDITE_SCREEN_ROUTE,
  KDS_EXPEDITE_SCREEN_SERVICE_PATH,
  KDS_EXPEDITE_SCREEN_WIRING_PATHS,
} from "@/lib/kitchen/kds-expedite-screen-absolute-final-policy";

export type KdsExpediteScreenAudit = {
  ok: boolean;
  failures: string[];
};

export function auditKdsExpediteScreenWiring(root = process.cwd()): KdsExpediteScreenAudit {
  const failures: string[] = [];

  for (const rel of KDS_EXPEDITE_SCREEN_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const componentSource = readFileSync(join(root, KDS_EXPEDITE_SCREEN_COMPONENT_PATH), "utf8");
  const serviceSource = readFileSync(join(root, KDS_EXPEDITE_SCREEN_SERVICE_PATH), "utf8");
  const pageSource = readFileSync(
    join(root, "app/dashboard/kitchen/expedite/page.tsx"),
    "utf8",
  );
  const expoPage = readFileSync(join(root, "app/dashboard/kitchen/expo/page.tsx"), "utf8");

  for (const marker of KDS_EXPEDITE_SCREEN_REQUIRED_MARKERS) {
    if (!componentSource.includes(marker)) {
      failures.push(`component missing marker: ${marker}`);
    }
  }

  for (const marker of KDS_EXPEDITE_SCREEN_HONESTY_MARKERS) {
    if (!componentSource.includes(marker) && !pageSource.includes(marker)) {
      failures.push(`missing honesty marker: ${marker}`);
    }
  }

  if (!componentSource.includes(String(KDS_EXPEDITE_SCREEN_MIN_TOUCH_PX))) {
    failures.push("component missing min touch target px");
  }

  if (!pageSource.includes("KdsExpediteScreen")) {
    failures.push("page missing KdsExpediteScreen");
  }

  if (!serviceSource.includes("buildKdsRushModeSnapshot")) {
    failures.push("service missing rush snapshot builder");
  }

  if (!serviceSource.includes("pickKdsExpediteHeroTicket")) {
    failures.push("service missing hero ticket picker");
  }

  if (!expoPage.includes(KDS_EXPEDITE_SCREEN_ROUTE)) {
    failures.push("expo page missing expedite screen link");
  }

  if (!componentSource.includes("kds-expedite-screen-absolute-final-v1")) {
    failures.push("component missing policy id reference");
  }

  return { ok: failures.length === 0, failures };
}
