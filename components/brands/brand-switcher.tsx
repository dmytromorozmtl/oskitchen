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

export type BrandSwitcherOption = { id: string; name: string; slug: string };

export function BrandSwitcher({ brands }: { brands: BrandSwitcherOption[] }) {
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
    } catch {
      /* ignore */
    }
    try {
      window.dispatchEvent(new Event(BRAND_CONTEXT_CHANGED_EVENT));
    } catch {
      /* ignore */
    }
    router.refresh();
  };

  return (
    <div className="hidden min-w-[160px] md:block">
      <Select value={value} onValueChange={apply}>
        <SelectTrigger className="h-9 rounded-full text-xs" aria-label="Brand context">
          <SelectValue placeholder="Brand" />
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
    </div>
  );
}

export function BrandBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex max-w-[140px] items-center truncate rounded-full border border-border/80 bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {name}
    </span>
  );
}
