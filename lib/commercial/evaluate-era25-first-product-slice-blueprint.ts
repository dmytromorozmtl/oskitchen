/**
 * era25 first product slice blueprint evaluation — gates + charter + staging checklist.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { discoverIllegalEra25ProductArtifacts } from "@/lib/commercial/detect-illegal-era25-product-artifacts-era24";
import {
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_DOC,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_GUARDRAILS,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_HUMAN_STEPS,
  ERA25_FIRST_PRODUCT_SLICE_CANONICAL_NAME,
  ERA25_FIRST_PRODUCT_SLICE_CHARTER_DOC_PREFIX,
  ERA25_FIRST_PRODUCT_SLICE_ENGINEERING_DELIVERABLES,
  ERA25_FIRST_PRODUCT_SLICE_EXISTING_SURFACES,
  ERA25_FIRST_PRODUCT_SLICE_BACKLOG_ID,
  ERA25_FIRST_PRODUCT_SLICE_POLICY_FAMILY,
  ERA25_FIRST_PRODUCT_SLICE_PRODUCT_PLATFORM_ANCHOR,
  ERA25_FIRST_PRODUCT_SLICE_STAGING_CHECKLIST_DOC,
} from "@/lib/commercial/era25-first-product-slice-blueprint-phases-era24";
import { validateEra25FirstProductSliceStagingChecklist } from "@/lib/commercial/validate-era25-first-product-slice-staging-checklist-era24";
import { validateEra25CharterDocSections } from "@/lib/commercial/validate-era25-charter-doc-sections-era24";
import { evaluateEra25EngineeringGatesRequireSignedCharter } from "@/lib/commercial/evaluate-era25-engineering-gates-require-signed-charter";

export function discoverCanonicalFirstProductSliceCharterDoc(
  root: string = process.cwd(),
): string | null {
  const docsDir = join(root, "docs");
  if (!existsSync(docsDir)) return null;

  const matches = readdirSync(docsDir)
    .filter((name) => name.startsWith("era25-owner-daily-briefing-breakthrough-charter-2026-"))
    .filter((name) => name.endsWith(".md"))
    .sort();

  return matches[0] ? `docs/${matches[0]}` : null;
}

export function evaluateEra25FirstProductSliceBlueprint(
  env: NodeJS.ProcessEnv = process.env,
  root: string = process.cwd(),
): {
  gates: ReturnType<typeof evaluateEra25EngineeringGatesRequireSignedCharter>;
  illegalArtifacts: ReturnType<typeof discoverIllegalEra25ProductArtifacts>;
  canonicalCharterDocPath: string | null;
  charterSectionsValid: boolean;
  charterMissingSectionIds: readonly string[];
  stagingChecklist: ReturnType<typeof validateEra25FirstProductSliceStagingChecklist>;
  blueprintBlocked: boolean;
  canonicalSliceName: typeof ERA25_FIRST_PRODUCT_SLICE_CANONICAL_NAME;
  backlogId: typeof ERA25_FIRST_PRODUCT_SLICE_BACKLOG_ID;
  policyFamily: typeof ERA25_FIRST_PRODUCT_SLICE_POLICY_FAMILY;
  productPlatformAnchor: typeof ERA25_FIRST_PRODUCT_SLICE_PRODUCT_PLATFORM_ANCHOR;
  stagingChecklistDoc: typeof ERA25_FIRST_PRODUCT_SLICE_STAGING_CHECKLIST_DOC;
  charterDocPrefix: typeof ERA25_FIRST_PRODUCT_SLICE_CHARTER_DOC_PREFIX;
  existingSurfaces: typeof ERA25_FIRST_PRODUCT_SLICE_EXISTING_SURFACES;
  engineeringDeliverables: typeof ERA25_FIRST_PRODUCT_SLICE_ENGINEERING_DELIVERABLES;
  guardrails: typeof ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_GUARDRAILS;
  humanSteps: typeof ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_HUMAN_STEPS;
  blueprintDoc: typeof ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_DOC;
} {
  const gates = evaluateEra25EngineeringGatesRequireSignedCharter(env, root);
  const illegalArtifacts = discoverIllegalEra25ProductArtifacts(root);
  const canonicalCharterDocPath = discoverCanonicalFirstProductSliceCharterDoc(root);

  let charterSectionsValid = false;
  let charterMissingSectionIds: readonly string[] = [];

  if (canonicalCharterDocPath) {
    const content = readFileSync(join(root, canonicalCharterDocPath), "utf8");
    const validation = validateEra25CharterDocSections(content);
    charterSectionsValid = validation.sectionsValid;
    charterMissingSectionIds = validation.missingSectionIds;
  } else {
    charterMissingSectionIds = ["all_sections"];
  }

  const stagingChecklist = validateEra25FirstProductSliceStagingChecklist(root);

  const gatesOpen =
    gates.era25EngineeringGatesMilestone === "era25_engineering_gates_open" &&
    !gates.gatesBlocked;

  const blueprintReady =
    gatesOpen &&
    canonicalCharterDocPath !== null &&
    charterSectionsValid &&
    stagingChecklist.sectionsValid &&
    illegalArtifacts.length === 0;

  const blueprintBlocked = !blueprintReady;

  return {
    gates,
    illegalArtifacts,
    canonicalCharterDocPath,
    charterSectionsValid,
    charterMissingSectionIds,
    stagingChecklist,
    blueprintBlocked,
    canonicalSliceName: ERA25_FIRST_PRODUCT_SLICE_CANONICAL_NAME,
    backlogId: ERA25_FIRST_PRODUCT_SLICE_BACKLOG_ID,
    policyFamily: ERA25_FIRST_PRODUCT_SLICE_POLICY_FAMILY,
    productPlatformAnchor: ERA25_FIRST_PRODUCT_SLICE_PRODUCT_PLATFORM_ANCHOR,
    stagingChecklistDoc: ERA25_FIRST_PRODUCT_SLICE_STAGING_CHECKLIST_DOC,
    charterDocPrefix: ERA25_FIRST_PRODUCT_SLICE_CHARTER_DOC_PREFIX,
    existingSurfaces: ERA25_FIRST_PRODUCT_SLICE_EXISTING_SURFACES,
    engineeringDeliverables: ERA25_FIRST_PRODUCT_SLICE_ENGINEERING_DELIVERABLES,
    guardrails: ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_GUARDRAILS,
    humanSteps: ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_HUMAN_STEPS,
    blueprintDoc: ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_DOC,
  };
}
