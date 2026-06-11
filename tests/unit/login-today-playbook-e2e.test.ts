import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditLoginTodayPlaybookE2E } from "@/lib/qa/login-today-playbook-e2e-audit";
import {
  LOGIN_TODAY_PLAYBOOK_AUDIT_SCRIPT,
  LOGIN_TODAY_PLAYBOOK_CI_WORKFLOW,
  LOGIN_TODAY_PLAYBOOK_E2E_POLICY_ID,
  LOGIN_TODAY_PLAYBOOK_E2E_SPEC,
  LOGIN_TODAY_PLAYBOOK_FLOW_STEPS,
  LOGIN_TODAY_PLAYBOOK_NPM_SCRIPT,
  LOGIN_TODAY_PLAYBOOK_UNIT_TEST,
  PLAYBOOKS_PATH,
  TODAY_PATH,
  hasLoginTodayPlaybookCredentials,
  isAllowedPlaybookDestinationHref,
} from "@/lib/qa/login-today-playbook-e2e-policy";
import { shouldRenderPlaybookTodayStrip } from "@/lib/safety/null-reference-guards";

const ROOT = process.cwd();

describe("login → today → playbook E2E (P1-41)", () => {
  it("locks policy id and route contract", () => {
    expect(LOGIN_TODAY_PLAYBOOK_E2E_POLICY_ID).toBe("login-today-playbook-e2e-v1");
    expect(TODAY_PATH).toBe("/dashboard/today");
    expect(PLAYBOOKS_PATH).toBe("/dashboard/playbooks");
    expect(LOGIN_TODAY_PLAYBOOK_FLOW_STEPS).toHaveLength(4);
    expect(isAllowedPlaybookDestinationHref("/dashboard/playbooks/new")).toBe(true);
    expect(isAllowedPlaybookDestinationHref("/dashboard/today")).toBe(false);
  });

  it("playbook strip renders when recommendations or active runs exist", () => {
    expect(shouldRenderPlaybookTodayStrip([], [])).toBe(false);
    expect(shouldRenderPlaybookTodayStrip([{ id: "daily-open" }], [])).toBe(true);
    expect(shouldRenderPlaybookTodayStrip([], [{ id: "run-1" }])).toBe(true);
  });

  it("audits E2E spec, flow helper, and Today wiring", () => {
    const summary = auditLoginTodayPlaybookE2E(ROOT);
    expect(summary.specPresent).toBe(true);
    expect(summary.flowHelperPresent).toBe(true);
    expect(summary.todayPlaybookStripWired).toBe(true);
    expect(summary.playbooksPagePresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, LOGIN_TODAY_PLAYBOOK_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, LOGIN_TODAY_PLAYBOOK_E2E_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, LOGIN_TODAY_PLAYBOOK_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[LOGIN_TODAY_PLAYBOOK_NPM_SCRIPT]).toContain(
      "audit-login-today-playbook-e2e.ts",
    );
    expect(pkg.scripts?.["test:ci:login-today-playbook-e2e"]).toContain(
      LOGIN_TODAY_PLAYBOOK_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, LOGIN_TODAY_PLAYBOOK_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:login-today-playbook-e2e");
  });

  it("credentials gate is false without E2E env", () => {
    const originalEmail = process.env.E2E_LOGIN_EMAIL;
    const originalPassword = process.env.E2E_LOGIN_PASSWORD;
    delete process.env.E2E_LOGIN_EMAIL;
    delete process.env.E2E_LOGIN_PASSWORD;
    expect(hasLoginTodayPlaybookCredentials()).toBe(false);
    if (originalEmail !== undefined) process.env.E2E_LOGIN_EMAIL = originalEmail;
    if (originalPassword !== undefined) process.env.E2E_LOGIN_PASSWORD = originalPassword;
  });
});
