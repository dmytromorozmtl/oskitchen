import type { StorefrontEnvCheck } from "@/lib/storefront/storefront-release-env";
import { storefrontReleaseEnvSummary } from "@/lib/storefront/storefront-release-env";

export type SmokeCheckRow = {
  id: string;
  label: string;
  pass: boolean;
  status?: number;
  detail?: string;
  category?: "http" | "local" | "manual";
};

export function formatEnvReportMarkdown(opts: {
  checks: StorefrontEnvCheck[];
  loadedFiles: string[];
  target: "production" | "staging" | "local";
}): string {
  const summary = storefrontReleaseEnvSummary(opts.checks);
  const date = new Date().toISOString();
  const lines = [
    "# Storefront environment report",
    "",
    `| Field | Value |`,
    `|-------|-------|`,
    `| Generated (UTC) | ${date} |`,
    `| Target | ${opts.target} |`,
    `| Loaded files | ${opts.loadedFiles.length ? opts.loadedFiles.join(", ") : "process.env only"} |`,
    `| Critical | ${summary.criticalFailed === 0 ? "PASS" : `FAIL (${summary.criticalFailed})`} |`,
    `| Warnings | ${summary.warningFailed} |`,
    "",
    "## Checks",
    "",
    "| Status | Level | Variable | Detail |",
    "|--------|-------|----------|--------|",
    ...opts.checks.map((c) => {
      const icon = c.passed ? "✓" : c.level === "critical" ? "✗" : "⚠";
      return `| ${icon} | ${c.level} | ${c.label} | ${c.detail} |`;
    }),
    "",
    "> Secret values are never printed. Set variables in Vercel → Settings → Environment Variables.",
    "",
  ];
  return lines.join("\n");
}

export function formatSmokeReportMarkdown(opts: {
  origin: string;
  storeSlug: string;
  results: SmokeCheckRow[];
  environment: string;
}): string {
  const passed = opts.results.filter((r) => r.pass).length;
  const total = opts.results.length;
  const lines = [
    "# Storefront HTTP smoke report",
    "",
    `| Field | Value |`,
    `|-------|-------|`,
    `| Date (UTC) | ${new Date().toISOString()} |`,
    `| Environment | ${opts.environment} |`,
    `| Base URL | ${opts.origin} |`,
    `| Slug | ${opts.storeSlug} |`,
    `| Result | ${passed}/${total} passed |`,
    "",
    "## Automated checks",
    "",
    "| ID | Check | Pass | Detail |",
    "|----|-------|------|--------|",
    ...opts.results.map((r) => `| ${r.id} | ${r.label} | ${r.pass ? "✓" : "✗"} | ${r.detail ?? r.status ?? "—"} |`),
    "",
  ];
  return lines.join("\n");
}

export function formatQaArtifactMarkdown(opts: {
  baseUrl: string;
  slug: string;
  stripeOption: "A" | "B" | "PENDING";
  smokeResults: SmokeCheckRow[];
  envCriticalPass: boolean;
  releaseTag?: string;
  smokeEnvironment?: "staging" | "production" | "local";
}): string {
  const date = new Date().toISOString().slice(0, 10);
  const smokePass = opts.smokeResults.every((r) => r.pass);
  const envLabel =
    opts.smokeEnvironment === "production"
      ? "production"
      : opts.smokeEnvironment === "staging"
        ? "staging"
        : "target";
  const manualItems = [
    { id: "draft", label: "Draft visible only to owner / preview cookie" },
    { id: "menu_visible", label: "Menu shows only storefrontVisible products" },
    { id: "product_slug", label: "Product resolves by UUID and publicSlug" },
    { id: "pay_later_e2e", label: "Pay-later: cart → checkout → confirmation + notes" },
    { id: "disabled_404", label: "Disabled storefront → 404 (guest)" },
    { id: "unpublished_404", label: "Unpublished storefront → 404 (guest)" },
    { id: "promo", label: "Promo: valid reduces total; invalid errors" },
    { id: "blackout", label: "Blackout date blocks checkout" },
    { id: "honeypot", label: "Honeypot companyUrl does not create submission" },
    ...(opts.stripeOption === "B"
      ? [{ id: "stripe_smoke", label: "Stripe 5-step smoke (webhook → paid)" }]
      : []),
  ];

  return [
    `# Storefront release QA artifact — ${date}`,
    "",
    "## Release metadata",
    "",
    "| Field | Value |",
    "|-------|-------|",
    `| Release tag / commit | ${opts.releaseTag ?? "_fill_"} |`,
    `| Environment | ${opts.smokeEnvironment ?? "staging → production"} |`,
    `| Base URL | ${opts.baseUrl} |`,
    `| Store slug | ${opts.slug} |`,
    `| Stripe decision | **Option ${opts.stripeOption}** |`,
    `| Automated smoke (${envLabel}) | ${smokePass ? "**PASS**" : "**FAIL**"} |`,
    `| Env critical (local file) | ${opts.envCriticalPass ? "**PASS**" : "**FAIL**"} |`,
    "",
    "## Release gates",
    "",
    "| Gate | Status | Owner | Unblock |",
    "|------|--------|-------|---------|",
    `| G1 Local preflight | ${opts.envCriticalPass ? "✅ PASS" : "🔴 FAIL"} | Engineering | \`npm run storefront:release-preflight\` |`,
    `| G2 HTTP smoke (${envLabel}) | ${smokePass ? "✅ PASS" : "🔴 FAIL"} | Engineering | Deploy + publish slug \`${opts.slug}\`; re-run \`storefront:qa-artifact\` |`,
    `| G3 Vercel P0 secrets | see checklist | Engineering | \`VERCEL_PRODUCTION_UPLOAD_CHECKLIST.md\` |`,
    `| G4 Manual QA (9 scenarios) | ☐ pending | Engineering + Product | \`STOREFRONT_MANUAL_QA_RUNBOOK.md\` |`,
    `| G5 Stripe Option A sign-off | ☐ Product | Product | \`STOREFRONT_STRIPE_SIGNOFF_RECORD.md\` |`,
    `| G6 Ship decision | ☐ | Product + Eng | All gates green |`,
    "",
    smokePass
      ? ""
      : [
          "### Smoke failure — typical fixes",
          "",
          "| Symptom | Fix |",
          "|---------|-----|",
          "| All routes **404** | Slug not published, wrong base URL, or deploy not live — run `npm run storefront:list-slugs` against prod DB |",
          "| **DEPLOYMENT_NOT_FOUND** on crons | Set real `STAGING_BASE_URL` / prod URL in Vercel + `CRON_SECRET` |",
          "| Placeholder URL in export | Use ASCII URL only in zsh (no Cyrillic in host) |",
          "",
        ].join("\n"),
    "## Automated HTTP smoke",
    "",
    "| Check | Pass | Detail |",
    "|-------|------|--------|",
    ...opts.smokeResults.map((r) => `| ${r.label} | ${r.pass ? "☑" : "☐"} | ${r.detail ?? "—"} |`),
    "",
    "## Manual smoke (required)",
    "",
    "| # | Scenario | Pass | Tester notes |",
    "|---|----------|------|--------------|",
    ...manualItems.map((m, i) => `| ${i + 1} | ${m.label} | ☐ | |`),
    "",
    "## Manual deep-dive — checkout / promo / blackout",
    "",
    "Complete in **incognito** on the same base URL as HTTP smoke. Record pass/fail in notes column above.",
    "",
    "### Pay-later checkout (required)",
    "",
    "| Step | Action | Expected | Pass |",
    "|------|--------|----------|------|",
    `| 1 | \`/s/${opts.slug}/menu\` → add item → Cart | Cart shows line items | ☐ |`,
    "| 2 | Checkout → fill name, email, fulfillment | No Stripe redirect (Option A) | ☐ |",
    "| 3 | Submit pay-later / request order | Confirmation page with order id | ☐ |",
    "| 4 | Order Hub (admin) | Order visible, total + notes match | ☐ |",
    "",
    "### Promo codes (required)",
    "",
    "| Case | Steps | Expected | Pass |",
    "|------|-------|----------|------|",
    "| Valid | Admin → Promotions → active code → apply at checkout | Total reduced | ☐ |",
    "| Invalid | Code `INVALID999` at checkout | Inline error; order not placed | ☐ |",
    "",
    "### Blackout date (required)",
    "",
    "| Step | Action | Expected | Pass |",
    "|------|--------|----------|------|",
    "| 1 | Admin → Ordering → blackout for test date | Saved | ☐ |",
    "| 2 | Checkout for blocked date | Clear block message; cannot complete | ☐ |",
    "| 3 | Remove blackout | Checkout allowed again | ☐ |",
    "",
    "## Stripe sign-off",
    "",
    `See \`docs/artifacts/STOREFRONT_STRIPE_SIGNOFF_RECORD.md\` — Option **${opts.stripeOption}**.`,
    "",
    "## Local preflight (repo)",
    "",
    "| Check | Status |",
    "|-------|--------|",
    "| `npm run storefront:release-preflight` | See `docs/artifacts/storefront-preflight-latest.md` |",
    "| `npm run storefront:vercel-manifest` | See `docs/artifacts/VERCEL_PRODUCTION_UPLOAD_CHECKLIST.md` |",
    "",
    "## Manual QA runbook",
    "",
    "Complete after HTTP smoke passes: `docs/artifacts/STOREFRONT_MANUAL_QA_RUNBOOK.md`",
    "",
    "## Deploy checklist",
    "",
    "- [ ] `vercel.json` crons = 6 (`npm run vercel:crons:production`)",
    "- [ ] Vercel Production secrets — `npm run storefront:vercel-manifest`",
    "- [ ] GitHub required checks: CI + Storefront staging gate",
    "- [ ] Post-deploy: `npm run storefront:post-deploy` on prod URL",
    "",
    "## Sign-off",
    "",
    "| Role | Name | Date | Approved |",
    "|------|------|------|----------|",
    "| Engineering | | | ☐ |",
    "| Product / Ops | | | ☐ |",
    "",
    "**Ship decision:** ☐ Ship ☐ Hold",
    "",
  ].join("\n");
}
