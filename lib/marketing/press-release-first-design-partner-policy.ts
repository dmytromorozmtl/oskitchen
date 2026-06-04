import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * MKT-29 — first design partner press release policy (LOI-gated announcement).
 *
 * @see docs/press-release-first-design-partner.md
 * @see docs/loi-design-partner-template.md
 * @see docs/series-a-hold-notice.md
 */

export const PRESS_RELEASE_FIRST_DESIGN_PARTNER_POLICY_ID =
  "press-release-first-design-partner-mkt29-v1" as const;

export const PRESS_RELEASE_FIRST_DESIGN_PARTNER_DOC =
  "docs/press-release-first-design-partner.md" as const;

export const PRESS_RELEASE_LOI_SKU = "LOI-DP-001" as const;

/** Publish gates — all must pass before wire send. */
export const PRESS_RELEASE_PUBLISH_GATES = [
  "countersigned LOI on file",
  "partner written approval for name and quote",
  "verify-claims CI green on draft",
  "forbidden superlatives lint pass",
  "series A hold respected",
] as const;

export const PRESS_RELEASE_HEADLINE_OPTIONS = ["H1", "H2", "H3"] as const;

export const PRESS_RELEASE_WIRE_SECTIONS = [
  "Headline options",
  "Subhead",
  "Body — paragraph 1",
  "Body — paragraph 2",
  "Body — paragraph 3",
  "Body — paragraph 4",
  "About partner",
  "About OS Kitchen",
  "Contact",
] as const;

export const PRESS_RELEASE_FORBIDDEN_CLAIMS = [
  "thousands of restaurants",
  "production-certified",
  "live nationwide",
  "beat toast",
  "enterprise-ready day one",
  "soc 2 certified",
  "toast-class rush hour",
  "unified delivery ops live today",
  "series a",
  "fabricated",
] as const;

export const PRESS_RELEASE_DOC_REQUIRED_HEADINGS = [
  "Publish gates",
  "Pre-publish checklist",
  "Press release template",
  "Forbidden press release claims",
  "Post-publish checklist",
] as const;

export type PressReleaseFirstDesignPartnerDocAudit = {
  docPath: typeof PRESS_RELEASE_FIRST_DESIGN_PARTNER_DOC;
  missingHeadings: string[];
  gateCount: number;
  headlineCount: number;
  passed: boolean;
};

export function auditPressReleaseFirstDesignPartnerDoc(
  root = process.cwd(),
): PressReleaseFirstDesignPartnerDocAudit {
  const source = readFileSync(join(root, PRESS_RELEASE_FIRST_DESIGN_PARTNER_DOC), "utf8");
  const missingHeadings = PRESS_RELEASE_DOC_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const gateCount = PRESS_RELEASE_PUBLISH_GATES.filter((gate) =>
    source.toLowerCase().includes(gate.toLowerCase().slice(0, 20)),
  ).length;
  const headlineCount = PRESS_RELEASE_HEADLINE_OPTIONS.filter((id) =>
    source.includes(`**${id}**`),
  ).length;

  return {
    docPath: PRESS_RELEASE_FIRST_DESIGN_PARTNER_DOC,
    missingHeadings,
    gateCount,
    headlineCount,
    passed:
      missingHeadings.length === 0 &&
      gateCount >= 4 &&
      headlineCount === PRESS_RELEASE_HEADLINE_OPTIONS.length,
  };
}

export type PressReleaseFirstDesignPartnerLint = {
  forbiddenHits: string[];
  passed: boolean;
};

export function lintPressReleaseFirstDesignPartnerCopy(
  source: string,
): PressReleaseFirstDesignPartnerLint {
  const lower = source.toLowerCase();
  const forbiddenHits = PRESS_RELEASE_FORBIDDEN_CLAIMS.filter((phrase) =>
    lower.includes(phrase),
  );
  return {
    forbiddenHits,
    passed: forbiddenHits.length === 0,
  };
}
