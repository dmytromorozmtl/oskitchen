"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RotateCcw } from "lucide-react";

import { oneClickReorderMarketplaceItemAction } from "@/actions/marketplace/supplier-reorder";
import { Button } from "@/components/ui/button";
import type { SupplierOneClickReorder } from "@/lib/marketplace/supplier-marketplace-types";

type Props = {
  item: SupplierOneClickReorder;
  size?: "sm" | "default";
  className?: string;
};

export function SupplierOneClickReorderButton({ item, size = "sm", className }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const res = await oneClickReorderMarketplaceItemAction({
        productId: item.productId,
        slug: item.slug,
        name: item.productName,
        sku: item.sku,
        vendorId: item.vendorId,
        vendorName: item.vendorName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        currency: item.currency,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/dashboard/marketplace/checkout");
      router.refresh();
    });
  }

  return (
    <div className="space-y-1">
      <Button
        type="button"
        size={size}
        className={className ?? "rounded-full gap-1"}
        disabled={pending}
        onClick={handleClick}
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        {pending ? "Adding…" : "One-click reorder"}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
