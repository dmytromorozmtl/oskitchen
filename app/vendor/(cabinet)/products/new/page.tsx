import { VendorProductForm } from "@/components/marketplace/vendor-product-form";
import { PageHeader } from "@/components/layout/page-header";
import { requireVendorCabinetPage } from "@/lib/marketplace/vendor-page-access";
import { loadVendorProductCategories } from "@/services/marketplace/vendor-products-service";

export const metadata = { title: "New vendor product" };

export default async function VendorProductNewPage() {
  const access = await requireVendorCabinetPage({
    operation: "vendor.products.create",
    route: "/vendor/products/new",
  });
  if (!access.ok) return access.deny;

  const categories = await loadVendorProductCategories();

  return (
    <div className="space-y-6 pb-8">
      <PageHeader title="New product" description="Create a draft SKU or submit directly for marketplace review." />
      <VendorProductForm categories={categories} canManage={access.canManageProducts} />
    </div>
  );
}
