"use client";

import { useState, useTransition } from "react";

import { createAliasAction } from "@/actions/product-mapping";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  PRODUCT_MAPPING_PROVIDERS,
  PRODUCT_MAPPING_PROVIDER_LABEL,
} from "@/lib/product-mapping/provider-types";

export function AliasForm({ candidates }: { candidates: { id: string; title: string }[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Add alias</CardTitle>
        <CardDescription>
          Aliases let the matching engine remember &quot;Bangkok Noodles&quot; → &quot;Chicken Bangkok Peanut Noodles&quot;.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3 md:grid-cols-4"
          action={(formData) =>
            startTransition(async () => {
              setError(null);
              try {
                await createAliasAction(formData);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Could not create alias.");
              }
            })
          }
        >
          <Input name="externalTitle" placeholder="External title (e.g. Bangkok Noodles)" required />
          <select
            name="internalProductId"
            required
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">Choose OS Kitchen product…</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <select name="provider" className="rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">Any provider</option>
            {PRODUCT_MAPPING_PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {PRODUCT_MAPPING_PROVIDER_LABEL[p]}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Add alias"}
          </Button>
          {error ? <p className="md:col-span-4 text-sm text-destructive">{error}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
