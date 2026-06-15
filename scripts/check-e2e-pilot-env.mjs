#!/usr/bin/env node
/** Guard for `npm run test:e2e:pilot` — requires deployed/staging base URL + pilot owner creds. */
const email = process.env.E2E_PILOT_EMAIL?.trim();
const password = process.env.E2E_PILOT_PASSWORD?.trim();
const baseUrl = process.env.PLAYWRIGHT_BASE_URL?.trim();

if (!email || !password || !baseUrl) {
  console.error(
    [
      "Pilot journey E2E requires:",
      "  export PLAYWRIGHT_BASE_URL=https://staging.example.com",
      "  export E2E_PILOT_EMAIL=owner@pilot.example.com",
      "  export E2E_PILOT_PASSWORD=...",
      "",
      "Optional staff tenancy check (same workspace):",
      "  export E2E_PILOT_STAFF_EMAIL=staff@pilot.example.com",
      "  export E2E_PILOT_STAFF_PASSWORD=...",
      "",
      "Prerequisites on the target DB:",
      "  - workspace migrations applied",
      "  - npm run workspace:backfill:phase1 (and phase2 when ready)",
      "",
      "See docs/E2E_PILOT_JOURNEY.md",
    ].join("\n"),
  );
  process.exit(1);
}
