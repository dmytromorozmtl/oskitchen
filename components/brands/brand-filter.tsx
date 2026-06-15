"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { BRAND_CONTEXT_CHANGED_EVENT, BRAND_CONTEXT_STORAGE_KEY } from "@/lib/brands/brand-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type BrandFilterOption = { id: string; name: string };

/**
 * Compact filter control — mirrors header `BrandSwitcher` storage so list pages can stay in sync.
 * Hidden automatically when there is only one brand (same rule as the switcher).
 */
export function BrandFilter({ brands }: { brands: readonly BrandFilterOption[] }) {
  const router = useRouter();
  const [value, setValue] = React.useState<string>("all");

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(BRAND_CONTEXT_STORAGE_KEY);
      if (raw === "__all__" || !raw) setValue("all");
      else if (brands.some((b) => b.id === raw)) setValue(raw);
      else setValue("all");
    } catch {
      setValue("all");
    }
  }, [brands]);

  if (brands.length <= 1) return null;

  const apply = (next: string) => {
    setValue(next);
    try {
      if (next === "all") window.localStorage.setItem(BRAND_CONTEXT_STORAGE_KEY, "__all__");
      else window.localStorage.setItem(BRAND_CONTEXT_STORAGE_KEY, next);
      window.dispatchEvent(new Event(BRAND_CONTEXT_CHANGED_EVENT));
    } catch {
      /* ignore */
    }
    router.refresh();
  };

  return (
    <Select value={value} onValueChange={apply}>
      <SelectTrigger className="h-9 w-[200px] rounded-full text-xs" aria-label="Filter by brand">
        <SelectValue placeholder="Brand filter" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All brands</SelectItem>
        {brands.map((b) => (
          <SelectItem key={b.id} value={b.id}>
            {b.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
