import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  shouldSuppressEra21CommercialPilotGatePanels,
  shouldSuppressEra25ProductConvergenceSurfaces,
} from "@/lib/commercial/pure-operational-mode-terminus-ui-era25";

const ROOT = process.cwd();

describe("pure-operational-mode-terminus-era25-steady-state-stack", () => {
  it("suppresses era21 gate panels and era25 convergence when terminus active", () => {
    expect(
      shouldSuppressEra21CommercialPilotGatePanels({ pureOperationalModeEra25Active: true }),
    ).toBe(true);
    expect(
      shouldSuppressEra25ProductConvergenceSurfaces({ pureOperationalModeEra25Active: true }),
    ).toBe(true);
    expect(
      shouldSuppressEra21CommercialPilotGatePanels({ pureOperationalModeEra25Active: false }),
    ).toBe(false);
  });

  it("wires steady-state stack surfaces in hero and platform ops", () => {
    const hero = readFileSync(
      join(ROOT, "components/dashboard/owner-daily-briefing-hero.tsx"),
      "utf8",
    );
    expect(hero).toContain("PureOperationalModeTerminusEra25Strip");
    expect(hero).toContain("suppressEra21GatePanels");

    const platformOps = readFileSync(
      join(ROOT, "components/platform/commercial-pilot-ops-status-panel.tsx"),
      "utf8",
    );
    expect(platformOps).toContain("era25-pure-operational-mode-terminus");
    expect(platformOps).toContain("suppressEra21GatePanels");

    const today = readFileSync(join(ROOT, "app/dashboard/today/page.tsx"), "utf8");
    expect(today).toContain("OwnerDailyBriefingHeroSection");
    const briefingSection = readFileSync(
      join(ROOT, "components/dashboard/today/owner-daily-briefing-hero-section.tsx"),
      "utf8",
    );
    expect(briefingSection).toContain("pureOperationalModeEra25Active");
  });

  it("exposes terminus fields on owner daily briefing payload", () => {
    const service = readFileSync(
      join(ROOT, "services/briefing/owner-daily-briefing-service.ts"),
      "utf8",
    );
    expect(service).toContain("pureOperationalModeEra25Active");
    expect(service).toContain("pureOperationalModeTerminus");
    expect(service).toContain("export type OwnerDailyBriefingPayload");
  });
});
