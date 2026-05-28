import { describe, expect, it } from "vitest";

import {
  CLAIMS_REGISTRY_FORBIDDEN_STATUSES,
  CLAIMS_REGISTRY_POLICY_ID,
  type ClaimsRegistryRow,
  validateClaimsRegistryRows,
} from "@/lib/governance/claims-registry-policy";

describe("claims registry policy", () => {
  it("locks era8 claims registry policy", () => {
    expect(CLAIMS_REGISTRY_POLICY_ID).toBe("era8-claims-registry-v1");
    expect(CLAIMS_REGISTRY_FORBIDDEN_STATUSES).toContain("needs-evidence");
  });

  it("rejects needs-evidence status", () => {
    const rows: ClaimsRegistryRow[] = [
      {
        claim: "Test claim",
        page: "/pricing",
        evidenceType: "customer-proof",
        evidenceSource: "pending",
        dateVerified: "2026-05-27",
        status: "needs-evidence",
      },
    ];
    const errors = validateClaimsRegistryRows(rows);
    expect(errors.some((e) => e.includes("needs-evidence"))).toBe(true);
  });

  it("accepts illustrative and verified rows", () => {
    const rows: ClaimsRegistryRow[] = [
      {
        claim: "Verified surface",
        page: "/",
        evidenceType: "product-page",
        evidenceSource: "app/page.tsx",
        dateVerified: "2026-05-27",
        status: "verified",
      },
      {
        claim: "Illustrative ROI",
        page: "/solutions",
        evidenceType: "internal-estimate",
        evidenceSource: "illustrative calculator",
        dateVerified: "2026-05-27",
        status: "illustrative",
      },
    ];
    expect(validateClaimsRegistryRows(rows)).toEqual([]);
  });
});
