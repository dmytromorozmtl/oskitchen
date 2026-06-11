import { test } from "@playwright/test";

import { hasLoginTodayPlaybookCredentials } from "@/lib/qa/login-today-playbook-e2e-policy";

export function skipLoginTodayPlaybookIfNotAuthed(): void {
  if (!hasLoginTodayPlaybookCredentials()) {
    test.skip(
      true,
      "Login → Today → Playbook E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}
