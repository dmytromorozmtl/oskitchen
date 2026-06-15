import { notFound } from "next/navigation";

import { VendorProductForm } from "@/components/marketplace/vendor-product-form";
import { PageHeader } from "@/components/layout/page-header";
import { requireVendorCabinetPage } from "@/lib/marketplace/vendor-page-access";
import {
  loadVendorProductCategories,
  loadVendorProductDetail,
} from "@/services/marketplace/vendor-products-service";

export const metadata = { title: "Edit vendor product" };

export default async function VendorProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const access = await requireVendorCabinetPage({
    operation: "vendor.products.edit",
    route: `/vendor/products/${id}/edit`,
  });
  if (!access.ok) return access.deny;

  const [product, categories] = await Promise.all([
    loadVendorProductDetail(access.vendorId, id),
    loadVendorProductCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6 pb-8">
      <PageHeader title={`Edit · ${product.name}`} description={`SKU ${product.sku}`} />
      <VendorProductForm product={product} categories={categories} canManage={access.canManageProducts} />
    </div>
  );
}
