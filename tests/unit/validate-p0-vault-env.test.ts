import { describe, expect, it } from "vitest";

import {
  evaluateP0VaultEnv,
  P0_VAULT_ENV_KEYS,
  P0_VAULT_ENV_PHASES,
} from "../../scripts/ops/validate-p0-vault-env";
import { P0_STAGING_PROOF_UNBLOCK_ERA17_ENV_VAR_CATALOG } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";

describe("validate-p0-vault-env", () => {
  it("tracks all 11 canonical P0 env vars", () => {
    expect(P0_VAULT_ENV_KEYS).toHaveLength(11);
    expect(P0_VAULT_ENV_KEYS).toEqual(
      P0_STAGING_PROOF_UNBLOCK_ERA17_ENV_VAR_CATALOG.map((e) => e.key),
    );
  });

  it("partitions vars into four ops phases", () => {
    const phased = P0_VAULT_ENV_PHASES.flatMap((p) => p.keys);
    expect(phased).toHaveLength(11);
    expect(new Set(phased).size).toBe(11);
  });

  it("reports missing vars by phase", () => {
    const result = evaluateP0VaultEnv({
      E2E_STAGING_BASE_URL: "https://staging.example.com",
      E2E_LOGIN_EMAIL: "owner@example.com",
    });
    expect(result.present).toEqual(["E2E_STAGING_BASE_URL", "E2E_LOGIN_EMAIL"]);
    expect(result.missing).toContain("DATABASE_URL");
    expect(result.phases.find((p) => p.id === "staging_login")?.complete).toBe(false);
    expect(result.allPresent).toBe(false);
  });

  it("marks allPresent when every key is set", () => {
    const env = Object.fromEntries(P0_VAULT_ENV_KEYS.map((key) => [key, "set"])) as NodeJS.ProcessEnv;
    const result = evaluateP0VaultEnv(env);
    expect(result.allPresent).toBe(true);
    expect(result.missing).toHaveLength(0);
    expect(result.phases.every((p) => p.complete)).toBe(true);
  });
});
