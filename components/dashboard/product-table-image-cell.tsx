"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { updateProductImageFormAction } from "@/actions/products";
import { invokeServerAction } from "@/lib/server-actions/invoke-server-action";
import { MediaPickerDialog } from "@/components/storefront/media/media-picker-dialog";
import type { ProductMediaAsset } from "@/lib/menus/product-image-fields";

export function ProductTableImageCell({
  productId,
  productName,
  image,
  assets,
}: {
  productId: string;
  productName: string;
  image: string | null;
  assets: ProductMediaAsset[];
}) {
  const router = useRouter();
  const [url, setUrl] = React.useState(image ?? "");
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => {
    setUrl(image ?? "");
  }, [image]);

  function persist(next: string) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("productId", productId);
      fd.set("image", next);
      const res = await invokeServerAction(() => updateProductImageFormAction(fd));
      const _err = getActionError(res); if (_err) { toast.error(_err);
        setUrl(image ?? "");
        return;
      }
      toast.success("Image updated");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-muted">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin CDN URLs
          <img src={url} alt={productName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageIcon className="h-4 w-4" aria-hidden />
          </div>
        )}
      </div>
      {assets.length > 0 ? (
        <MediaPickerDialog
          assets={assets}
          triggerLabel={pending ? "…" : url ? "Change" : "Pick"}
          onSelect={(next) => {
            setUrl(next);
            persist(next);
          }}
        />
      ) : (
        <span className="text-xs text-muted-foreground">No library</span>
      )}
    </div>
  );
}
