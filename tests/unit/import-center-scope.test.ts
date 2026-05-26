import { describe, expect, it } from "vitest";

import { canUseImportCenter } from "@/lib/import-center/import-permissions";

describe("import center permissions", () => {
  it("owner scope has full import access", () => {
    const scope = { isOwner: true, role: "OWNER", email: "o@test.com" };
    expect(canUseImportCenter(scope, "import.commit")).toBe(true);
    expect(canUseImportCenter(scope, "import.rollback")).toBe(true);
  });

  it("non-owner manager can upload but not commit", () => {
    const scope = { isOwner: false, role: "MANAGER", email: "m@test.com" };
    expect(canUseImportCenter(scope, "import.upload")).toBe(true);
    expect(canUseImportCenter(scope, "import.commit")).toBe(false);
  });
});
