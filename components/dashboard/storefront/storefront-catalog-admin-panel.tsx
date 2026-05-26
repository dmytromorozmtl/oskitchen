"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  addStorefrontModifierOptionAction,
  deleteStorefrontModifierGroupAction,
  deleteStorefrontModifierOptionAction,
  deleteStorefrontVariantAction,
  setProductAvailabilityAction,
  upsertStorefrontModifierGroupAction,
  upsertStorefrontVariantAction,
} from "@/actions/storefront-catalog-admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

type ProductRow = { id: string; title: string; price: number };
type VariantRow = {
  id: string;
  productId: string;
  title: string;
  sku: string | null;
  priceAdjustment: number;
  priceOverride: number | null;
  soldOut: boolean;
  active: boolean;
};
type ModifierGroupRow = {
  id: string;
  productId: string | null;
  name: string;
  required: boolean;
  minSelections: number;
  maxSelections: number;
  options: { id: string; name: string; priceAdjustment: number }[];
};
type AvailabilityRow = { productId: string; soldOut: boolean; maxQuantity: number | null };

type Props = {
  currency: string;
  products: ProductRow[];
  variants: VariantRow[];
  modifierGroups: ModifierGroupRow[];
  availabilities: AvailabilityRow[];
};

export function StorefrontCatalogAdminPanel({
  currency,
  products,
  variants,
  modifierGroups,
  availabilities,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const availByProduct = new Map(availabilities.map((a) => [a.productId, a]));

  async function run(action: (fd: FormData) => Promise<{ ok?: true; error?: string }>, fd: FormData) {
    setMessage(null);
    const r = await action(fd);
    if (r.error) setMessage(r.error);
    else {
      setMessage("Saved.");
      startTransition(() => router.refresh());
    }
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No products on active menu</CardTitle>
          <CardDescription>Publish a menu with products, then return here.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {message ? (
        <p className="rounded-lg border border-border/80 bg-muted/40 px-3 py-2 text-sm">{message}</p>
      ) : null}

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Product variants</CardTitle>
          <CardDescription>
            Size or style options with price adjustments. Shown on product pages and sent to the server cart.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {products.map((p) => {
            const pVariants = variants.filter((v) => v.productId === p.id);
            return (
              <div key={p.id} className="rounded-xl border border-border/60 p-4 space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-medium">{p.title}</h3>
                  <span className="text-sm text-muted-foreground">Base {formatCurrency(p.price, currency)}</span>
                </div>
                {pVariants.length > 0 ? (
                  <ul className="space-y-2 text-sm">
                    {pVariants.map((v) => (
                      <li key={v.id} className="space-y-2 rounded-lg bg-muted/30 px-3 py-2">
                        <form
                          className="grid gap-2 sm:grid-cols-5 sm:items-end"
                          action={(fd) => {
                            void run(upsertStorefrontVariantAction, fd);
                          }}
                        >
                          <input type="hidden" name="id" value={v.id} />
                          <input type="hidden" name="productId" value={p.id} />
                          <div className="space-y-1">
                            <Label className="text-xs">Title</Label>
                            <Input name="title" defaultValue={v.title} required />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Adjustment</Label>
                            <Input
                              name="priceAdjustment"
                              type="number"
                              step="0.01"
                              defaultValue={String(v.priceAdjustment)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Override</Label>
                            <Input
                              name="priceOverride"
                              type="number"
                              step="0.01"
                              min="0"
                              defaultValue={v.priceOverride != null ? String(v.priceOverride) : ""}
                            />
                          </div>
                          <label className="flex items-center gap-2 text-xs">
                            <input type="checkbox" name="soldOut" defaultChecked={v.soldOut} className="rounded" />
                            Sold out
                          </label>
                          <div className="flex gap-1">
                            <Button type="submit" size="sm" variant="secondary" disabled={pending}>
                              Save
                            </Button>
                          </div>
                        </form>
                        <form
                          className="mt-1"
                          action={(fd) => {
                            void run(deleteStorefrontVariantAction, fd);
                          }}
                        >
                          <input type="hidden" name="id" value={v.id} />
                          <Button type="submit" size="sm" variant="ghost" disabled={pending}>
                            Remove variant
                          </Button>
                        </form>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No variants yet.</p>
                )}
                <form
                  className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
                  action={(fd) => {
                    void run(upsertStorefrontVariantAction, fd);
                  }}
                >
                  <input type="hidden" name="productId" value={p.id} />
                  <div className="space-y-1">
                    <Label htmlFor={`v-title-${p.id}`}>Title</Label>
                    <Input id={`v-title-${p.id}`} name="title" placeholder="Large" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`v-adj-${p.id}`}>Price adjustment</Label>
                    <Input id={`v-adj-${p.id}`} name="priceAdjustment" type="number" step="0.01" defaultValue="0" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`v-ov-${p.id}`}>Override price (optional)</Label>
                    <Input id={`v-ov-${p.id}`} name="priceOverride" type="number" step="0.01" min="0" />
                  </div>
                  <div className="flex items-end gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="soldOut" className="rounded" />
                      Sold out
                    </label>
                    <Button type="submit" size="sm" disabled={pending}>
                      Add variant
                    </Button>
                  </div>
                </form>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Modifier groups</CardTitle>
          <CardDescription>
            Add-ons (sauces, extras). Leave product empty for menu-wide groups, or pick one product.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {modifierGroups.map((g) => (
            <div key={g.id} className="rounded-lg border border-border/60 p-3 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-medium">{g.name}</span>
                <form
                  action={(fd) => {
                    void run(deleteStorefrontModifierGroupAction, fd);
                  }}
                >
                  <input type="hidden" name="id" value={g.id} />
                  <Button type="submit" size="sm" variant="ghost" disabled={pending}>
                    Delete group
                  </Button>
                </form>
              </div>
              <p className="text-muted-foreground">
                {g.productId
                  ? products.find((x) => x.id === g.productId)?.title ?? "Product"
                  : "All products"}{" "}
                · {g.required ? "required" : "optional"} · {g.minSelections}–{g.maxSelections} picks
              </p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                {g.options.map((o) => (
                  <li key={o.id} className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      {o.name} ({o.priceAdjustment >= 0 ? "+" : ""}
                      {formatCurrency(o.priceAdjustment, currency)})
                    </span>
                    <form
                      action={(fd) => {
                        void run(deleteStorefrontModifierOptionAction, fd);
                      }}
                    >
                      <input type="hidden" name="id" value={o.id} />
                      <Button type="submit" size="sm" variant="ghost" disabled={pending}>
                        Remove
                      </Button>
                    </form>
                  </li>
                ))}
              </ul>
              <form
                className="mt-2 flex flex-wrap items-end gap-2"
                action={(fd) => {
                  void run(addStorefrontModifierOptionAction, fd);
                }}
              >
                <input type="hidden" name="groupId" value={g.id} />
                <Input name="name" placeholder="Option name" className="h-8 max-w-[10rem] text-xs" required />
                <Input name="priceAdjustment" type="number" step="0.01" defaultValue="0" className="h-8 w-24 text-xs" />
                <Button type="submit" size="sm" variant="outline" disabled={pending}>
                  Add option
                </Button>
              </form>
            </div>
          ))}
          <form
            className="grid gap-3 border-t border-border/60 pt-4 sm:grid-cols-2"
            action={(fd) => {
              void run(upsertStorefrontModifierGroupAction, fd);
            }}
          >
            <div className="space-y-1 sm:col-span-2">
              <Label>Group name</Label>
              <Input name="name" placeholder="Add-ons" required />
            </div>
            <div className="space-y-1">
              <Label>Product (optional)</Label>
              <select name="productId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">All products</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>First option name</Label>
              <Input name="optionName" placeholder="Extra sauce" />
            </div>
            <div className="space-y-1">
              <Label>Option price</Label>
              <Input name="optionPrice" type="number" step="0.01" defaultValue="0" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="required" className="rounded" />
                Required
              </label>
              <Button type="submit" disabled={pending}>
                Add group
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Availability (sold out / cap)</CardTitle>
          <CardDescription>
            Overrides inventory for the active menu window. Sold out blocks add-to-cart on the storefront.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {products.map((p) => {
            const a = availByProduct.get(p.id);
            return (
              <form
                key={p.id}
                className="flex flex-wrap items-end gap-4 rounded-lg border border-border/60 p-3"
                action={(fd) => {
                  void run(setProductAvailabilityAction, fd);
                }}
              >
                <input type="hidden" name="productId" value={p.id} />
                <span className="min-w-[8rem] font-medium">{p.title}</span>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="soldOut" defaultChecked={a?.soldOut} className="rounded" />
                  Sold out
                </label>
                <div className="space-y-1">
                  <Label className="sr-only">Max qty</Label>
                  <Input
                    name="maxQuantity"
                    type="number"
                    min="0"
                    placeholder="Max qty"
                    defaultValue={a?.maxQuantity ?? ""}
                    className="w-28"
                  />
                </div>
                <Button type="submit" size="sm" variant="secondary" disabled={pending}>
                  Save
                </Button>
              </form>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
