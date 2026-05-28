import { describe, expect, it } from "vitest";

import {
  RBAC_WAVE4_ERA9_GUARDED_SURFACES,
  RBAC_WAVE4_ERA9_POLICY_ID,
  RBAC_WAVE4_ERA9_TEST_FILES,
} from "@/lib/security/rbac-wave4-era9-policy";

describe("rbac wave4 era9 policy", () => {
  it("locks era9 rbac wave4 recert policy", () => {
    expect(RBAC_WAVE4_ERA9_POLICY_ID).toBe("era9-rbac-wave4-recert-v1");
    expect(RBAC_WAVE4_ERA9_GUARDED_SURFACES.length).toBeGreaterThanOrEqual(11);
    expect(RBAC_WAVE4_ERA9_TEST_FILES.length).toBe(15);
  });
});
