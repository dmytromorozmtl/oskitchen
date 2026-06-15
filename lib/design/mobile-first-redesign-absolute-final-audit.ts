import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_SURFACES,
  MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_WIRING_PATHS,
} from "@/lib/design/mobile-first-redesign-absolute-final-policy";

export type MobileFirstRedesignAbsoluteFinalAudit = {
  ok: boolean;
  failures: string[];
};

export function auditMobileFirstRedesignAbsoluteFinalWiring(
  root = process.cwd(),
): MobileFirstRedesignAbsoluteFinalAudit {
  const failures: string[] = [];

  for (const rel of MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  for (const surface of MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_SURFACES) {
    const source = readFileSync(join(root, surface.clientModule), "utf8");
    if (!source.includes(surface.shellTestId)) {
      failures.push(`${surface.clientModule} missing data-testid="${surface.shellTestId}"`);
    }
    if (!source.includes("min-h-11") && !source.includes("touch-manipulation")) {
      failures.push(`${surface.clientModule} missing 44px touch floor wiring`);
    }
  }

  const kdsLayout = readFileSync(
    join(root, "lib/kitchen/kds-tablet-landscape-layout.ts"),
    "utf8",
  );
  if (!kdsLayout.includes("MOBILE_FIRST_TOUCH_FLOOR_PX")) {
    failures.push("kds-tablet-landscape-layout.ts missing MOBILE_FIRST_TOUCH_FLOOR_PX import");
  }

  const posMobile = readFileSync(
    join(root, "components/pos/pos-mobile-client.tsx"),
    "utf8",
  );
  if (!posMobile.includes("mobile-first-redesign-absolute-final-policy")) {
    failures.push("pos-mobile-client.tsx missing absolute-final policy import");
  }

  return { ok: failures.length === 0, failures };
}
