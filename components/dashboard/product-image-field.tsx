"use client";

import * as React from "react";
import Link from "next/link";

import { MediaUrlField } from "@/components/storefront/media/media-url-field";
import type { ProductMediaAsset } from "@/lib/menus/product-image-fields";
import { ImageUploadField } from "@/components/ui/image-upload";

type Props = {
  defaultValue?: string | null;
  assets: ProductMediaAsset[];
  /** Form field name — defaults to `image` (Product.image). */
  name?: string;
};

/**
 * Menu item / product image: media library picker + URL, with Supabase upload when library is empty.
 */
export function ProductImageField({ defaultValue, assets, name = "image" }: Props) {
  const [imageUrl, setImageUrl] = React.useState(defaultValue ?? "");
  const id = `${name}Url`;

  if (assets.length > 0) {
    return (
      <div className="space-y-3">
        <MediaUrlField
          id={id}
          name={name}
          label="Storefront image"
          defaultValue={defaultValue ?? ""}
          assets={assets}
          placeholder="https://cdn…/item.jpg"
        />
        <p className="text-xs text-muted-foreground">
          Shown on menu cards and product pages. Upload more in{" "}
          <Link href="/dashboard/storefront/media" className="text-primary underline-offset-4 hover:underline">
            Storefront → Media
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ImageUploadField label="Storefront image" value={imageUrl} onChange={setImageUrl} />
      <input type="hidden" name={name} value={imageUrl} />
      <p className="text-xs text-muted-foreground">
        Enable a storefront and add files under{" "}
        <Link href="/dashboard/storefront/media" className="text-primary underline-offset-4 hover:underline">
          Media
        </Link>{" "}
        to pick from the library next time.
      </p>
    </div>
  );
}
