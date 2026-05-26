import Link from "next/link";

import { ProductCatalogEmptyState } from "@/components/dashboard/product-catalog-empty-state";
import { ProductManager, type MenuDTO } from "@/components/dashboard/product-manager";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findOwnerKitchenSettings } from "@/lib/scope/owner-kitchen-settings";
import {
  getMenuItemsPageIntro,
  getMenuItemsPageTitle,
} from "@/lib/menu-items/item-terminology";
import { ensureCatalogMenu } from "@/lib/products/ensure-catalog-menu";
import type { OperatingMode } from "@/lib/operating-modes/types";
import { getTenantOperatingMode } from "@/lib/operating-modes/tenant-mode";
import { getCategoryOptionsForWorkspace } from "@/services/products/category-service";
import { loadStorefrontMediaAssetsForUser } from "@/lib/storefront/load-media-assets-for-user";
import {
  menuListWhereForOwner,
  menuListWhereForOwnerAnd,
  productListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

export default async function ProductsPage() {
  const { dataUserId } = await getTenantActor();
  await ensureCatalogMenu(dataUserId);

  const kitchen = await findOwnerKitchenSettings(dataUserId, { businessType: true });
  const businessType = kitchen?.businessType ?? null;
  const operatingMode = (await getTenantOperatingMode(dataUserId)) as OperatingMode;
  const categoryOptions = await getCategoryOptionsForWorkspace(dataUserId, operatingMode);

  const [catalogMenuWhere, menuWhere, productWhere] = await Promise.all([
    menuListWhereForOwnerAnd(dataUserId, { catalogOnly: true }),
    menuListWhereForOwner(dataUserId),
    productListWhereForOwner(dataUserId),
  ]);

  const catalog = await prisma.menu.findFirst({
    where: catalogMenuWhere,
    select: { id: true },
  });

  const menus = await prisma.menu.findMany({
    where: menuWhere,
    include: {
      products: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const totalProducts = await prisma.product.count({
    where: productWhere,
  });

  const pageTitle = getMenuItemsPageTitle(businessType);
  const pageIntro = getMenuItemsPageIntro();
  const mediaAssets = await loadStorefrontMediaAssetsForUser(dataUserId);

  if (totalProducts === 0 && catalog) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{pageTitle}</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">{pageIntro}</p>
        </div>
        <ProductCatalogEmptyState
          catalogMenuId={catalog.id}
          businessType={businessType}
          operatingMode={operatingMode}
          categoryOptions={categoryOptions}
          mediaAssets={mediaAssets}
        />
        <p className="text-center text-sm text-muted-foreground">
          Prefer a guided flow?{" "}
          <Link className="text-primary underline-offset-4 hover:underline" href="/dashboard/products/new">
            Open item wizard
          </Link>{" "}
          or{" "}
          <Link className="text-primary underline-offset-4 hover:underline" href="/dashboard/menus">
            build a menu in Menu Center
          </Link>
          .
        </p>
      </div>
    );
  }

  const dto: MenuDTO[] = menus.map((m) => ({
    id: m.id,
    title: m.title,
    isCatalog: m.catalogOnly,
    products: m.products.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      allergens: p.allergens,
      ingredients: p.ingredients,
      portionSize: p.portionSize,
      reheatingInstructions: p.reheatingInstructions,
      kitchenNotes: p.kitchenNotes,
      preparedDate: p.preparedDate.toISOString(),
      pickupDate: p.pickupDate ? p.pickupDate.toISOString() : null,
      deliveryAvailable: p.deliveryAvailable,
      active: p.active,
      price: String(p.price),
      image: p.image,
    })),
  }));

  return (
    <ProductManager
      menus={dto}
      businessType={businessType}
      operatingMode={operatingMode}
      categoryOptions={categoryOptions}
      pageTitle={pageTitle}
      pageIntro={pageIntro}
      mediaAssets={mediaAssets}
    />
  );
}
