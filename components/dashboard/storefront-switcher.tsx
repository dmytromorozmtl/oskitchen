"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setActiveAdminStorefrontAction } from "@/actions/storefront-multi-store";
import type { OwnerStorefrontSummary } from "@/lib/storefront/resolve-owner-storefront";
import { Label } from "@/components/ui/label";

export function StorefrontSwitcher({
  storefronts,
  activeId,
}: {
  storefronts: OwnerStorefrontSummary[];
  activeId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (storefronts.length <= 1) return null;

  function onChange(storefrontId: string) {
    const fd = new FormData();
    fd.set("storefrontId", storefrontId);
    startTransition(async () => {
      await setActiveAdminStorefrontAction(fd);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border/80 bg-muted/30 px-4 py-3">
      <div className="min-w-[200px] flex-1">
        <Label htmlFor="kos-store-switcher" className="text-xs text-muted-foreground">
          Active storefront
        </Label>
        <select
          id="kos-store-switcher"
          className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={activeId}
          disabled={pending}
          onChange={(e) => onChange(e.target.value)}
        >
          {storefronts.map((s) => (
            <option key={s.id} value={s.id}>
              {s.publicName} (/s/{s.storeSlug}){s.isPrimary ? " · primary" : ""}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-muted-foreground">
        {pending ? "Switching…" : `${storefronts.length} stores on this account`}
      </p>
    </div>
  );
}
