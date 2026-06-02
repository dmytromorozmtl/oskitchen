import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_COMMANDS,
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_FORBIDDEN_SALES_CLAIMS,
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_NPM_SCRIPT,
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_ORCHESTRATOR_SCRIPT,
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_POLICY_ID,
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_STRICT_ENV,
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_STRICT_ENV_VALUE,
} from "@/lib/commercial/pilot-forbidden-claims-enforcement-era17-policy";
import {
  MARKETING_CLAIMS_FORBIDDEN_PHRASES,
  MARKETING_CLAIMS_SCAN_ROOTS,
  contextHasSafeQualifier,
  findForbiddenPhraseViolations,
  findRoadmapTermViolations,
  scanMarketingText,
} from "@/lib/governance/marketing-claims-governance-policy";

const ROOT = process.cwd();

/** Hype / overclaim terms banned from customer-facing marketing (task 17 + GTM guardrails). */
const FORBIDDEN_HYPE_TERMS = [
  "untouchable",
  "unbreakable moat",
  "100% accurate",
  "always correct",
  "perfect predictions",
  "guaranteed loan approval",
] as const;

/** Affirmative patterns for Era 17 pilot forbidden sales claims — allowed only when negated/qualified. */
const PILOT_FORBIDDEN_AFFIRMATIVE_PATTERNS: { claim: string; pattern: RegExp }[] = [
  { claim: "production SSO", pattern: /\b(production|live|included)\s+sso\b/i },
  { claim: "SOC2 Type II", pattern: /\bsoc\s*2\s*type\s*ii\s*(certified|compliant|approved)\b/i },
  { claim: "SCIM", pattern: /\bscim\s+(included|production|live)\b/i },
  { claim: "unified inventory", pattern: /\bunified\s+(cross-channel\s+)?inventory\b/i },
  { claim: "offline POS", pattern: /\boffline\s+pos\s+(ready|included|available)\b/i },
  { claim: "rush-hour KDS", pattern: /\brush[- ]hour\s+kds\s+(certified|production)\b/i },
  {
    claim: "live marketplace integrations",
    pattern: /\blive\s+marketplace\s+integrations?\b/i,
  },
];

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

function collectTextFromRoots(roots: readonly string[]): { label: string; text: string }[] {
  const sources: { label: string; text: string }[] = [];

  for (const rel of roots) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) continue;
    try {
      const stat = statSync(full);
      if (stat.isFile()) {
        sources.push({ label: rel, text: readFileSync(full, "utf8") });
        continue;
      }
      for (const name of readdirSync(full)) {
        const path = join(full, name);
        if (/\.(tsx?|md)$/.test(name) && statSync(path).isFile()) {
          sources.push({ label: join(rel, name), text: readFileSync(path, "utf8") });
        }
      }
    } catch {
      /* skip unreadable roots */
    }
  }

  return sources;
}

function readScannedMarketingSources() {
  return collectTextFromRoots(MARKETING_CLAIMS_SCAN_ROOTS);
}

describe("forbidden claims enforcement", () => {
  it("links pilot forbidden-claims policy to marketing governance", () => {
    expect(PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_POLICY_ID).toBe(
      "era17-pilot-forbidden-claims-enforcement-v1",
    );
    expect(PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_COMMANDS).toContain("verify-claims");
    expect(PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_FORBIDDEN_SALES_CLAIMS.length).toBeGreaterThanOrEqual(
      7,
    );
  });

  it("wires verify-claims and pilot smoke scripts in package.json", () => {
    const scripts = readPackageScripts();
    expect(scripts["verify-claims"]).toContain("verify-marketing-claims.ts");
    expect(scripts[PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_NPM_SCRIPT]).toContain(
      "smoke-pilot-forbidden-claims-enforcement",
    );
    expect(existsSync(join(ROOT, PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_ORCHESTRATOR_SCRIPT))).toBe(
      true,
    );
  });

  it("documents strict mode env for release-branch enforcement", () => {
    expect(PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_STRICT_ENV).toBe("MARKETING_CLAIMS_STRICT");
    expect(PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_STRICT_ENV_VALUE).toBe("1");
    const training = readFileSync(join(ROOT, "marketing/forbidden-claims-training.md"), "utf8");
    expect(training).toContain("verify-claims");
    expect(training).toContain(PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_POLICY_ID);
  });

  it("scanned marketing surfaces contain no governance forbidden phrases", () => {
    const sources = readScannedMarketingSources();
    expect(sources.length).toBeGreaterThan(0);

    const violations = sources.flatMap(({ label, text }) => scanMarketingText(text, label));
    const forbidden = violations.filter((v) => v.kind === "forbidden");
    expect(
      forbidden,
      forbidden.map((v) => `${v.sourceLabel}: ${v.termId}`).join("\n"),
    ).toEqual([]);
  });

  it("scanned marketing surfaces qualify roadmap integration terms", () => {
    const combined = readScannedMarketingSources()
      .map((s) => s.text)
      .join("\n");
    const roadmap = findRoadmapTermViolations(combined, "live-marketing-scan");
    expect(
      roadmap,
      roadmap.map((v) => `${v.termId}: ${v.context.slice(0, 120)}`).join("\n"),
    ).toEqual([]);
  });

  it("blocks hype / untouchable language in marketing scan roots", () => {
    const combined = readScannedMarketingSources()
      .map((s) => s.text)
      .join("\n")
      .toLowerCase();

    for (const term of FORBIDDEN_HYPE_TERMS) {
      expect(combined, `forbidden hype term "${term}" in marketing surfaces`).not.toContain(term);
    }
  });

  it("blocks affirmative pilot forbidden sales claims in marketing surfaces", () => {
    const sources = readScannedMarketingSources();

    for (const { label, text } of sources) {
      for (const { claim, pattern } of PILOT_FORBIDDEN_AFFIRMATIVE_PATTERNS) {
        const match = pattern.exec(text);
        if (!match) continue;
        const idx = match.index;
        const context = text.slice(Math.max(0, idx - 200), idx + match[0].length + 200);
        expect(
          contextHasSafeQualifier(context),
          `unqualified "${claim}" in ${label}: …${context.replace(/\s+/g, " ").trim().slice(0, 160)}…`,
        ).toBe(true);
      }
    }
  });

  it("forbidden phrase detector catches matrix-conflict examples", () => {
    for (const phrase of MARKETING_CLAIMS_FORBIDDEN_PHRASES.slice(0, 3)) {
      const sample = `Marketing copy: ${phrase} for every customer.`;
      expect(findForbiddenPhraseViolations(sample)).toHaveLength(1);
    }
  });

  it("CI quality job references verify-claims gate", () => {
    const ci = readFileSync(join(ROOT, ".github/workflows/ci.yml"), "utf8");
    expect(ci).toContain("verify-claims");
    expect(ci).toContain("Marketing vs capability matrix");
  });

  it("wires forbidden claims enforcement auto-test in CI and package.json", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:forbidden-claims-enforcement"]).toContain(
      "forbidden-claims-enforcement.test.ts",
    );
    expect(scripts["test:ci:forbidden-claims-enforcement"]).toContain("verify-claims");

    const ci = readFileSync(join(ROOT, ".github/workflows/ci.yml"), "utf8");
    expect(ci).toContain("Forbidden claims enforcement auto-test");
    expect(ci).toContain("test:ci:forbidden-claims-enforcement");
    expect(ci).toContain("MARKETING_CLAIMS_STRICT");
  });
});
