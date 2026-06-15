import { createHmac, timingSafeEqual } from "node:crypto";

import type { StoreCartLine } from "@/lib/storefront/contracts/cart";
import { cartLineKey, normalizeModifierIds } from "@/lib/storefront/cart-line-key";

export const SERVER_CART_COOKIE = "kos_sf_cart";

const MAX_LINES = 80;
const MAX_QTY = 500;
const TTL_SEC = 60 * 60 * 24 * 30;

function secret(): string | null {
  const s =
    process.env.STOREFRONT_CART_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    process.env.STOREFRONT_PREVIEW_SECRET?.trim();
  return s && s.length >= 16 ? s : null;
}

export type ServerCartPayload = {
  storefrontId: string;
  storeSlug: string;
  menuId: string;
  priceVersion: string;
  lines: StoreCartLine[];
  version: string;
  exp: number;
};

function parseLineFromRecordKey(key: string, quantity: number): StoreCartLine | null {
  if (!/^[0-9a-f-]{36}$/i.test(key)) return null;
  const q = Math.floor(Number(quantity));
  if (!Number.isFinite(q) || q < 1 || q > MAX_QTY) return null;
  return { productId: key, quantity: q };
}

export function normalizeLines(raw: StoreCartLine[] | Record<string, number>): StoreCartLine[] {
  if (Array.isArray(raw)) {
    const lines: StoreCartLine[] = [];
    for (const row of raw) {
      if (!row?.productId || !/^[0-9a-f-]{36}$/i.test(row.productId)) continue;
      const q = Math.floor(Number(row.quantity));
      if (!Number.isFinite(q) || q < 1 || q > MAX_QTY) continue;
      lines.push({
        productId: row.productId,
        variantId: row.variantId && /^[0-9a-f-]{36}$/i.test(row.variantId) ? row.variantId : undefined,
        modifierOptionIds: normalizeModifierIds(row.modifierOptionIds),
        quantity: q,
      });
      if (lines.length >= MAX_LINES) break;
    }
    return lines;
  }
  const lines: StoreCartLine[] = [];
  for (const [productId, quantity] of Object.entries(raw)) {
    const l = parseLineFromRecordKey(productId, quantity);
    if (l) lines.push(l);
    if (lines.length >= MAX_LINES) break;
  }
  return lines;
}

export function linesToRecord(lines: StoreCartLine[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const l of lines) {
    const key = cartLineKey(l);
    out[key] = (out[key] ?? 0) + l.quantity;
  }
  return out;
}

export function mergeCartLines(
  server: StoreCartLine[],
  client: Record<string, number>,
  mode: "merge" | "replace",
): StoreCartLine[] {
  if (mode === "replace") return normalizeLines(client);
  const map = new Map<string, StoreCartLine>();
  for (const l of server) map.set(cartLineKey(l), l);
  for (const [key, quantity] of Object.entries(client)) {
    const parsed =
      key.includes(":") && parseCartLineKeyFromStorage(key, quantity)
        ? parseCartLineKeyFromStorage(key, quantity)!
        : parseLineFromRecordKey(key, quantity);
    if (!parsed) continue;
    const k = cartLineKey(parsed);
    const prev = map.get(k);
    map.set(k, {
      ...parsed,
      quantity: (prev?.quantity ?? 0) + parsed.quantity,
    });
  }
  return [...map.values()].filter((l) => l.quantity > 0);
}

function parseCartLineKeyFromStorage(key: string, quantity: number): StoreCartLine | null {
  const parts = key.split(":");
  if (parts.length < 2) return null;
  const productId = parts[0];
  if (!/^[0-9a-f-]{36}$/i.test(productId)) return null;
  const variantId = parts[1] && /^[0-9a-f-]{36}$/i.test(parts[1]) ? parts[1] : undefined;
  const modifierOptionIds = parts[2] ? parts[2].split(",").filter((id) => /^[0-9a-f-]{36}$/i.test(id)) : [];
  const q = Math.floor(Number(quantity));
  if (!Number.isFinite(q) || q < 1 || q > MAX_QTY) return null;
  return { productId, variantId, modifierOptionIds, quantity: q };
}

export function cartVersionHash(lines: StoreCartLine[]): string {
  const payload = lines
    .slice()
    .sort((a, b) => cartLineKey(a).localeCompare(cartLineKey(b)))
    .map((l) => `${cartLineKey(l)}:${l.quantity}`)
    .join("|");
  return createHmac("sha256", "cart-v2").update(payload).digest("hex").slice(0, 16);
}

export function sealServerCart(payload: Omit<ServerCartPayload, "exp">): string | null {
  const sec = secret();
  if (!sec) return null;
  const exp = Math.floor(Date.now() / 1000) + TTL_SEC;
  const body = JSON.stringify({ ...payload, exp });
  const sig = createHmac("sha256", sec).update(body).digest("hex");
  return Buffer.from(`${body}|${sig}`, "utf8").toString("base64url");
}

export function openServerCart(token: string, expectedSlug: string): ServerCartPayload | null {
  const sec = secret();
  if (!sec) return null;
  let raw: string;
  try {
    raw = Buffer.from(token, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const sep = raw.lastIndexOf("|");
  if (sep < 0) return null;
  const body = raw.slice(0, sep);
  const sig = raw.slice(sep + 1);
  const expectedSig = createHmac("sha256", sec).update(body).digest("hex");
  try {
    if (expectedSig.length !== sig.length || !timingSafeEqual(Buffer.from(expectedSig), Buffer.from(sig))) {
      return null;
    }
  } catch {
    return null;
  }
  let parsed: ServerCartPayload;
  try {
    parsed = JSON.parse(body) as ServerCartPayload;
  } catch {
    return null;
  }
  if (parsed.storeSlug !== expectedSlug) return null;
  if (!parsed.storefrontId || !parsed.menuId || !parsed.priceVersion) return null;
  if (!Array.isArray(parsed.lines)) return null;
  if (!Number.isFinite(parsed.exp) || parsed.exp < Math.floor(Date.now() / 1000)) return null;
  parsed.lines = normalizeLines(parsed.lines);
  parsed.version = parsed.priceVersion;
  return parsed;
}

export function isServerCartConfigured(): boolean {
  return secret() != null;
}
