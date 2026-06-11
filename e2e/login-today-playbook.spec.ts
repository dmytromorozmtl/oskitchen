import { expect, test } from "@playwright/test";

import {
  LOGIN_PATH,
  LOGIN_TODAY_PLAYBOOK_E2E_POLICY_ID,
  LOGIN_TODAY_PLAYBOOK_FLOW_STEPS,
  PLAYBOOKS_PATH,
  TODAY_PATH,
  isAllowedPlaybookDestinationHref,
} from "@/lib/qa/login-today-playbook-e2e-policy";

import { runLoginTodayPlaybookFlow } from "./helpers/login-today-playbook-flow";
import { skipLoginTodayPlaybookIfNotAuthed } from "./helpers/login-today-playbook-ready";

/**
 * Login → Today → Playbook golden path.
 *
 * Fresh login → Today command center → playbooks hub (strip link or direct path).
 *
 * @see e2e/auth.setup.ts
 * @see e2e/signup-quick-start-today.spec.ts
 * @see components/dashboard/playbooks/playbook-today-strip.tsx
 */

test.describe("login today playbook policy", () => {
  test("exports authenticated flow route contract", () => {
    expect(LOGIN_TODAY_PLAYBOOK_E2E_POLICY_ID).toBe("login-today-playbook-e2e-v1");
    expect(LOGIN_PATH).toBe("/login");
    expect(TODAY_PATH).toBe("/dashboard/today");
    expect(PLAYBOOKS_PATH).toBe("/dashboard/playbooks");
    expect(LOGIN_TODAY_PLAYBOOK_FLOW_STEPS).toEqual([
      "login",
      "today",
      "playbook_navigation",
      "playbooks_hub",
    ]);
    expect(isAllowedPlaybookDestinationHref("/dashboard/playbooks/all")).toBe(true);
    expect(isAllowedPlaybookDestinationHref("https://evil.example")).toBe(false);
  });
});

test.describe("login today playbook (chromium-authed)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Login → Today → Playbook runs in chromium-authed project only",
    );
    skipLoginTodayPlaybookIfNotAuthed();
  });

  test("fresh login opens Today then playbooks hub", async ({ page }) => {
    const result = await runLoginTodayPlaybookFlow(page);
    expect(result.steps).toEqual(LOGIN_TODAY_PLAYBOOK_FLOW_STEPS);
    expect(isAllowedPlaybookDestinationHref(result.destinationPath)).toBe(true);
    expect(["playbook_strip_link", "direct_path"]).toContain(result.navigationSurface);
  });
});
