"use client";

import * as React from "react";
import { UtensilsCrossed } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { ProductForm } from "@/components/dashboard/product-manager";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { BusinessType } from "@prisma/client";
import type { ProductMediaAsset } from "@/lib/menus/product-image-fields";

import { getMenuItemsEmptyStateCopy } from "@/lib/menu-items/item-terminology";
import { getAddProductDialogTitle } from "@/lib/products/product-form-config";
import type { OperatingMode } from "@/lib/operating-modes/types";
import type { ProductCategoryOption } from "@/services/products/category-service";

export function ProductCatalogEmptyState({
  catalogMenuId,
  businessType,
  operatingMode,
  categoryOptions,
  mediaAssets = [],
}: {
  catalogMenuId: string;
  businessType: BusinessType | null;
  operatingMode: OperatingMode;
  categoryOptions: ProductCategoryOption[];
  mediaAssets?: ProductMediaAsset[];
}) {
  const [open, setOpen] = React.useState(false);
  const copy = getMenuItemsEmptyStateCopy(businessType);

  return (
    <EmptyState
      icon={UtensilsCrossed}
      title={copy.title}
      description={copy.description}
      primarySlot={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full" variant="premium" type="button">
              {copy.primaryCta}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{getAddProductDialogTitle(operatingMode)}</DialogTitle>
            </DialogHeader>
            <ProductForm
              menuId={catalogMenuId}
              businessType={businessType}
              operatingMode={operatingMode}
              categoryOptions={categoryOptions}
              mediaAssets={mediaAssets}
              onDone={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      }
      secondaryLabel="Menu Center"
      secondaryHref="/dashboard/menus"
      demoHref="/demo"
    />
  );
}
