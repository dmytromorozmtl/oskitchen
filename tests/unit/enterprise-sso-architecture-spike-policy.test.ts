import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_SSO_SPIKE_DELIVERY_STATUS,
  ENTERPRISE_SSO_SPIKE_EXTENDS_POLICY_ID,
  ENTERPRISE_SSO_SPIKE_PHASE,
  ENTERPRISE_SSO_SPIKE_POLICY_ID,
  enterpriseSsoSpikeDocCoversRequiredSections,
} from "@/lib/enterprise/enterprise-sso-architecture-spike-policy";

describe("enterprise SSO architecture spike policy", () => {
  it("locks era9 SSO spike policy and R1 design-only posture", () => {
    expect(ENTERPRISE_SSO_SPIKE_POLICY_ID).toBe("era9-enterprise-sso-architecture-spike-v1");
    expect(ENTERPRISE_SSO_SPIKE_EXTENDS_POLICY_ID).toBe("era6-enterprise-identity-roadmap-v1");
    expect(ENTERPRISE_SSO_SPIKE_PHASE).toBe("R1");
    expect(ENTERPRISE_SSO_SPIKE_DELIVERY_STATUS).toBe("not_implemented");
  });

  it("validates required sections in spike markdown", () => {
    const sample = `
## Purpose and honesty rules
## Current production auth spine
## R1 spike scope (design only)
## Proposed target architecture
## Session bridge and workspace mapping
## Break-glass and operations
## RBAC and audit implications
## Explicitly not in R1
## R2 pilot prerequisites
## Procurement alignment
`;
    expect(enterpriseSsoSpikeDocCoversRequiredSections(sample)).toBe(true);
    expect(enterpriseSsoSpikeDocCoversRequiredSections("incomplete")).toBe(false);
  });
});
