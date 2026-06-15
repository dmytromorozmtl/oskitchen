/**
 * Smoke Public API tenant isolation (requires active API key).
 *
 *   export SMOKE_PUBLIC_API_KEY="kos_...."
 *   npm run smoke:public-api
 *
 * Optional second key for cross-tenant check:
 *   export SMOKE_PUBLIC_API_KEY_B="kos_...."
 */
import { hashApiKey } from "@/lib/api-public/auth";

const base = process.env.SMOKE_PUBLIC_API_BASE ?? "http://localhost:3000";

async function getOrders(apiKey: string): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${base}/api/public/v1/orders`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function main() {
  const keyA = process.env.SMOKE_PUBLIC_API_KEY?.trim();
  if (!keyA?.startsWith("kos_")) {
    console.error("Set SMOKE_PUBLIC_API_KEY=kos_... (create in Dashboard → Developer → API keys)");
    process.exit(1);
  }

  const a = await getOrders(keyA);
  if (a.status !== 200) {
    console.error("Key A failed", a.status, a.body);
    process.exit(1);
  }
  console.log("key A OK", { orders: (a.body as { data?: unknown[] })?.data?.length ?? "?" });

  const keyB = process.env.SMOKE_PUBLIC_API_KEY_B?.trim();
  if (keyB) {
    const b = await getOrders(keyB);
    if (b.status !== 200) {
      console.error("Key B failed", b.status, b.body);
      process.exit(1);
    }
    const idsA = new Set(
      ((a.body as { data?: { id: string }[] })?.data ?? []).map((o) => o.id),
    );
    const idsB = ((b.body as { data?: { id: string }[] })?.data ?? []).map((o) => o.id);
    const overlap = idsB.filter((id) => idsA.has(id));
    if (overlap.length > 0 && keyA !== keyB) {
      console.error("Cross-tenant leak: shared order ids", overlap.slice(0, 3));
      process.exit(1);
    }
    console.log("cross-tenant OK (no overlapping order ids)");
  }

  console.log("digest prefix", hashApiKey(keyA).slice(0, 12));
  console.log("smoke OK: public API");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
