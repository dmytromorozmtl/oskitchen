import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  TYPECHECK_SLICE_POLICY_ID,
  TYPECHECK_SLICES,
  findTypecheckSlice,
  typecheckSliceScript,
} from "@/lib/ci/typecheck-slice-policy";

const ROOT = process.cwd();

describe("typecheck slice policy", () => {
  it("locks era4 typecheck slice policy id", () => {
    expect(TYPECHECK_SLICE_POLICY_ID).toBe("era4-typecheck-slice-v1");
    expect(TYPECHECK_SLICES).toHaveLength(2);
  });

  it("maps dashboard-services-api slice to tsconfig and script", () => {
    const slice = findTypecheckSlice("dashboard-services-api");
    expect(slice.tsconfig).toBe("tsconfig.slice.dashboard-services-api.json");
    expect(typecheckSliceScript("dashboard-services-api")).toBe(
      "typecheck:slice:dashboard-services-api",
    );
    expect(slice.heapMb).toBe(6144);
  });

  it("keeps strict mode in base tsconfig used by slices", () => {
    const base = JSON.parse(
      readFileSync(join(ROOT, "tsconfig.base.json"), "utf8"),
    ) as { compilerOptions?: { strict?: boolean } };
    expect(base.compilerOptions?.strict).toBe(true);

    const def = findTypecheckSlice("dashboard-services-api");
    const slice = JSON.parse(
      readFileSync(join(ROOT, def.tsconfig), "utf8"),
    ) as { extends?: string };
    expect(slice.extends).toBe("./tsconfig.base.json");
  });
});
