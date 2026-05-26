import type { StorefrontAsset } from "@prisma/client";

import { MediaAssetCard } from "@/components/storefront/media/media-asset-card";
import { MediaPickerDialogTrigger } from "@/components/storefront/media/media-picker-dialog";
import { MediaUploadDropzone } from "@/components/storefront/media/media-upload-dropzone";

export function MediaLibrary({ assets, uploadConfigured }: { assets: StorefrontAsset[]; uploadConfigured: boolean }) {
  const pickerAssets = assets.map((a) => ({
    id: a.id,
    url: a.url,
    label: a.label,
    altText: a.altText,
  }));
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">HTTPS assets linked to this storefront (and your account).</p>
        <MediaPickerDialogTrigger assets={pickerAssets} />
      </div>
      <MediaUploadDropzone uploadConfigured={uploadConfigured} />
      {assets.length === 0 ? (
        <p className="rounded-xl border border-border/80 bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
          No saved assets yet. External URLs typed in Theme still work; this library lists rows in <code className="font-mono">storefront_assets</code> when populated.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((a) => (
            <MediaAssetCard key={a.id} asset={a} />
          ))}
        </div>
      )}
    </div>
  );
}
