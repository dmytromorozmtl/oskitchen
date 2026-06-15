import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  WEBHOOK_REPLAY_HARDENING_ERA16_CANONICAL_DOC_PATHS,
  WEBHOOK_REPLAY_HARDENING_ERA16_CANONICAL_MARKERS,
  WEBHOOK_REPLAY_HARDENING_ERA16_CI_SCRIPTS,
  WEBHOOK_REPLAY_HARDENING_ERA16_FORBIDDEN_CLAIMS,
  WEBHOOK_REPLAY_HARDENING_ERA16_GUARD_MODULE,
  WEBHOOK_REPLAY_HARDENING_ERA16_POLICY_ID,
  WEBHOOK_REPLAY_HARDENING_ERA16_REVIEW_SECTION,
  WEBHOOK_REPLAY_HARDENING_ERA16_UNIT_TESTS,
} from "@/lib/security/webhook-replay-hardening-era16-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("webhook replay hardening era16 CI certification (live repo)", () => {
  it("locks era16 replay hardening policy id", () => {
    expect(WEBHOOK_REPLAY_HARDENING_ERA16_POLICY_ID).toBe(
      "era16-webhook-replay-hardening-v1",
    );
  });

  it("defines replay hardening scripts chained into webhook security cert", () => {
    const scripts = readPackageScripts();
    for (const name of WEBHOOK_REPLAY_HARDENING_ERA16_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:webhook-security-era16:cert"]).toContain(
      "webhook-replay-hardening-era16-cert-live",
    );
  });

  it("wires guard module and prisma ingress dedupe migration", () => {
    expect(existsSync(join(ROOT, WEBHOOK_REPLAY_HARDENING_ERA16_GUARD_MODULE))).toBe(true);
    expect(
      existsSync(
        join(ROOT, "prisma/migrations/20260528130000_webhook_ingress_dedupe/migration.sql"),
      ),
    ).toBe(true);
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    expect(schema).toContain("model WebhookIngressDedupe");
  });

  it("documents replay hardening in canonical docs without forbidden claims", () => {
    for (const rel of WEBHOOK_REPLAY_HARDENING_ERA16_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of WEBHOOK_REPLAY_HARDENING_ERA16_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
      for (const forbidden of WEBHOOK_REPLAY_HARDENING_ERA16_FORBIDDEN_CLAIMS) {
        expect(text).not.toContain(forbidden.toLowerCase());
      }
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(WEBHOOK_REPLAY_HARDENING_ERA16_REVIEW_SECTION);
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(WEBHOOK_REPLAY_HARDENING_ERA16_POLICY_ID);
    for (const rel of WEBHOOK_REPLAY_HARDENING_ERA16_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
