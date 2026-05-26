"use client";

import { useState, useTransition } from "react";

import { createMappingSuggestionAction } from "@/actions/product-mapping";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  PRODUCT_MAPPING_PROVIDERS,
  PRODUCT_MAPPING_PROVIDER_LABEL,
} from "@/lib/product-mapping/provider-types";

export function SuggestionForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add unmatched product</CardTitle>
        <CardDescription>
          KitchenOS will suggest a match by SKU, normalized title, alias, or fuzzy similarity. Low-confidence
          matches stay in review until you approve them.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3 md:grid-cols-6"
          action={(formData) =>
            startTransition(async () => {
              setError(null);
              try {
                await createMappingSuggestionAction(formData);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Could not save mapping.");
              }
            })
          }
        >
          <select name="provider" defaultValue="CSV" className="rounded-md border bg-background px-3 py-2 text-sm">
            {PRODUCT_MAPPING_PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {PRODUCT_MAPPING_PROVIDER_LABEL[p]}
              </option>
            ))}
          </select>
          <Input name="externalProductId" placeholder="External ID" />
          <Input name="externalSku" placeholder="External SKU" />
          <Input name="externalTitle" placeholder="External title" required />
          <Input name="externalCategory" placeholder="Category (optional)" />
          <Button type="submit" disabled={isPending}>
            {isPending ? "Matching…" : "Suggest match"}
          </Button>
          {error ? (
            <p className="md:col-span-6 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
