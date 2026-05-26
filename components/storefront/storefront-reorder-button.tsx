"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type Props = {
  storeSlug: string;
  orderToken: string;
  merge?: boolean;
  variant?: "default" | "outline" | "secondary" | "premium";
  className?: string;
  label?: string;
};

export function StorefrontReorderButton({
  storeSlug,
  orderToken,
  merge = true,
  variant = "outline",
  className,
  label = "Order again",
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function reorder() {
    setPending(true);
    try {
      const res = await fetch("/api/storefront/account/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ storeSlug, orderToken, merge }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Could not reorder.");
        if (data.warnings?.length) {
          for (const w of data.warnings as { message: string }[]) {
            toast.message(w.message);
          }
        }
        return;
      }

      if (data.warnings?.length) {
        for (const w of data.warnings as { message: string }[]) {
          toast.message(w.message);
        }
      }
      if (data.skippedCount > 0) {
        toast.message(`${data.skippedCount} item(s) unavailable — cart updated with what we could add.`);
      }

      window.dispatchEvent(new Event("kos-store-cart"));
      toast.success("Items added to your cart.");
      router.push(data.redirectTo ?? `/s/${storeSlug}/cart`);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      disabled={pending}
      onClick={() => void reorder()}
    >
      {pending ? "Adding…" : label}
    </Button>
  );
}
