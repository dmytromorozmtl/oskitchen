/**
 * Bind real Vercel URLs after copying from Dashboard → Deployments.
 *
 *   STOREFRONT_KNOWN_PRODUCTION_URL=https://kitchenos-xxx.vercel.app \
 *   STOREFRONT_KNOWN_STAGING_URL=https://kitchenos-xxx-git-staging.vercel.app \
 *   npm run storefront:bind-deploy-url
 */
import { join } from "node:path";

import { patchEnvFile } from "./lib/patch-env-file";
import { loadStorefrontScriptEnv } from "./lib/load-storefront-script-env";

const ROOT = process.cwd();
const SLUG = process.env.STOREFRONT_PILOT_SLUG?.trim() || "hello";

async function probe(origin: string): Promise<{ ok: boolean; status: number; detail: string }> {
  const base = origin.replace(/\/$/, "");
  const url = `${base}/s/${SLUG}`;
  try {
    const res = await fetch(url, { redirect: "manual" });
    const text = (await res.text()).slice(0, 200);
    if (text.includes("DEPLOYMENT_NOT_FOUND")) {
      return { ok: false, status: res.status, detail: "DEPLOYMENT_NOT_FOUND — wrong URL" };
    }
    if (res.status === 200) return { ok: true, status: 200, detail: "storefront live" };
    return { ok: false, status: res.status, detail: `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, status: 0, detail: e instanceof Error ? e.message : "fetch failed" };
  }
}

async function main(): Promise<void> {
  const prod = process.env.STOREFRONT_KNOWN_PRODUCTION_URL?.trim();
  const staging = process.env.STOREFRONT_KNOWN_STAGING_URL?.trim();
  if (!prod) {
    console.error(
      "Set STOREFRONT_KNOWN_PRODUCTION_URL=https://<vercel> or http://localhost:3000 for local pilot",
    );
    process.exit(1);
  }
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(prod);
  if (isLocal) {
    console.log("Local pilot mode — use for dev QA only, not Vercel Production.\n");
  }

  console.log(`Probing production: ${prod}/s/${SLUG}`);
  const prodProbe = await probe(prod);
  console.log(`  ${prodProbe.ok ? "✓" : "✗"} ${prodProbe.detail}`);

  if (staging) {
    console.log(`Probing staging: ${staging}/s/${SLUG}`);
    const st = await probe(staging);
    console.log(`  ${st.ok ? "✓" : "✗"} ${st.detail}`);
  }

  const prodEnv = join(ROOT, ".env.production.local");
  const stagingEnv = join(ROOT, ".env.storefront.staging.local");
  patchEnvFile(prodEnv, "NEXT_PUBLIC_APP_URL", prod.replace(/\/$/, ""));
  patchEnvFile(prodEnv, "STOREFRONT_SMOKE_BASE_URL", prod.replace(/\/$/, ""));
  if (staging) {
    patchEnvFile(stagingEnv, "STOREFRONT_SMOKE_BASE_URL", staging.replace(/\/$/, ""));
    patchEnvFile(stagingEnv, "PLAYWRIGHT_BASE_URL", staging.replace(/\/$/, ""));
    patchEnvFile(stagingEnv, "LHCI_BASE_URL", staging.replace(/\/$/, ""));
  }
  patchEnvFile(stagingEnv, "STOREFRONT_SMOKE_SLUG", SLUG);

  console.log("\n✓ Patched .env.production.local + .env.storefront.staging.local");
  loadStorefrontScriptEnv();

  if (!prodProbe.ok) {
    console.warn("\nURL saved but storefront not 200 yet — publish slug `hello` or redeploy Vercel with DATABASE_URL.");
    process.exitCode = 1;
  } else {
    console.log("\nNext:");
    console.log("  npm run storefront:vercel-manifest");
    console.log("  npm run storefront:post-deploy");
    console.log("  npm run storefront:48h-run");
  }
}

void main();
