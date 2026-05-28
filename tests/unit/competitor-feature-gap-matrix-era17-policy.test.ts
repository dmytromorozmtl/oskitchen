import { describe, expect, it } from "vitest";

import {
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_BACKLOG_ID,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_DOC,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_EVIDENCE_MARKERS,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_FORBIDDEN_CLAIMS,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_POLICY_ID,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_PROOF_STATUS,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_REQUIRED_COMPETITORS,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_REQUIRED_SECTIONS,
} from "@/lib/commercial/competitor-feature-gap-matrix-era17-policy";

describe("competitor feature gap matrix era17 policy", () => {
  it("locks era17 competitor matrix refresh policy id", () => {
    expect(COMPETITOR_FEATURE_GAP_MATRIX_ERA17_POLICY_ID).toBe(
      "era17-competitor-feature-gap-matrix-refresh-v1",
    );
  });

  it("requires sixteen competitor names for Cycle 42", () => {
    expect(COMPETITOR_FEATURE_GAP_MATRIX_ERA17_REQUIRED_COMPETITORS).toHaveLength(16);
    expect(COMPETITOR_FEATURE_GAP_MATRIX_ERA17_REQUIRED_COMPETITORS).toContain("Toast");
    expect(COMPETITOR_FEATURE_GAP_MATRIX_ERA17_REQUIRED_COMPETITORS).toContain("Klaviyo");
    expect(COMPETITOR_FEATURE_GAP_MATRIX_ERA17_REQUIRED_COMPETITORS).toContain("Mailchimp");
  });

  it("defines evidence-aligned proof status without parity inflation", () => {
    expect(COMPETITOR_FEATURE_GAP_MATRIX_ERA17_PROOF_STATUS).toBe(
      "evidence_aligned_awaiting_pilot_proof",
    );
    expect(COMPETITOR_FEATURE_GAP_MATRIX_ERA17_DOC).toBe("docs/competitor-feature-gap-matrix.md");
    expect(COMPETITOR_FEATURE_GAP_MATRIX_ERA17_BACKLOG_ID).toBe("KOS-E17-035");
  });

  it("lists era17 evidence markers and forbidden claims", () => {
    expect(COMPETITOR_FEATURE_GAP_MATRIX_ERA17_EVIDENCE_MARKERS.length).toBeGreaterThan(5);
    expect(COMPETITOR_FEATURE_GAP_MATRIX_ERA17_FORBIDDEN_CLAIMS.length).toBeGreaterThan(5);
    expect(COMPETITOR_FEATURE_GAP_MATRIX_ERA17_REQUIRED_SECTIONS).toContain(
      "Era 17 evidence alignment",
    );
  });
});
