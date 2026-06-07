import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditKdsDaisyChainConfigWiring } from "@/lib/kitchen/kds-daisy-chain-config-audit";
import {
  buildDaisyChainPaths,
  DEFAULT_KDS_DAISY_CHAIN_LINKS,
  KDS_DAISY_CHAIN_CONFIG_ABSOLUTE_FINAL_POLICY_ID,
  KDS_DAISY_CHAIN_CONFIG_ALOHA_PARITY_PILLARS,
  KDS_DAISY_CHAIN_CONFIG_ROUTE,
  KDS_DAISY_CHAIN_CONFIG_STORAGE_KEY,
  mergeKdsDaisyChainLinks,
  parseKdsDaisyChainConfig,
  resolveDaisyChainNextStation,
} from "@/lib/kitchen/kds-daisy-chain-config-absolute-final-policy";
import { auditQaFullCoverageSlot } from "@/lib/qa/absolute-final-qa-full-coverage-audit";
import {
  getQaFullCoverageSlot,
  QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/qa/absolute-final-qa-full-coverage-policy";
import { defaultStationNameById } from "@/services/kitchen/kds-daisy-chain-config-service";

const ROOT = process.cwd();
/** Absolute Final Task 108 — QA full coverage for feature 93 KDS daisy-chain config */
const TASK = 108;
const FEATURE = 93;

describe(`QA full coverage — KDS daisy-chain config (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks QA registry slot 108 → feature 93 NCR Aloha daisy-chain config", () => {
    expect(QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-qa-full-coverage-v1");
    const slot = getQaFullCoverageSlot(TASK);
    expect(slot?.featureKey).toBe("kds-daisy-chain-config");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.baseCertTest).toBe("tests/unit/kds-daisy-chain-config-absolute-final.test.ts");
    expect(KDS_DAISY_CHAIN_CONFIG_ALOHA_PARITY_PILLARS).toHaveLength(5);
    expect(KDS_DAISY_CHAIN_CONFIG_ROUTE).toBe("/dashboard/kitchen/daisy-chain");
    expect(KDS_DAISY_CHAIN_CONFIG_STORAGE_KEY).toBe("kdsDaisyChainConfig");
  });

  it("merges custom links with defaults and preserves unknown link ids", () => {
    const merged = mergeKdsDaisyChainLinks(null);
    expect(merged).toHaveLength(DEFAULT_KDS_DAISY_CHAIN_LINKS.length);
    expect(merged.every((link) => link.enabled)).toBe(true);

    const custom = mergeKdsDaisyChainLinks([
      { id: "grill-expo", fromStationId: "grill", toStationId: "expo", label: "Custom", enabled: false },
    ]);
    const grillExpo = custom.find((link) => link.id === "grill-expo");
    expect(grillExpo?.enabled).toBe(false);
    expect(grillExpo?.label).toBe("Custom");
    expect(custom.find((link) => link.id === "prep-grill")?.enabled).toBe(true);
  });

  it("resolves bump handoff with explicit target, ambiguity guard, and disabled links", () => {
    const links = mergeKdsDaisyChainLinks(DEFAULT_KDS_DAISY_CHAIN_LINKS);

    expect(resolveDaisyChainNextStation("prep", links, { toStationId: "grill" })).toMatchObject({
      toStationId: "grill",
      linkId: "prep-grill",
    });
    expect(resolveDaisyChainNextStation("prep", links, { toStationId: "missing" })).toBeNull();
    expect(resolveDaisyChainNextStation("prep", links)).toBeNull();

    const disabled = links.map((link) =>
      link.id === "grill-expo" ? { ...link, enabled: false } : link,
    );
    expect(resolveDaisyChainNextStation("grill", disabled)).toBeNull();
    expect(resolveDaisyChainNextStation("grill", links)).toMatchObject({ toStationId: "expo" });
  });

  it("parses settingsCenterJson config with malformed rows and defaults fallback", () => {
    expect(parseKdsDaisyChainConfig(null).links.length).toBe(DEFAULT_KDS_DAISY_CHAIN_LINKS.length);
    expect(parseKdsDaisyChainConfig([]).links.length).toBe(DEFAULT_KDS_DAISY_CHAIN_LINKS.length);

    const parsed = parseKdsDaisyChainConfig({
      version: 1,
      links: [
        { id: "prep-grill", fromStationId: "prep", toStationId: "grill", enabled: false },
        { id: "bad", fromStationId: 1 },
        null,
      ],
    });
    const prepGrill = parsed.links.find((link) => link.id === "prep-grill");
    expect(prepGrill?.enabled).toBe(false);
    expect(parsed.links.some((link) => link.id === "bad")).toBe(false);
  });

  it("builds chain path previews that omit disabled specialty segments", () => {
    const names = defaultStationNameById();
    const allPaths = buildDaisyChainPaths(DEFAULT_KDS_DAISY_CHAIN_LINKS, names);
    expect(allPaths.some((path) => path.includes("Grill") && path.includes("Expo"))).toBe(true);

    const disabledGrill = DEFAULT_KDS_DAISY_CHAIN_LINKS.map((link) =>
      link.id === "grill-expo" ? { ...link, enabled: false } : link,
    );
    const partialPaths = buildDaisyChainPaths(disabledGrill, names);
    expect(partialPaths.some((path) => path.startsWith("Prep → Grill") && !path.includes("Expo"))).toBe(
      true,
    );
  });

  it("documents honesty markers — BETA, NCR Aloha parity, bump handoff, settingsCenterJson", () => {
    const panel = readFileSync(
      join(ROOT, "components/dashboard/kitchen/kds-daisy-chain-config-panel.tsx"),
      "utf8",
    );
    const page = readFileSync(join(ROOT, "app/dashboard/kitchen/daisy-chain/page.tsx"), "utf8");
    const combined = `${panel}\n${page}`;

    for (const marker of [
      "NCR Aloha parity",
      "BETA",
      "bump handoff",
      "settingsCenterJson",
      "proprietary",
      "terminal hub sync",
    ]) {
      expect(combined.includes(marker)).toBe(true);
    }
  });

  it("wires daisy-chain UI — toggle forms, chain paths, bump preview, routing links", () => {
    const panel = readFileSync(
      join(ROOT, "components/dashboard/kitchen/kds-daisy-chain-config-panel.tsx"),
      "utf8",
    );
    const page = readFileSync(join(ROOT, "app/dashboard/kitchen/daisy-chain/page.tsx"), "utf8");
    const actions = readFileSync(join(ROOT, "actions/kitchen/daisy-chain.ts"), "utf8");

    expect(panel).toContain('data-testid="kds-daisy-chain-config-panel"');
    expect(panel).toContain('data-testid="kds-daisy-chain-path"');
    expect(panel).toContain('data-testid="kds-daisy-chain-link-row"');
    expect(panel).toContain('data-testid="kds-daisy-chain-bump-preview-row"');
    expect(panel).toContain("toggleKdsDaisyChainLinkAction");
    expect(panel).toContain("/dashboard/kitchen/routing-rules");
    expect(page).toContain("KdsDaisyChainConfigPanel");
    expect(page).toContain("kitchen.configure");
    expect(actions).toContain('revalidatePath("/dashboard/kitchen/daisy-chain")');
    expect(actions).toContain("toggleKdsDaisyChainLink");
  });

  it("passes base wiring audit and QA slot 108 audit gate", () => {
    const wiring = auditKdsDaisyChainConfigWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);

    const qa = auditQaFullCoverageSlot(TASK, ROOT);
    expect(qa.ok, qa.failures.join("; ")).toBe(true);
    expect(qa.slot?.qaTest).toBe(
      "tests/unit/absolute-final-qa-full-coverage-08-kds-daisy-chain.test.ts",
    );
    expect(KDS_DAISY_CHAIN_CONFIG_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "kds-daisy-chain-config-absolute-final-v1",
    );
  });
});
