import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditKdsDaisyChainConfigWiring } from "@/lib/kitchen/kds-daisy-chain-config-audit";
import {
  buildDaisyChainPaths,
  DEFAULT_KDS_DAISY_CHAIN_LINKS,
  KDS_DAISY_CHAIN_CONFIG_ABSOLUTE_FINAL_POLICY_ID,
  KDS_DAISY_CHAIN_CONFIG_ALOHA_PARITY_PILLARS,
  KDS_DAISY_CHAIN_CONFIG_CI_SCRIPTS,
  KDS_DAISY_CHAIN_CONFIG_ROUTE,
  KDS_DAISY_CHAIN_CONFIG_STORAGE_KEY,
  KDS_DAISY_CHAIN_CONFIG_UNIT_TEST,
  mergeKdsDaisyChainLinks,
  resolveDaisyChainNextStation,
} from "@/lib/kitchen/kds-daisy-chain-config-absolute-final-policy";
import { defaultStationNameById } from "@/services/kitchen/kds-daisy-chain-config-service";

const ROOT = process.cwd();

describe("KDS daisy-chain config (Absolute Final Task 93)", () => {
  it("locks NCR Aloha-parity policy, route, and storage key", () => {
    expect(KDS_DAISY_CHAIN_CONFIG_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "kds-daisy-chain-config-absolute-final-v1",
    );
    expect(KDS_DAISY_CHAIN_CONFIG_ROUTE).toBe("/dashboard/kitchen/daisy-chain");
    expect(KDS_DAISY_CHAIN_CONFIG_STORAGE_KEY).toBe("kdsDaisyChainConfig");
    expect(KDS_DAISY_CHAIN_CONFIG_ALOHA_PARITY_PILLARS).toHaveLength(5);
    expect(DEFAULT_KDS_DAISY_CHAIN_LINKS.length).toBe(20);
  });

  it("resolves bump handoff next station from enabled links", () => {
    const links = mergeKdsDaisyChainLinks(DEFAULT_KDS_DAISY_CHAIN_LINKS);
    expect(
      resolveDaisyChainNextStation("prep", links, { toStationId: "grill" }),
    ).toMatchObject({
      toStationId: "grill",
      linkId: "prep-grill",
    });
    expect(resolveDaisyChainNextStation("grill", links)).toMatchObject({
      toStationId: "expo",
      linkId: "grill-expo",
    });
    expect(resolveDaisyChainNextStation("prep", links)).toBeNull();

    const disabled = links.map((link) =>
      link.id === "grill-expo" ? { ...link, enabled: false } : link,
    );
    expect(resolveDaisyChainNextStation("grill", disabled)).toBeNull();
  });

  it("builds Prep → line → Expo chain path previews", () => {
    const names = defaultStationNameById();
    const paths = buildDaisyChainPaths(DEFAULT_KDS_DAISY_CHAIN_LINKS, names);
    expect(paths.some((p) => p.includes("Prep") && p.includes("Grill") && p.includes("Expo"))).toBe(
      true,
    );
    expect(paths.length).toBe(10);
  });

  it("passes wiring audit", () => {
    const audit = auditKdsDaisyChainConfigWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("registers CI cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of KDS_DAISY_CHAIN_CONFIG_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(KDS_DAISY_CHAIN_CONFIG_UNIT_TEST).toBe(
      "tests/unit/kds-daisy-chain-config-absolute-final.test.ts",
    );
  });
});
