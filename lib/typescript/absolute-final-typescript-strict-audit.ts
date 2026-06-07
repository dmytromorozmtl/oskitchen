import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  isFullStrictCompilerOptions,
  TYPESCRIPT_STRICT_BASE_CONFIG_PATH,
  TYPESCRIPT_STRICT_REQUIRED_COMPILER_OPTIONS,
  TYPESCRIPT_STRICT_ROOT_CONFIG_PATH,
  TYPESCRIPT_STRICT_TYPECHECK_CONFIG_PATH,
  TYPESCRIPT_STRICT_WIRING_PATHS,
} from "@/lib/typescript/absolute-final-typescript-strict-policy";

export type TypeScriptStrictAudit = {
  ok: boolean;
  failures: string[];
};

function readJsonConfig(path: string, root: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as Record<string, unknown>;
}

export function auditTypeScriptStrictWiring(root = process.cwd()): TypeScriptStrictAudit {
  const failures: string[] = [];

  for (const rel of TYPESCRIPT_STRICT_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const base = readJsonConfig(TYPESCRIPT_STRICT_BASE_CONFIG_PATH, root);
  const baseOptions = (base.compilerOptions ?? {}) as Record<string, unknown>;

  if (!isFullStrictCompilerOptions(baseOptions as Record<string, boolean>)) {
    for (const [key, expected] of Object.entries(TYPESCRIPT_STRICT_REQUIRED_COMPILER_OPTIONS)) {
      if (baseOptions[key] !== expected) {
        failures.push(
          `tsconfig.base.json compilerOptions.${key} expected ${String(expected)}, got ${String(baseOptions[key])}`,
        );
      }
    }
  }

  const rootConfig = readJsonConfig(TYPESCRIPT_STRICT_ROOT_CONFIG_PATH, root);
  if (rootConfig.extends !== "./tsconfig.base.json") {
    failures.push("tsconfig.json must extend ./tsconfig.base.json");
  }

  const typecheck = readJsonConfig(TYPESCRIPT_STRICT_TYPECHECK_CONFIG_PATH, root);
  if (typecheck.extends !== "./tsconfig.json") {
    failures.push("tsconfig.typecheck.json must extend ./tsconfig.json");
  }

  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  if (!pkg.scripts?.typecheck?.includes("typecheck")) {
    failures.push("package.json missing typecheck script");
  }

  return { ok: failures.length === 0, failures };
}
