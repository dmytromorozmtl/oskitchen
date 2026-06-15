"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  createVendorProductAction,
  updateVendorProductAction,
} from "@/actions/vendor/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { vendorProductStatusLabel } from "@/lib/marketplace/vendor-product-filters";
import type {
  VendorProductDetail,
  VendorProductMediaItem,
  VendorProductVariantInput,
  VendorVolumePriceInput,
} from "@/services/marketplace/vendor-products-service";
import type { MarketplaceCurrency, MarketplaceProductStatus } from "@prisma/client";

type CategoryOption = { id: string; name: string; slug: string };

export function VendorProductForm({
  categories,
  product,
  canManage,
}: {
  categories: CategoryOption[];
  product?: VendorProductDetail;
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [variants, setVariants] = useState<VendorProductVariantInput[]>(product?.variants ?? []);
  const [volumePricing, setVolumePricing] = useState<VendorVolumePriceInput[]>(
    product?.volumePricing ?? [],
  );
  const [media, setMedia] = useState<VendorProductMediaItem[]>(product?.media ?? [{ url: "", alt: "" }]);
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? "");
  const [currency, setCurrency] = useState<MarketplaceCurrency>(product?.currency ?? "USD");
  const [priceUnit, setPriceUnit] = useState(product?.priceUnit ?? "PER_UNIT");
  const [weightUnit, setWeightUnit] = useState(product?.weightUnit ?? "");
  const [storageRequirement, setStorageRequirement] = useState(product?.storageRequirement ?? "");

  if (!canManage) {
    return <p className="text-sm text-muted-foreground">Read-only — you cannot edit products.</p>;
  }

  function submit(submitForReview: boolean) {
    const form = document.getElementById("vendor-product-form") as HTMLFormElement | null;
    if (!form) return;
    const data = new FormData(form);

    const payload = {
      name: String(data.get("name") ?? ""),
      sku: String(data.get("sku") ?? ""),
      gtin: String(data.get("gtin") ?? "") || null,
      categoryId,
      description: String(data.get("description") ?? ""),
      richDescription: String(data.get("richDescription") ?? "") || null,
      basePrice: Number(data.get("basePrice")),
      currency: currency as never,
      priceUnit: priceUnit as never,
      caseSize: data.get("caseSize") ? Number(data.get("caseSize")) : null,
      moq: Number(data.get("moq") ?? 1),
      orderIncrement: Number(data.get("orderIncrement") ?? 1),
      stockQty: Number(data.get("stockQty") ?? 0),
      minStockAlert: data.get("minStockAlert") ? Number(data.get("minStockAlert")) : null,
      leadTimeDays: Number(data.get("leadTimeDays") ?? 3),
      allowBackorder: data.get("allowBackorder") === "on",
      weight: data.get("weight") ? Number(data.get("weight")) : null,
      weightUnit: (weightUnit || null) as never,
      storageRequirement: (storageRequirement || null) as never,
      certifications: String(data.get("certifications") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      tags: String(data.get("tags") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      media: media.filter((item) => item.url.trim()),
      seoTitle: String(data.get("seoTitle") ?? "") || null,
      seoDescription: String(data.get("seoDescription") ?? "") || null,
      variants: variants.filter((variant) => variant.name.trim() && variant.sku.trim()),
      volumePricing: volumePricing.filter((tier) => tier.minQuantity > 0 && tier.price > 0),
    };

    toast.success(product ? "Saved" : "Product created");
    startTransition(async () => {
      const result = product
        ? await updateVendorProductAction({ ...payload, productId: product.id })
        : await createVendorProductAction({ ...payload, submitForReview });

      if (result.ok) {
        router.push("/vendor/products");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to save. Please retry.");
      }
    });
  }

  return (
    <form id="vendor-product-form" className="space-y-8" onSubmit={(event) => event.preventDefault()}>
      {product ? (
        <p className="text-sm text-muted-foreground">
          Status: {vendorProductStatusLabel(product.status as MarketplaceProductStatus)} ·{" "}
          <Link href={`/dashboard/marketplace/products/${product.slug}`} className="text-primary underline" target="_blank">
            Preview in catalog
          </Link>
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2">
        <Field label="Product name" name="name" defaultValue={product?.name} required />
        <Field label="SKU" name="sku" defaultValue={product?.sku} required />
        <Field label="GTIN" name="gtin" defaultValue={product?.gtin ?? ""} />
        <div>
          <Label htmlFor="categoryId">Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="categoryId" className="rounded-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="space-y-3">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={4} defaultValue={product?.description} required />
        <Label htmlFor="richDescription">Rich description</Label>
        <Textarea id="richDescription" name="richDescription" rows={3} defaultValue={product?.richDescription ?? ""} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Base price" name="basePrice" type="number" step="0.01" defaultValue={product?.basePrice ?? 0} required />
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={currency}
            onValueChange={(value) => setCurrency(value as MarketplaceCurrency)}
          >
            <SelectTrigger id="currency"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["USD", "EUR", "GBP", "CAD"].map((currency) => (
                <SelectItem key={currency} value={currency}>{currency}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priceUnit">Price unit</Label>
          <Select
            value={priceUnit}
            onValueChange={(value) => setPriceUnit(value as typeof priceUnit)}
          >
            <SelectTrigger id="priceUnit"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["PER_UNIT", "PER_CASE", "PER_KG", "PER_LITRE", "PER_PALLET"].map((unit) => (
                <SelectItem key={unit} value={unit}>{unit.replace(/^PER_/, "").replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Field label="Case size" name="caseSize" type="number" defaultValue={product?.caseSize ?? ""} />
        <Field label="MOQ" name="moq" type="number" defaultValue={product?.moq ?? 1} required />
        <Field label="Order increment" name="orderIncrement" type="number" defaultValue={product?.orderIncrement ?? 1} required />
        <Field label="Stock qty" name="stockQty" type="number" defaultValue={product?.stockQty ?? 0} required />
        <Field label="Min stock alert" name="minStockAlert" type="number" defaultValue={product?.minStockAlert ?? ""} />
        <Field label="Lead time (days)" name="leadTimeDays" type="number" defaultValue={product?.leadTimeDays ?? 3} required />
        <div className="flex items-end gap-2 pb-2">
          <input id="allowBackorder" name="allowBackorder" type="checkbox" defaultChecked={product?.allowBackorder} />
          <Label htmlFor="allowBackorder">Allow backorder</Label>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Field label="Weight" name="weight" type="number" step="0.0001" defaultValue={product?.weight ?? ""} />
        <div>
          <Label htmlFor="weightUnit">Weight unit</Label>
          <Select value={weightUnit || undefined} onValueChange={setWeightUnit}>
            <SelectTrigger id="weightUnit"><SelectValue placeholder="Optional" /></SelectTrigger>
            <SelectContent>
              {["G", "KG", "OZ", "LB"].map((unit) => (
                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="storageRequirement">Storage</Label>
          <Select value={storageRequirement || undefined} onValueChange={setStorageRequirement}>
            <SelectTrigger id="storageRequirement"><SelectValue placeholder="Optional" /></SelectTrigger>
            <SelectContent>
              {["AMBIENT", "REFRIGERATED", "FROZEN", "HAZMAT"].map((value) => (
                <SelectItem key={value} value={value}>{value}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Field label="Certifications (comma-separated)" name="certifications" defaultValue={product?.certifications?.join(", ") ?? ""} className="sm:col-span-2" />
        <Field label="Tags (comma-separated)" name="tags" defaultValue={product?.tags?.join(", ") ?? ""} />
      </section>

      <VariantSection variants={variants} setVariants={setVariants} />
      <VolumePricingSection tiers={volumePricing} setTiers={setVolumePricing} />
      <MediaSection media={media} setMedia={setMedia} />

      <section className="grid gap-4 sm:grid-cols-2">
        <Field label="SEO title" name="seoTitle" defaultValue={product?.seoTitle ?? ""} />
        <Field label="SEO description" name="seoDescription" defaultValue={product?.seoDescription ?? ""} />
      </section>

      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={pending} className="rounded-full" onClick={() => submit(false)}>
          {product ? "Save changes" : "Save draft"}
        </Button>
        {!product ? (
          <Button type="button" variant="secondary" disabled={pending} className="rounded-full" onClick={() => submit(true)}>
            Submit for review
          </Button>
        ) : null}
        <Button asChild type="button" variant="outline" className="rounded-full">
          <Link href="/vendor/products">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  step,
  required,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  step?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} step={step} defaultValue={defaultValue ?? ""} required={required} />
    </div>
  );
}

function VariantSection({
  variants,
  setVariants,
}: {
  variants: VendorProductVariantInput[];
  setVariants: React.Dispatch<React.SetStateAction<VendorProductVariantInput[]>>;
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-border/80 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Variants</h3>
        <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={() => setVariants((prev) => [...prev, { name: "", sku: "", stockQty: 0, price: null }])}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add variant
        </Button>
      </div>
      {variants.map((variant, index) => (
        <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_8rem_8rem_auto]">
          <Input placeholder="Variant name" value={variant.name} onChange={(e) => setVariants((prev) => prev.map((row, i) => i === index ? { ...row, name: e.target.value } : row))} />
          <Input placeholder="SKU" value={variant.sku} onChange={(e) => setVariants((prev) => prev.map((row, i) => i === index ? { ...row, sku: e.target.value } : row))} />
          <Input type="number" placeholder="Price" value={variant.price ?? ""} onChange={(e) => setVariants((prev) => prev.map((row, i) => i === index ? { ...row, price: e.target.value ? Number(e.target.value) : null } : row))} />
          <Input type="number" placeholder="Stock" value={variant.stockQty} onChange={(e) => setVariants((prev) => prev.map((row, i) => i === index ? { ...row, stockQty: Number(e.target.value) } : row))} />
          <Button type="button" variant="ghost" size="icon" onClick={() => setVariants((prev) => prev.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ))}
    </section>
  );
}

function VolumePricingSection({
  tiers,
  setTiers,
}: {
  tiers: VendorVolumePriceInput[];
  setTiers: React.Dispatch<React.SetStateAction<VendorVolumePriceInput[]>>;
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-border/80 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Volume pricing</h3>
        <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={() => setTiers((prev) => [...prev, { minQuantity: 10, price: 0 }])}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add tier
        </Button>
      </div>
      {tiers.map((tier, index) => (
        <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <Input type="number" placeholder="Min qty" value={tier.minQuantity} onChange={(e) => setTiers((prev) => prev.map((row, i) => i === index ? { ...row, minQuantity: Number(e.target.value) } : row))} />
          <Input type="number" step="0.01" placeholder="Unit price" value={tier.price} onChange={(e) => setTiers((prev) => prev.map((row, i) => i === index ? { ...row, price: Number(e.target.value) } : row))} />
          <Button type="button" variant="ghost" size="icon" onClick={() => setTiers((prev) => prev.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ))}
    </section>
  );
}

function MediaSection({
  media,
  setMedia,
}: {
  media: VendorProductMediaItem[];
  setMedia: React.Dispatch<React.SetStateAction<VendorProductMediaItem[]>>;
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-border/80 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Media</h3>
        <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={() => setMedia((prev) => [...prev, { url: "", alt: "" }])}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add image URL
        </Button>
      </div>
      {media.map((item, index) => (
        <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <Input placeholder="Image URL" value={item.url} onChange={(e) => setMedia((prev) => prev.map((row, i) => i === index ? { ...row, url: e.target.value } : row))} />
          <Input placeholder="Alt text" value={item.alt ?? ""} onChange={(e) => setMedia((prev) => prev.map((row, i) => i === index ? { ...row, alt: e.target.value } : row))} />
          <Button type="button" variant="ghost" size="icon" onClick={() => setMedia((prev) => prev.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ))}
    </section>
  );
}
