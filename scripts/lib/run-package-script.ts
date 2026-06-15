/**
 * Run package.json scripts without requiring `npm` on PATH (CI agents, Cursor shell).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

/** Rewrite common CLI shims to node entrypoints under node_modules. */
export function rewritePackageScriptCommand(raw: string): string {
  let cmd = raw.trim();

  if (cmd.startsWith("tsx ")) {
    cmd = `node ./node_modules/tsx/dist/cli.mjs ${cmd.slice(4)}`;
  } else if (cmd.startsWith("npx tsx ")) {
    cmd = `node ./node_modules/tsx/dist/cli.mjs ${cmd.slice(8)}`;
  }

  if (cmd.startsWith("vitest ")) {
    cmd = `node ./node_modules/vitest/vitest.mjs ${cmd.slice(7)}`;
  }

  cmd = cmd.replace(
    /\s&&\s+npm run ([a-z0-9:_-]+)/g,
    (_, script: string) => {
      const nested = readPackageScripts()[script];
      return nested
        ? ` && ${rewritePackageScriptCommand(nested)}`
        : ` && npm run ${script}`;
    },
  );

  return cmd;
}

export function runPackageScript(
  scriptName: string,
  extraEnv?: Record<string, string>,
): number {
  const raw = readPackageScripts()[scriptName];
  if (!raw) {
    console.error(`[run-package-script] missing script: ${scriptName}`);
    return 1;
  }
  const command = rewritePackageScriptCommand(raw);
  const result = spawnSync(command, {
    shell: true,
    stdio: "inherit",
    cwd: ROOT,
    env: { ...process.env, ...extraEnv },
  });
  return result.status ?? 1;
}
