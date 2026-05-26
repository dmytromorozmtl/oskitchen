#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const args = [
  "playwright",
  "test",
  "tests/e2e/pilot-journey.spec.ts",
  "--project=pilot-journey",
];

if (
  process.env.E2E_PILOT_STAFF_EMAIL?.trim() &&
  process.env.E2E_PILOT_STAFF_PASSWORD?.trim()
) {
  args.push("tests/e2e/pilot-journey-staff.spec.ts", "--project=pilot-staff");
}

const result = spawnSync("npx", args, { stdio: "inherit", shell: false });
process.exit(result.status ?? 1);
