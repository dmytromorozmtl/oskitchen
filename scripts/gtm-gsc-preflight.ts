/**
 * Production SEO / GSC readiness probe (no credentials required).
 *
 *   npx tsx scripts/gtm-gsc-preflight.ts
 *   npx tsx scripts/gtm-gsc-preflight.ts --url https://os-kitchen.com
 *   npx tsx scripts/gtm-gsc-preflight.ts --strict   # fail if GSC meta missing on live site
 */
const DEFAULT_ORIGIN = "https://os-kitchen.com";
const FEATURED_BLOG_PATH = "/blog/meal-prep-order-queue-cut-packing-errors";

type Check = { name: string; ok: boolean; detail: string; required?: boolean };

async function fetchText(url: string): Promise<{ ok: boolean; status: number; body: string }> {
  const res = await fetch(url, { redirect: "follow" });
  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}

async function main() {
  const strictGsc = process.argv.includes("--strict");
  const origin = (process.argv.find((a) => a.startsWith("--url="))?.slice(6) ??
    process.env.GTM_PREFLIGHT_ORIGIN ??
    DEFAULT_ORIGIN
  ).replace(/\/+$/, "");

  const checks: Check[] = [];

  const healthRes = await fetch(`${origin}/api/health`);
  let healthDetail = `GET /api/health → ${healthRes.status}`;
  if (healthRes.ok) {
    try {
      const body = (await healthRes.json()) as { status?: string; checks?: { database?: { latencyMs?: number } } };
      healthDetail += ` · status=${body.status ?? "?"} · dbMs=${body.checks?.database?.latencyMs ?? "?"}`;
    } catch {
      healthDetail += " · JSON parse failed";
    }
  }
  checks.push({
    name: "Production health",
    ok: healthRes.ok,
    detail: healthDetail,
  });

  const robots = await fetchText(`${origin}/robots.txt`);
  const hasSitemap = robots.body.includes("Sitemap:");
  checks.push({
    name: "robots.txt",
    ok: robots.ok && hasSitemap,
    detail: hasSitemap ? "Sitemap directive present" : "Missing Sitemap: line",
  });

  const sitemap = await fetchText(`${origin}/sitemap.xml`);
  const urlCount = (sitemap.body.match(/<url>/g) ?? []).length;
  checks.push({
    name: "sitemap.xml",
    ok: sitemap.ok && urlCount >= 50,
    detail: `${urlCount} URLs (target ≥50)`,
  });

  const home = await fetchText(origin);
  const hasOg = home.body.includes("og:title") || home.body.includes('property="og:title"');
  checks.push({
    name: "Homepage Open Graph",
    ok: home.ok && hasOg,
    detail: hasOg ? "og metadata present" : "og tags not found in HTML",
  });

  const gscMeta =
    /google-site-verification["']\s*content=["']([^"']+)["']/i.exec(home.body) ??
    /content=["']([^"']+)["']\s*name=["']google-site-verification["']/i.exec(home.body);
  const gscEnv = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
  checks.push({
    name: "GSC verification (live HTML)",
    ok: Boolean(gscMeta?.[1]),
    required: strictGsc,
    detail: gscMeta?.[1]
      ? `Meta tag present (${gscMeta[1].slice(0, 8)}…) — confirm Verified in Search Console`
      : "Add NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION on Vercel, redeploy, verify in GSC — docs/GSC_SETUP.md",
  });
  if (gscEnv && gscMeta?.[1] && gscEnv !== gscMeta[1]) {
    checks.push({
      name: "GSC token match",
      ok: false,
      required: false,
      detail: "Env token does not match live meta tag — redeploy after fixing Vercel env",
    });
  }

  const blogPathsInSitemap = (sitemap.body.match(/\/blog\/[^<]+/g) ?? []).length;
  checks.push({
    name: "Blog URLs in sitemap",
    ok: blogPathsInSitemap >= 5,
    required: false,
    detail: `${blogPathsInSitemap} blog path(s) indexed in sitemap.xml`,
  });

  const featuredBlog = await fetch(`${origin}${FEATURED_BLOG_PATH}`);
  checks.push({
    name: "Featured blog (meal prep queue)",
    ok: featuredBlog.ok,
    required: false,
    detail: featuredBlog.ok
      ? `${FEATURED_BLOG_PATH} → ${featuredBlog.status}`
      : `Missing — deploy and request indexing in GSC`,
  });

  const deck = await fetch(`${origin}/deck`);
  checks.push({
    name: "Sales deck (/deck)",
    ok: deck.ok,
    required: false,
    detail: deck.ok
      ? `GET /deck → ${deck.status} (Print → Save as PDF)`
      : `GET /deck → ${deck.status} — deploy latest main to enable`,
  });

  console.log(`\nOS Kitchen GTM GSC preflight — ${origin}\n`);
  let failed = 0;
  let warnings = 0;
  for (const c of checks) {
    const required = c.required !== false;
    if (c.ok) {
      console.log(`✅ ${c.name}: ${c.detail}`);
    } else if (required) {
      failed++;
      console.log(`❌ ${c.name}: ${c.detail}`);
    } else {
      warnings++;
      console.log(`⚠️  ${c.name}: ${c.detail}`);
    }
  }

  if (failed) {
    console.log(`\n${failed} required check(s) failed. See docs/GSC_SETUP.md\n`);
    process.exit(1);
  }

  console.log(
    warnings
      ? `\nRequired checks passed. ${warnings} optional item(s) — complete docs/WEEK_1_LAUNCH_CHECKLIST.md\n`
      : "\nAll checks passed. Complete GSC verification in Search Console if not done.\n",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
