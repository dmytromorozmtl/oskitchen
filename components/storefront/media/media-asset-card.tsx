import type { StorefrontAsset } from "@prisma/client";

import { deleteStorefrontMediaFormAction } from "@/actions/storefront-media";
import { Button } from "@/components/ui/button";

export function MediaAssetCard({ asset }: { asset: Pick<StorefrontAsset, "id" | "url" | "kind" | "label" | "createdAt"> }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card p-3 text-sm shadow-sm">
      <p className="truncate font-mono text-xs text-muted-foreground">{asset.url}</p>
      <p className="mt-1 font-medium">{asset.label?.trim() || "Untitled"}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {asset.kind} · {asset.createdAt.toISOString().slice(0, 10)}
      </p>
      <form action={deleteStorefrontMediaFormAction} className="mt-3">
        <input type="hidden" name="assetId" value={asset.id} />
        <Button type="submit" variant="outline" size="sm" className="rounded-full">
          Delete
        </Button>
      </form>
    </div>
  );
}
