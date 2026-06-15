/**
 * Smoke-test configured storefront redirects against a deployed host.
 *
 *   STOREFRONT_SMOKE_BASE_URL=https://staging.example.com \
 *   STOREFRONT_REDIRECT_FROM=/legacy-menu \
 *   STOREFRONT_REDIRECT_TO=/menu \
 *   npm run smoke:storefront-redirects
 *
 * Or pass paths via CLI: npm run smoke:storefront-redirects -- /legacy /menu
 */
type Result = { label: string; pass: boolean; detail: string };

function origin(): string {
  const raw = process.env.STOREFRONT_SMOKE_BASE_URL?.trim() || process.env.PLAYWRIGHT_BASE_URL?.trim();
  if (!raw) {
    console.error("Set STOREFRONT_SMOKE_BASE_URL");
    process.exit(1);
  }
  return raw.replace(/\/$/, "");
}

function resolveFromUrl(fromPath: string): string {
  const base = origin();
  const p = fromPath.startsWith("/") ? fromPath : `/${fromPath}`;
  if (p.startsWith("/s/")) return `${base}${p}`;
  const slug =
    process.env.STOREFRONT_SMOKE_SLUG?.trim() ||
    process.env.E2E_STOREFRONT_SLUG?.trim() ||
    process.env.E2E_STORE_SLUG?.trim();
  if (slug) return `${base}/s/${encodeURIComponent(slug)}${p}`;
  return `${base}${p}`;
}

async function checkRedirect(fromPath: string, expectLocationIncludes: string): Promise<Result> {
  const url = resolveFromUrl(fromPath);
  try {
    const res = await fetch(url, { redirect: "manual" });
    const loc = res.headers.get("location") ?? "";
    const pass =
      (res.status === 301 || res.status === 302) && loc.includes(expectLocationIncludes);
    return {
      label: `${fromPath} → ${expectLocationIncludes}`,
      pass,
      detail: pass ? `${res.status} ${loc}` : `status=${res.status} location=${loc || "(none)"}`,
    };
  } catch (e) {
    return {
      label: fromPath,
      pass: false,
      detail: e instanceof Error ? e.message : "fetch failed",
    };
  }
}

async function main(): Promise<void> {
  const pairs: { from: string; to: string }[] = [];
  const fromEnv = process.env.STOREFRONT_REDIRECT_FROM?.trim();
  const toEnv = process.env.STOREFRONT_REDIRECT_TO?.trim();
  if (fromEnv && toEnv) pairs.push({ from: fromEnv, to: toEnv });

  const argv = process.argv.slice(2);
  if (argv.length >= 2) {
    pairs.push({ from: argv[0]!, to: argv[1]! });
  }

  if (pairs.length === 0) {
    console.error("Provide STOREFRONT_REDIRECT_FROM + TO or CLI: smoke:storefront-redirects -- /from /to");
    process.exit(1);
  }

  const slug =
    process.env.STOREFRONT_SMOKE_SLUG?.trim() ||
    process.env.E2E_STOREFRONT_SLUG?.trim() ||
    "";
  console.log(`Redirect smoke @ ${origin()}${slug ? ` (slug: ${slug})` : ""}\n`);
  const results: Result[] = [];
  for (const p of pairs) {
    results.push(await checkRedirect(p.from, p.to));
  }

  for (const r of results) {
    console.log(`${r.pass ? "✓" : "✗"} ${r.label} — ${r.detail}`);
  }

  if (results.some((r) => !r.pass)) process.exit(1);
  console.log("\nAll redirect checks passed.");
}

void main();
