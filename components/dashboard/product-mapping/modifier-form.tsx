"use client";

import { useState, useTransition } from "react";

import { upsertModifierAction } from "@/actions/product-mapping";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PRODUCT_MAPPING_PROVIDERS,
  PRODUCT_MAPPING_PROVIDER_LABEL,
} from "@/lib/product-mapping/provider-types";
import { CANONICAL_MODIFIER_KEYS } from "@/lib/product-mapping/modifier-mapping";

export function ModifierForm({ productMappingId, defaultProvider }: { productMappingId: string; defaultProvider?: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="grid gap-2 md:grid-cols-6 rounded-lg border p-3"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          try {
            await upsertModifierAction(formData);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not save modifier.");
          }
        })
      }
    >
      <input type="hidden" name="productMappingId" value={productMappingId} />
      <select
        name="provider"
        defaultValue={defaultProvider ?? "CSV"}
        className="rounded-md border bg-background px-2 py-1 text-xs"
      >
        {PRODUCT_MAPPING_PROVIDERS.map((p) => (
          <option key={p} value={p}>
            {PRODUCT_MAPPING_PROVIDER_LABEL[p]}
          </option>
        ))}
      </select>
      <Input name="externalModifierName" placeholder="External modifier" required />
      <Input name="externalOptionName" placeholder="External option" />
      <select name="internalModifierKey" className="rounded-md border bg-background px-2 py-1 text-xs">
        <option value="">Choose key…</option>
        {CANONICAL_MODIFIER_KEYS.map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>
      <Input name="internalOptionValue" placeholder="Option value (optional)" />
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Saving…" : "Save"}
      </Button>
      {error ? <p className="md:col-span-6 text-xs text-destructive">{error}</p> : null}
    </form>
  );
}
