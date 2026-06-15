import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  assertCafeModeScreenCount,
  CAFE_MODE_P3_143_SCREENS,
} from "@/lib/pos/cafe-mode-p3-143-content";
import {
  CAFE_MODE_P3_143_COMPONENT,
  CAFE_MODE_P3_143_MAX_SCREENS,
  CAFE_MODE_P3_143_NAV_COMPONENT,
  CAFE_MODE_P3_143_PAGE,
  CAFE_MODE_P3_143_POLICY_ID,
  CAFE_MODE_P3_143_ROUTE,
  CAFE_MODE_P3_143_SCREEN_IDS,
} from "@/lib/pos/cafe-mode-p3-143-policy";

export type CafeModeScreenRecord = {
  id: string;
  label: string;
  testId: string;
  status: string;
};

export type CafeModePosRegistry = {
  version: string;
  policyId: typeof CAFE_MODE_P3_143_POLICY_ID;
  updatedAt: string;
  honestyNote: string;
  competitor: string;
  maxScreens: number;
  route: string;
  activeSessionCount: number;
  screens: CafeModeScreenRecord[];
};

export function loadCafeModePosRegistry(
  root = process.cwd(),
  artifactPath = "artifacts/cafe-mode-pos-registry.json",
): CafeModePosRegistry {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as CafeModePosRegistry;
}

export function validateCafeModePosRegistry(
  registry: CafeModePosRegistry,
): {
  valid: boolean;
  policyIdMatches: boolean;
  screenCountMatches: boolean;
  screensComplete: boolean;
  zeroActiveSessions: boolean;
} {
  const policyIdMatches = registry.policyId === CAFE_MODE_P3_143_POLICY_ID;

  const screenCountMatches =
    registry.maxScreens === CAFE_MODE_P3_143_MAX_SCREENS &&
    registry.route === CAFE_MODE_P3_143_ROUTE;

  const screensComplete =
    registry.screens.length === CAFE_MODE_P3_143_SCREEN_IDS.length &&
    CAFE_MODE_P3_143_SCREEN_IDS.every((screenId, index) => {
      const screen = registry.screens[index];
      const expected = CAFE_MODE_P3_143_SCREENS[index];
      return (
        screen?.id === screenId &&
        screen.testId === expected?.testId &&
        screen.status === "shipped"
      );
    });

  const zeroActiveSessions = registry.activeSessionCount === 0;

  const valid =
    policyIdMatches && screenCountMatches && screensComplete && zeroActiveSessions;

  return {
    valid,
    policyIdMatches,
    screenCountMatches,
    screensComplete,
    zeroActiveSessions,
  };
}

export function checkCafeModeLiveTerminalWiring(root = process.cwd()): boolean {
  const componentPath = join(root, CAFE_MODE_P3_143_COMPONENT);
  const navPath = join(root, CAFE_MODE_P3_143_NAV_COMPONENT);
  const pagePath = join(root, CAFE_MODE_P3_143_PAGE);

  if (!assertCafeModeScreenCount()) {
    return false;
  }

  const componentSource = readFileSync(componentPath, "utf8");
  const navSource = readFileSync(navPath, "utf8");
  const pageSource = readFileSync(pagePath, "utf8");

  const componentWired =
    componentSource.includes("CafeModeTerminal") &&
    componentSource.includes("cafe-mode-terminal") &&
    CAFE_MODE_P3_143_SCREEN_IDS.every((id) => componentSource.includes(`cafe-mode-screen-${id}`));

  const navWired =
    navSource.includes("CafeModeScreenNav") &&
    navSource.includes(String(CAFE_MODE_P3_143_MAX_SCREENS)) &&
    CAFE_MODE_P3_143_SCREEN_IDS.every((id) => navSource.includes(id));

  const pageWired =
    pageSource.includes("CafeModeTerminal") && pageSource.includes(CAFE_MODE_P3_143_ROUTE);

  return componentWired && navWired && pageWired;
}
