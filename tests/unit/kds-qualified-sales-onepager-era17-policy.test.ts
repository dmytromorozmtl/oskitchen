import { describe, expect, it } from "vitest";

import {
  KDS_QUALIFIED_SALES_ONEPAGER_ERA17_BACKLOG_ID,
  KDS_QUALIFIED_SALES_ONEPAGER_ERA17_FORBIDDEN_CLAIMS,
  KDS_QUALIFIED_SALES_ONEPAGER_ERA17_POLICY_ID,
  KDS_QUALIFIED_SALES_ONEPAGER_ERA17_STATUS,
} from "@/lib/kitchen/kds-qualified-sales-onepager-era17-policy";

describe("kds qualified sales onepager era17 policy", () => {
  it("locks era17 kds qualified sales onepager policy id", () => {
    expect(KDS_QUALIFIED_SALES_ONEPAGER_ERA17_POLICY_ID).toBe(
      "era17-kds-qualified-sales-onepager-v1",
    );
    expect(KDS_QUALIFIED_SALES_ONEPAGER_ERA17_STATUS).toBe("sales_onepager_ready");
    expect(KDS_QUALIFIED_SALES_ONEPAGER_ERA17_BACKLOG_ID).toBe("KOS-E17-027");
  });

  it("forbids rush-hour and toast parity claims", () => {
    expect(KDS_QUALIFIED_SALES_ONEPAGER_ERA17_FORBIDDEN_CLAIMS).toContain(
      "rush-hour kds certification",
    );
    expect(KDS_QUALIFIED_SALES_ONEPAGER_ERA17_FORBIDDEN_CLAIMS).toContain(
      "toast-class kitchen orchestration",
    );
  });
});
