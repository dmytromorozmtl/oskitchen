/** Shared env gates for paid-pilot Playwright specs. */
export const pilotEnvReady =
  Boolean(process.env.E2E_PILOT_EMAIL?.trim()) &&
  Boolean(process.env.E2E_PILOT_PASSWORD?.trim()) &&
  Boolean(process.env.PLAYWRIGHT_BASE_URL?.trim());

export const pilotStaffEnvReady =
  Boolean(process.env.E2E_PILOT_STAFF_EMAIL?.trim()) &&
  Boolean(process.env.E2E_PILOT_STAFF_PASSWORD?.trim());
