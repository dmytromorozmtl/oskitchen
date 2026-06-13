import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  VISUAL_QA_P3_55_SURFACE_COUNT,
  VISUAL_QA_P3_55_SURFACES,
  type VisualQaSurfaceId,
} from "@/lib/qa/visual-qa-p3-55-policy";

export type VisualQaSurfaceStatus = {
  surfaceId: VisualQaSurfaceId;
  fixturePresent: boolean;
  shellPresent: boolean;
  viewport: { width: number; height: number };
};

export function buildVisualQaSurfaceStatuses(root = process.cwd()): VisualQaSurfaceStatus[] {
  return VISUAL_QA_P3_55_SURFACES.map((surface) => ({
    surfaceId: surface.id,
    fixturePresent: existsSync(join(root, surface.fixturePage)),
    shellPresent: existsSync(join(root, surface.shellComponent)),
    viewport: surface.viewport,
  }));
}

export function validateVisualQaContract(root = process.cwd()): {
  passed: boolean;
  surfaceCount: number;
  errors: string[];
} {
  const errors: string[] = [];
  const statuses = buildVisualQaSurfaceStatuses(root);

  if (statuses.length !== VISUAL_QA_P3_55_SURFACE_COUNT) {
    errors.push(`Expected ${VISUAL_QA_P3_55_SURFACE_COUNT} surfaces, got ${statuses.length}`);
  }

  const required: VisualQaSurfaceId[] = ["pos_tablet", "kds_kitchen", "mobile_today"];
  for (const surfaceId of required) {
    const status = statuses.find((entry) => entry.surfaceId === surfaceId);
    if (!status) {
      errors.push(`Missing surface: ${surfaceId}`);
      continue;
    }
    if (!status.fixturePresent) {
      errors.push(`${surfaceId}: missing fixture page`);
    }
    if (!status.shellPresent) {
      errors.push(`${surfaceId}: missing shell component`);
    }
    if (status.viewport.width < 320 || status.viewport.height < 600) {
      if (surfaceId !== "mobile_today") {
        errors.push(`${surfaceId}: viewport too small for operator surface`);
      }
    }
  }

  const mobile = statuses.find((entry) => entry.surfaceId === "mobile_today");
  if (mobile && mobile.viewport.width > 480) {
    errors.push("mobile_today viewport should be mobile-width (≤480px)");
  }

  return {
    passed: errors.length === 0,
    surfaceCount: statuses.length,
    errors,
  };
}

export function findVisualQaSurface(surfaceId: VisualQaSurfaceId) {
  return VISUAL_QA_P3_55_SURFACES.find((surface) => surface.id === surfaceId);
}
