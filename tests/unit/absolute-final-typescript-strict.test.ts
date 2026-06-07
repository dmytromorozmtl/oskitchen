import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { TYPECHECK_SLICES } from "@/lib/ci/typecheck-slice-policy";
import { auditTypeScriptStrictWiring } from "@/lib/typescript/absolute-final-typescript-strict-audit";
import {
  isFullStrictCompilerOptions,
  TYPESCRIPT_STRICT_ABSOLUTE_FINAL_POLICY_ID,
  TYPESCRIPT_STRICT_BASE_CONFIG_PATH,
  TYPESCRIPT_STRICT_PHASED_COMPILER_OPTIONS,
  TYPESCRIPT_STRICT_REQUIRED_COMPILER_OPTIONS,
  TYPESCRIPT_STRICT_ROOT_CONFIG_PATH,
  TYPESCRIPT_STRICT_TYPECHECK_CONFIG_PATH,
} from "@/lib/typescript/absolute-final-typescript-strict-policy";

const ROOT = process.cwd();
/** Absolute Final Task 146 — full TypeScript strict mode */
const TASK = 146;

describe(`TypeScript strict mode (Absolute Final Task ${TASK})`, () => {
  it("locks absolute final TypeScript strict policy id", () => {
    expect(TYPESCRIPT_STRICT_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-typescript-strict-v1",
    );
    expect(TYPESCRIPT_STRICT_REQUIRED_COMPILER_OPTIONS.strict).toBe(true);
    expect(TYPESCRIPT_STRICT_REQUIRED_COMPILER_OPTIONS.noImplicitReturns).toBe(true);
  });

  it("enables full strict compiler options in tsconfig.base.json", () => {
    const base = JSON.parse(
      readFileSync(join(ROOT, TYPESCRIPT_STRICT_BASE_CONFIG_PATH), "utf8"),
    ) as { compilerOptions?: Record<string, boolean> };
    expect(isFullStrictCompilerOptions(base.compilerOptions ?? {})).toBe(true);
  });

  it("extends strict base through root and typecheck configs", () => {
    const rootConfig = JSON.parse(
      readFileSync(join(ROOT, TYPESCRIPT_STRICT_ROOT_CONFIG_PATH), "utf8"),
    ) as { extends?: string };
    const typecheck = JSON.parse(
      readFileSync(join(ROOT, TYPESCRIPT_STRICT_TYPECHECK_CONFIG_PATH), "utf8"),
    ) as { extends?: string };
    expect(rootConfig.extends).toBe("./tsconfig.base.json");
    expect(typecheck.extends).toBe("./tsconfig.json");
  });

  it("documents phased strict flags without requiring them yet", () => {
    expect(TYPESCRIPT_STRICT_PHASED_COMPILER_OPTIONS).toContain("noUncheckedIndexedAccess");
    expect(TYPESCRIPT_STRICT_PHASED_COMPILER_OPTIONS).toContain("exactOptionalPropertyTypes");
  });

  it("keeps all typecheck slices on strict base config", () => {
    for (const slice of TYPECHECK_SLICES) {
      const config = JSON.parse(readFileSync(join(ROOT, slice.tsconfig), "utf8")) as {
        extends?: string;
      };
      expect(config.extends).toBe("./tsconfig.base.json");
    }
  });

  it("references policy in base tsconfig comment via audit wiring", () => {
    const policySource = readFileSync(
      join(ROOT, "lib/typescript/absolute-final-typescript-strict-policy.ts"),
      "utf8",
    );
    expect(policySource).toContain("Absolute Final Task 146");
    expect(policySource).toContain(TYPESCRIPT_STRICT_BASE_CONFIG_PATH);
  });

  it("passes TypeScript strict wiring audit", () => {
    const audit = auditTypeScriptStrictWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("locks CI cert script for TypeScript strict gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.["test:ci:typescript-strict-absolute-final:cert"]).toContain(
      "absolute-final-typescript-strict.test.ts",
    );
  });
});
