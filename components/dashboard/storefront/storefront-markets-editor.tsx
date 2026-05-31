"use client";

import { useMemo, useState } from "react";

import { updateStorefrontMarketsAction } from "@/actions/storefront-markets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { StorefrontMarket } from "@/lib/storefront/markets";

type MenuOption = { id: string; title: string };
type ShopifyMarketOption = { id: string; name: string; currencyCode: string | null };

function emptyMarket(storeSlug: string, currency: string): StorefrontMarket {
  return {
    id: `market-${Date.now()}`,
    name: "New market",
    enabled: true,
    currency,
    storeSlug,
  };
}

export function StorefrontMarketsEditor({
  storeSlug,
  currency,
  menus,
  initialMarkets,
  shopifyMarkets = [],
}: {
  storeSlug: string;
  currency: string;
  menus: MenuOption[];
  initialMarkets: StorefrontMarket[];
  shopifyMarkets?: ShopifyMarketOption[];
}) {
  const [markets, setMarkets] = useState<StorefrontMarket[]>(
    initialMarkets.length > 0 ? initialMarkets : [emptyMarket(storeSlug, currency)],
  );
  const [showJson, setShowJson] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const marketsJson = useMemo(() => JSON.stringify(markets, null, 2), [markets]);

  function updateAt(index: number, patch: Partial<StorefrontMarket>) {
    setMarkets((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }

  function removeAt(index: number) {
    setMarkets((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSave(formData: FormData) {
    setStatus(null);
    formData.set("marketsJson", marketsJson);
    const res = await updateStorefrontMarketsAction(formData);
    if ("error" in res && res.error) {
      setStatus(res.error);
    } else {
      setStatus("Markets saved.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" className="rounded-full" onClick={() => setShowJson((v) => !v)}>
          {showJson ? "Visual editor" : "Advanced JSON"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="rounded-full"
          onClick={() => setMarkets((prev) => [...prev, emptyMarket(storeSlug, currency)])}
        >
          Add market
        </Button>
      </div>

      {showJson ? (
        <form action={onSave} className="space-y-4">
          <Textarea
            name="marketsJson"
            rows={14}
            className="font-mono text-xs"
            defaultValue={marketsJson}
            key={marketsJson}
            spellCheck={false}
          />
          <Button type="submit" className="rounded-full">
            Save JSON
          </Button>
        </form>
      ) : (
        <form action={onSave} className="space-y-6">
          <input type="hidden" name="marketsJson" value={marketsJson} readOnly />
          {markets.map((m, idx) => (
            <fieldset
              key={m.id}
              className="space-y-4 rounded-xl border border-border/80 p-4"
            >
              <legend className="px-2 text-sm font-medium">{m.name || `Market ${idx + 1}`}</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>ID</Label>
                  <Input value={m.id} onChange={(e) => updateAt(idx, { id: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={m.name} onChange={(e) => updateAt(idx, { name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Menu (activeMenuId)</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={m.activeMenuId ?? ""}
                    onChange={(e) =>
                      updateAt(idx, {
                        activeMenuId: e.target.value || undefined,
                      })
                    }
                  >
                    <option value="">Default storefront menu</option>
                    {menus.map((menu) => (
                      <option key={menu.id} value={menu.id}>
                        {menu.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Host subdomain (optional)</Label>
                  <Input
                    value={m.hostSubdomain ?? ""}
                    placeholder={`${storeSlug}-${m.id}`}
                    onChange={(e) => updateAt(idx, { hostSubdomain: e.target.value || undefined })}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Path slug override (optional)</Label>
                  <Input
                    value={m.storeSlug ?? ""}
                    placeholder={storeSlug}
                    onChange={(e) => updateAt(idx, { storeSlug: e.target.value || undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Region (ISO, optional)</Label>
                  <Input
                    value={m.region ?? ""}
                    placeholder="US"
                    onChange={(e) => updateAt(idx, { region: e.target.value || undefined })}
                    className="font-mono text-xs uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency (optional)</Label>
                  <Input
                    value={m.currency ?? ""}
                    placeholder={currency}
                    onChange={(e) => updateAt(idx, { currency: e.target.value || undefined })}
                    className="font-mono text-xs uppercase"
                  />
                </div>
                {shopifyMarkets.length > 0 ? (
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Linked Shopify market (optional)</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={m.shopifyMarketId ?? ""}
                      onChange={(e) =>
                        updateAt(idx, {
                          shopifyMarketId: e.target.value || undefined,
                          syncMode: e.target.value ? m.syncMode ?? "none" : "none",
                        })
                      }
                    >
                      <option value="">Not linked — native OS Kitchen market only</option>
                      {shopifyMarkets.map((shopifyMarket) => (
                        <option key={shopifyMarket.id} value={shopifyMarket.id}>
                          {shopifyMarket.name}
                          {shopifyMarket.currencyCode ? ` (${shopifyMarket.currencyCode})` : ""}
                        </option>
                      ))}
                    </select>
                    {m.shopifyMarketId ? (
                      <>
                        <p className="font-mono text-[10px] text-muted-foreground">{m.shopifyMarketId}</p>
                        <div className="space-y-2">
                          <Label>Price sync mode</Label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={m.syncMode ?? "none"}
                            onChange={(e) =>
                              updateAt(idx, {
                                syncMode: e.target.value as StorefrontMarket["syncMode"],
                              })
                            }
                          >
                            <option value="none">None — native OS Kitchen prices</option>
                            <option value="import">Import — Shopify price list wins on mapped products</option>
                            <option value="push">Push — KitchenOS prices update Shopify price list</option>
                            <option value="bidirectional" disabled>
                              Bidirectional (future — not available)
                            </option>
                          </select>
                        </div>
                      </>
                    ) : null}
                  </div>
                ) : null}
                <div className="space-y-2 sm:col-span-2">
                  <Label>Banner text</Label>
                  <Input
                    value={m.bannerText ?? ""}
                    onChange={(e) => updateAt(idx, { bannerText: e.target.value || undefined })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Product IDs filter (comma-separated UUIDs, optional)</Label>
                  <Input
                    value={(m.productIds ?? []).join(", ")}
                    onChange={(e) => {
                      const ids = e.target.value
                        .split(/[,\s]+/)
                        .map((s) => s.trim())
                        .filter(Boolean);
                      updateAt(idx, { productIds: ids.length > 0 ? ids : undefined });
                    }}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={m.enabled !== false}
                  onChange={(e) => updateAt(idx, { enabled: e.target.checked })}
                />
                Enabled
              </label>
              {markets.length > 1 ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeAt(idx)}>
                  Remove market
                </Button>
              ) : null}
            </fieldset>
          ))}
          <Button type="submit" className="rounded-full">
            Save markets
          </Button>
        </form>
      )}

      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      <p className="text-xs text-muted-foreground">
        Public: <code>?market=</code> + cookie <code>kos_market</code>. Per-market menu overrides default{" "}
        <code>activeMenuId</code>.
      </p>
    </div>
  );
}
