import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CROSS_CHANNEL_REWARDS_FORBIDDEN_GTM_PHRASES,
  CROSS_CHANNEL_REWARDS_GTM_DOCS,
  CROSS_CHANNEL_REWARDS_GTM_LOCK_ID,
  CROSS_CHANNEL_REWARDS_GTM_REQUIRED_MARKERS,
  CROSS_CHANNEL_REWARDS_UNIFICATION_STATUS,
  CROSS_CHANNEL_REWARDS_UNIFIED_CLAIM_ALLOWED,
} from "@/lib/rewards/cross-channel-rewards-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("cross-channel rewards GTM lock certification (live repo)", () => {
  it("locks era6 permanent dual-ledger GTM deferral", () => {
    expect(CROSS_CHANNEL_REWARDS_GTM_LOCK_ID).toBe("era6-dual-ledger-gtm-lock-v1");
    expect(CROSS_CHANNEL_REWARDS_UNIFICATION_STATUS).toBe("deferred_locked");
    expect(CROSS_CHANNEL_REWARDS_UNIFIED_CLAIM_ALLOWED).toBe(false);
  });

  it("documents GTM lock markers in canonical sales docs", () => {
    for (const rel of CROSS_CHANNEL_REWARDS_GTM_DOCS) {
      const path = join(ROOT, rel);
      expect(existsSync(path), `missing ${rel}`).toBe(true);
      const text = readFileSync(path, "utf8");
      for (const marker of CROSS_CHANNEL_REWARDS_GTM_REQUIRED_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker);
      }
      for (const phrase of CROSS_CHANNEL_REWARDS_FORBIDDEN_GTM_PHRASES) {
        expect(text, `${rel} contains forbidden "${phrase}"`).not.toContain(phrase);
      }
    }
  });

  it("includes GTM lock cert in cross-channel rewards CI bundle", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:cross-channel-rewards:cert"]).toContain(
      "cross-channel-rewards-gtm-lock-cert-live.test.ts",
    );
  });
});
