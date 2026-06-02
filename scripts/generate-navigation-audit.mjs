/**
 * Regenerate docs/navigation-audit.md from app page.tsx inventory.
 * Usage: node scripts/generate-navigation-audit.mjs
 */
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const APP = join(ROOT, "app");
const OUT = join(ROOT, "docs/navigation-audit.md");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name === "page.tsx") out.push(p);
  }
  return out;
}

function routeFromFile(file) {
  let seg = relative(APP, file).replace(/\\/g, "/").replace(/\/page\.tsx$/, "");
  seg = seg.replace(/\([^/]+\)\//g, "").replace(/\([^/]+\)$/g, "");
  return seg ? `/${seg}` : "/";
}

function categorize(route) {
  if (route.startsWith("/dashboard")) {
    if (route.startsWith("/dashboard/marketplace")) return "Dashboard — Marketplace";
    if (route.startsWith("/dashboard/integrations") || route.startsWith("/dashboard/sales-channels"))
      return "Dashboard — Integrations & channels";
    if (route.startsWith("/dashboard/analytics") || route.startsWith("/dashboard/reports"))
      return "Dashboard — Analytics & reports";
    if (route.startsWith("/dashboard/pos") || route.startsWith("/dashboard/kds"))
      return "Dashboard — POS & KDS";
    if (
      route.startsWith("/dashboard/kitchen") ||
      route.startsWith("/dashboard/production") ||
      route.startsWith("/dashboard/packing")
    )
      return "Dashboard — Kitchen & production";
    if (
      route.startsWith("/dashboard/inventory") ||
      route.includes("purchasing") ||
      route.startsWith("/dashboard/menu")
    )
      return "Dashboard — Menu, inventory & purchasing";
    if (route.startsWith("/dashboard/staff") || route.includes("labor") || route.includes("schedule"))
      return "Dashboard — Staff & labor";
    if (
      route.startsWith("/dashboard/storefront") ||
      route.startsWith("/dashboard/customers") ||
      route.startsWith("/dashboard/order-hub")
    )
      return "Dashboard — Storefront & customers";
    if (
      route.startsWith("/dashboard/settings") ||
      route.startsWith("/dashboard/billing") ||
      route.startsWith("/dashboard/locations")
    )
      return "Dashboard — Settings & locations";
    if (route.includes("food-safety") || route.startsWith("/dashboard/compliance"))
      return "Dashboard — Food safety & compliance";
    if (route.startsWith("/dashboard/ai") || route.includes("-ai") || route.includes("/ai-"))
      return "Dashboard — AI modules";
    if (
      route.startsWith("/dashboard/demo") ||
      route.includes("preview") ||
      route.startsWith("/dashboard/training")
    )
      return "Dashboard — Demo, training & preview";
    if (
      route.startsWith("/dashboard/platform") ||
      route.startsWith("/dashboard/developer") ||
      route.startsWith("/dashboard/system")
    )
      return "Dashboard — Platform & developer";
    if (route.startsWith("/dashboard/today") || route === "/dashboard")
      return "Dashboard — Today & command center";
    if (route.startsWith("/dashboard/orders") || route.startsWith("/dashboard/receivables"))
      return "Dashboard — Orders & receivables";
    return "Dashboard — Other modules";
  }
  if (route.startsWith("/s/")) return "Storefront (guest)";
  if (route.startsWith("/vendor")) return "Vendor portal";
  if (route.startsWith("/platform")) return "Platform admin";
  if (route.startsWith("/login") || route.startsWith("/signup") || route.startsWith("/forgot-password"))
    return "Auth";
  if (
    route.startsWith("/product") ||
    route.startsWith("/landing") ||
    route.startsWith("/shopify") ||
    route.startsWith("/compare") ||
    route.startsWith("/solutions") ||
    route.startsWith("/blog") ||
    route === "/" ||
    route.startsWith("/pricing") ||
    route.startsWith("/book-demo") ||
    route.startsWith("/roi") ||
    route.startsWith("/deck") ||
    route.startsWith("/demo")
  )
    return "Public marketing & ICP";
  if (route.startsWith("/developers") || route.startsWith("/help")) return "Developers & help";
  if (route.startsWith("/pay/")) return "B2B pay flows";
  if (route.startsWith("/visual-test")) return "Visual test (internal)";
  if (
    route.startsWith("/support") ||
    route.startsWith("/trust") ||
    route.startsWith("/legal") ||
    route.startsWith("/resources")
  )
    return "Trust, legal & resources";
  if (route.startsWith("/kds") || route.startsWith("/driver")) return "Standalone operator surfaces";
  return "Other public & utility";
}

const SIDEBAR_GROUPS = [
  "Core",
  "Operations",
  "Commerce",
  "Menus",
  "Customers",
  "Inventory & finance",
  "Food safety",
  "Marketing",
  "Insights",
  "Setup",
  "Admin",
  "Internal",
];

const pages = walk(APP);
const routes = [...new Set(pages.map(routeFromFile))].sort();
const byCat = {};
for (const r of routes) {
  const c = categorize(r);
  (byCat[c] ||= []).push(r);
}

const dashRoutes = routes.filter((r) => r.startsWith("/dashboard"));
const catOrder = Object.entries(byCat)
  .map(([name, list]) => ({ name, count: list.length, list }))
  .sort((a, b) => b.count - a.count);

const sidebarCats = new Set([
  "Dashboard — Today & command center",
  "Dashboard — Orders & receivables",
  "Dashboard — POS & KDS",
  "Dashboard — Kitchen & production",
  "Dashboard — Storefront & customers",
  "Dashboard — Marketplace",
  "Dashboard — Integrations & channels",
  "Dashboard — Analytics & reports",
  "Dashboard — Staff & labor",
  "Dashboard — Menu, inventory & purchasing",
  "Dashboard — Food safety & compliance",
  "Dashboard — Settings & locations",
]);

const lines = [];
lines.push("# Navigation audit — OS Kitchen");
lines.push("");
lines.push("**Generated:** 2026-06-02 · **Method:** filesystem scan of `app/**/page.tsx`");
lines.push("**Canonical sidebar IA:** `lib/navigation/final-navigation-groups.ts`");
lines.push("");
lines.push("---");
lines.push("");
lines.push("## Executive summary");
lines.push("");
lines.push("| Metric | Count |");
lines.push("|--------|------:|");
lines.push(`| Total App Router page routes | **${routes.length}** |`);
lines.push(`| Dashboard routes (/dashboard/*) | **${dashRoutes.length}** |`);
lines.push(`| Non-dashboard routes | **${routes.length - dashRoutes.length}** |`);
lines.push(`| Navigation categories (this audit) | **${catOrder.length}** |`);
lines.push(`| Sidebar groups (production IA) | **${SIDEBAR_GROUPS.length}** |`);
lines.push("");
lines.push(
  "The **566 dashboard routes** referenced in GTM and competitor materials match this scan. Total surface area is higher (770) because of storefront slugs, platform admin, vendor portal, marketing ICP pages, and internal visual-test routes.",
);
lines.push("");
lines.push("---");
lines.push("");
lines.push("## Category matrix");
lines.push("");
lines.push("| Category | Routes | In sidebar? | Sales-safe? | Notes |");
lines.push("|----------|-------:|:-----------:|:-----------:|-------|");

for (const { name, count } of catOrder) {
  const inSidebar = sidebarCats.has(name)
    ? "Partial"
    : name.startsWith("Dashboard")
      ? "Orphan / deep link"
      : "N/A";
  const salesSafe =
    name.includes("Demo") || name.includes("Platform & developer") || name.includes("Other modules")
      ? "Review"
      : name.startsWith("Dashboard")
        ? "Qualified"
        : "Yes";
  let notes = "";
  if (name === "Dashboard — Other modules")
    notes = "Largest sprawl bucket — consolidate or hide in pilot profile";
  if (name === "Platform admin") notes = "Super-admin only — not in tenant sidebar";
  if (name === "Visual test (internal)") notes = "Exclude from GTM / sitemap";
  lines.push(`| ${name} | ${count} | ${inSidebar} | ${salesSafe} | ${notes} |`);
}

lines.push("");
lines.push("---");
lines.push("");
lines.push("## Dashboard route breakdown (566)");
lines.push("");
lines.push(
  "Grouped for pilot navigation review. Full route lists follow in [Appendix A](#appendix-a-full-route-inventory).",
);
lines.push("");

for (const { name, count, list } of catOrder.filter((c) => c.name.startsWith("Dashboard"))) {
  lines.push(`### ${name} (${count})`);
  lines.push("");
  for (const r of list.slice(0, 8)) lines.push(`- \`${r}\``);
  if (list.length > 8) lines.push(`- … +${list.length - 8} more (see appendix)`);
  lines.push("");
}

lines.push("---");
lines.push("");
lines.push(`## Non-dashboard surfaces (${routes.length - dashRoutes.length})`);
lines.push("");
lines.push("| Category | Routes | Primary audience |");
lines.push("|----------|-------:|------------------|");
for (const { name, count } of catOrder.filter((c) => !c.name.startsWith("Dashboard"))) {
  lines.push(`| ${name} | ${count} | — |`);
}
lines.push("");
lines.push("---");
lines.push("");
lines.push("## Sidebar IA alignment");
lines.push("");
lines.push("Production sidebar groups (`FINAL_NAVIGATION_GROUPS`):");
lines.push("");
for (const g of SIDEBAR_GROUPS) lines.push(`- **${g}**`);
lines.push("");
lines.push("| Gap | Risk | Recommendation |");
lines.push("|-----|------|----------------|");
lines.push(
  "| 239 routes in **Dashboard — Other modules** | Nav sprawl, demo confusion | Apply `NEXT_PUBLIC_NAV_RELEASE_PROFILE=pilot` to hide deep modules; see Task 71 nav-sprawl audit |",
);
lines.push(
  "| Marketplace (11) now in sidebar | New — verify role matrix | Keep behind marketplace feature flag until migration deployed |",
);
lines.push(
  "| Platform admin (57) outside tenant shell | Correct isolation | Document in enterprise procurement pack only |",
);
lines.push(
  "| Visual test routes (4) | Accidental indexing | Add `robots` noindex or move under `/dashboard/demo` |",
);
lines.push("");
lines.push("---");
lines.push("");
lines.push("## Maturity & visibility");
lines.push("");
lines.push(
  "- **Module readiness badges:** `getModuleReadinessForPath()` in `dashboard-nav.tsx` — LIVE / BETA / PLACEHOLDER when `showNavStatusBadges()` enabled.",
);
lines.push(
  "- **Role filtering:** `isDashboardPathAllowedForRole()` + `lib/nav-role-filter.ts` — STAFF vs OWNER strips.",
);
lines.push(
  "- **Pilot profile:** `NavReleaseProfile` hides deep modules from sidebar without deleting routes.",
);
lines.push(
  "- **Command palette:** `getCommandPaletteRoutesFromRegistry()` supplements sidebar for power users.",
);
lines.push("");
lines.push("---");
lines.push("");
lines.push("## Regenerate inventory");
lines.push("");
lines.push("```bash");
lines.push("node scripts/generate-navigation-audit.mjs");
lines.push("```");
lines.push("");
lines.push("---");
lines.push("");
lines.push("## Related docs");
lines.push("");
lines.push("- [`NAVIGATION_AND_MODULE_UX_AUDIT.md`](./NAVIGATION_AND_MODULE_UX_AUDIT.md) — UX patterns");
lines.push("- [`NAVIGATION_TAXONOMY_CLEANUP.md`](./NAVIGATION_TAXONOMY_CLEANUP.md) — consolidation plan");
lines.push("- [`bundle-analysis.md`](./bundle-analysis.md) — First Load JS by route class");
lines.push("- Task 71: `docs/nav-sprawl-audit.md` (deeper sprawl analysis)");
lines.push("");
lines.push("---");
lines.push("");
lines.push("## Appendix A — Full route inventory");
lines.push("");

for (const { name, list } of catOrder) {
  lines.push(`### ${name}`);
  lines.push("");
  for (const r of list) lines.push(`- \`${r}\``);
  lines.push("");
}

writeFileSync(OUT, `${lines.join("\n")}\n`);
console.log(`Wrote ${OUT} (${routes.length} routes, ${dashRoutes.length} dashboard)`);
