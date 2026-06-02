"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, isValid, parseISO } from "date-fns";
import { LayoutGrid, List, Plus, Rows3, Search, Trash2 } from "lucide-react";
import type { BusinessType } from "@prisma/client";
import { toast } from "sonner";

import { createProduct, deleteProduct, updateProduct } from "@/actions/products";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductImageField } from "@/components/dashboard/product-image-field";
import { ProductTableImageCell } from "@/components/dashboard/product-table-image-cell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  getEditItemSubmitLabel,
  getMenuItemsEmptyStateCopy,
} from "@/lib/menu-items/item-terminology";
import type { ProductMediaAsset } from "@/lib/menus/product-image-fields";
import { ProductCategoryField } from "@/components/dashboard/product-category-field";
import {
  getAddProductDialogTitle,
  getCreateProductSubmitLabel,
  getProductCategoryLabel,
  getProductCreatedToast,
  getProductTitlePlaceholder,
  isWeeklyPreorderMode,
} from "@/lib/products/product-form-config";
import type { OperatingMode } from "@/lib/operating-modes/types";
import type { ProductCategoryOption } from "@/services/products/category-service";
import { formatCurrency } from "@/lib/utils";
import { invokeServerAction } from "@/lib/server-actions/invoke-server-action";

function formatMenuDate(iso: string | null | undefined, dateFmt = "MMM d") {
  if (!iso) return "—";
  const d = parseISO(iso);
  return isValid(d) ? format(d, dateFmt) : "—";
}

export type ProductDTO = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  allergens: string | null;
  ingredients: string | null;
  portionSize: string | null;
  reheatingInstructions: string | null;
  kitchenNotes: string | null;
  preparedDate: string;
  pickupDate: string | null;
  deliveryAvailable: boolean;
  active: boolean;
  price: string;
  image: string | null;
};

export type MenuDTO = {
  id: string;
  title: string;
  /** Hidden per-user library menu — shown as “Catalog” in the UI. */
  isCatalog: boolean;
  products: ProductDTO[];
};

export function ProductForm({
  menuId,
  initial,
  onDone,
  businessType,
  operatingMode,
  categoryOptions,
  mediaAssets = [],
}: {
  menuId: string;
  initial?: ProductDTO | null;
  onDone: () => void;
  businessType?: BusinessType | null;
  operatingMode: OperatingMode;
  categoryOptions: ProductCategoryOption[];
  mediaAssets?: ProductMediaAsset[];
}) {
  const router = useRouter();
  const isWeeklyPreorder = isWeeklyPreorderMode(operatingMode);
  const today = format(new Date(), "yyyy-MM-dd");
  const [delivery, setDelivery] = React.useState(
    initial?.deliveryAvailable ?? false,
  );
  const [active, setActive] = React.useState(initial?.active ?? true);
  const mergedCategoryOptions = React.useMemo(() => {
    if (
      initial?.category &&
      !categoryOptions.some((o) => o.code === initial.category)
    ) {
      return [
        ...categoryOptions,
        {
          code: initial.category,
          label: getProductCategoryLabel(initial.category),
          custom: true,
        },
      ];
    }
    return categoryOptions;
  }, [categoryOptions, initial?.category]);

  const defaultCategory =
    initial?.category ?? mergedCategoryOptions[0]?.code ?? "OTHER";
  const [category, setCategory] = React.useState<string>(defaultCategory);

  const submitLabel = initial
    ? getEditItemSubmitLabel()
    : getCreateProductSubmitLabel(operatingMode);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    fd.set("menuId", menuId);
    fd.set("operatingMode", operatingMode);
    fd.set("category", category);
    fd.set("deliveryAvailable", delivery ? "on" : "off");
    fd.set("active", active ? "on" : "off");
    if (!isWeeklyPreorder) {
      fd.set("preparedDate", today);
      fd.set("pickupDate", "");
      fd.set("portionSize", "");
      fd.set("reheatingInstructions", "");
    }
    const res = await invokeServerAction(() =>
      initial ? updateProduct(initial.id, fd) : createProduct(fd),
    );
    const _err = getActionError(res);
    if (_err) toast.error(_err);
    else {
      toast.success(initial ? "Item updated" : getProductCreatedToast(operatingMode));
      onDone();
      router.refresh();
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <input type="hidden" name="menuId" value={menuId} />
      <input type="hidden" name="operatingMode" value={operatingMode} />
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="deliveryAvailable" value={delivery ? "on" : "off"} />
      <input type="hidden" name="active" value={active ? "on" : "off"} />
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={initial?.title}
          placeholder={getProductTitlePlaceholder(operatingMode, businessType ?? null)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initial?.description ?? ""}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ProductCategoryField
          options={mergedCategoryOptions}
          value={category}
          onChange={setCategory}
        />
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            required
            defaultValue={initial ? Number(initial.price) : undefined}
          />
        </div>
      </div>
      {isWeeklyPreorder ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="preparedDate">Prepared / production date</Label>
              <Input
                id="preparedDate"
                name="preparedDate"
                type="date"
                required
                defaultValue={
                  initial?.preparedDate && isValid(parseISO(initial.preparedDate))
                    ? format(parseISO(initial.preparedDate), "yyyy-MM-dd")
                    : today
                }
              />
              <p className="text-xs text-muted-foreground">
                Used for meal-prep boards and batch production scheduling.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickupDate">Pickup date</Label>
              <Input
                id="pickupDate"
                name="pickupDate"
                type="date"
                defaultValue={
                  initial?.pickupDate && isValid(parseISO(initial.pickupDate))
                    ? format(parseISO(initial.pickupDate), "yyyy-MM-dd")
                    : ""
                }
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="portionSize">Portion size</Label>
              <Input
                id="portionSize"
                name="portionSize"
                defaultValue={initial?.portionSize ?? ""}
                placeholder="450g"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergens">Allergens</Label>
              <Input
                id="allergens"
                name="allergens"
                defaultValue={initial?.allergens ?? ""}
                placeholder="Nuts, dairy…"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reheatingInstructions">Reheating instructions</Label>
            <Textarea
              id="reheatingInstructions"
              name="reheatingInstructions"
              rows={2}
              defaultValue={initial?.reheatingInstructions ?? ""}
            />
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="allergens">Allergens</Label>
          <Input
            id="allergens"
            name="allergens"
            defaultValue={initial?.allergens ?? ""}
            placeholder="Nuts, dairy…"
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="ingredients">Ingredients</Label>
        <Textarea
          id="ingredients"
          name="ingredients"
          rows={2}
          defaultValue={initial?.ingredients ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="kitchenNotes">Kitchen notes (internal)</Label>
        <Textarea
          id="kitchenNotes"
          name="kitchenNotes"
          rows={2}
          defaultValue={initial?.kitchenNotes ?? ""}
        />
      </div>
      <ProductImageField defaultValue={initial?.image} assets={mediaAssets} />
      <div className="flex flex-col gap-3 rounded-xl border border-border/70 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-3 sm:flex-1">
          <div>
            <p className="text-sm font-medium">Listed / active</p>
            <p className="text-xs text-muted-foreground">Hide without deleting.</p>
          </div>
          <Switch checked={active} onCheckedChange={setActive} />
        </div>
        <div className="flex items-center justify-between gap-3 sm:flex-1">
          <div>
            <p className="text-sm font-medium">Delivery available</p>
            <p className="text-xs text-muted-foreground">Eligible for delivery routes.</p>
          </div>
          <Switch checked={delivery} onCheckedChange={setDelivery} />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" className="rounded-full">
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

function AddProductDialog({
  menuId,
  businessType,
  operatingMode,
  categoryOptions,
  mediaAssets,
  triggerLabel,
}: {
  menuId: string;
  businessType: BusinessType | null;
  operatingMode: OperatingMode;
  categoryOptions: ProductCategoryOption[];
  mediaAssets: ProductMediaAsset[];
  triggerLabel: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full" variant="premium">
          <Plus className="mr-2 h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{getAddProductDialogTitle(operatingMode)}</DialogTitle>
        </DialogHeader>
        <ProductForm
          menuId={menuId}
          businessType={businessType}
          operatingMode={operatingMode}
          categoryOptions={categoryOptions}
          mediaAssets={mediaAssets}
          onDone={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function EditProductDialog({
  menuId,
  product,
  businessType,
  operatingMode,
  categoryOptions,
  mediaAssets,
}: {
  menuId: string;
  product: ProductDTO;
  businessType: BusinessType | null;
  operatingMode: OperatingMode;
  categoryOptions: ProductCategoryOption[];
  mediaAssets: ProductMediaAsset[];
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit item</DialogTitle>
        </DialogHeader>
        <ProductForm
          menuId={menuId}
          initial={product}
          businessType={businessType}
          operatingMode={operatingMode}
          categoryOptions={categoryOptions}
          mediaAssets={mediaAssets}
          onDone={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export function ProductManager({
  menus,
  businessType,
  operatingMode,
  categoryOptions,
  pageTitle,
  pageIntro,
  mediaAssets = [],
}: {
  menus: MenuDTO[];
  businessType: BusinessType | null;
  operatingMode: OperatingMode;
  categoryOptions: ProductCategoryOption[];
  pageTitle: string;
  pageIntro: string;
  mediaAssets?: ProductMediaAsset[];
}) {
  const router = useRouter();
  const catalogMenu = menus.find((m) => m.isCatalog);
  const defaultTab =
    !isWeeklyPreorderMode(operatingMode) && catalogMenu ? catalogMenu.id : menus[0]?.id ?? "";
  const [tab, setTab] = React.useState(defaultTab);
  const filterCategories = categoryOptions;
  const [query, setQuery] = React.useState("");
  const [catFilter, setCatFilter] = React.useState<string>("all");
  const [view, setView] = React.useState<"cards" | "table" | "compact">("cards");

  React.useEffect(() => {
    if (!tab && menus[0]?.id) setTab(menus[0].id);
  }, [menus, tab]);

  const activeMenu = menus.find((m) => m.id === tab);
  const addCta = getMenuItemsEmptyStateCopy(businessType).primaryCta;

  const filteredProducts =
    activeMenu?.products.filter((p) => {
      const q = query.toLowerCase();
      const hay = `${p.title} ${p.description ?? ""} ${p.ingredients ?? ""}`.toLowerCase();
      if (q && !hay.includes(q)) return false;
      if (catFilter !== "all" && p.category !== catFilter) return false;
      return true;
    }) ?? [];

  const tabLabel = (m: MenuDTO) => (m.isCatalog ? "Catalog" : m.title);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{pageTitle}</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">{pageIntro}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/products/new">Guided setup</Link>
          </Button>
          {activeMenu ? (
            <AddProductDialog
              menuId={activeMenu.id}
              businessType={businessType}
              operatingMode={operatingMode}
              categoryOptions={categoryOptions}
              mediaAssets={mediaAssets}
              triggerLabel={addCta}
            />
          ) : null}
        </div>
      </div>

      {!menus.length ? (
        <Card className="border-dashed p-10 text-center text-sm text-muted-foreground">
          Loading menus…
        </Card>
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex flex-wrap gap-2">
            {menus.map((m) => (
              <TabsTrigger key={m.id} value={m.id} className="rounded-full">
                {tabLabel(m)}
              </TabsTrigger>
            ))}
          </TabsList>
          {menus.map((m) => (
            <TabsContent key={m.id} value={m.id} className="space-y-4 pt-4">
              {m.isCatalog ? (
                <p className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                  {isWeeklyPreorderMode(operatingMode)
                    ? "Catalog holds items before they are placed on a weekly service menu. Assign items to menus in Menu Center when you are ready to sell."
                    : "Catalog is your live item library — new products are active for POS and storefront immediately. Assign to daily menus in Menu Center when needed."}
                </p>
              ) : null}

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search title, description, ingredients…"
                    className="rounded-full pl-9"
                    value={m.id === tab ? query : ""}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={catFilter} onValueChange={setCatFilter}>
                    <SelectTrigger className="w-[160px] rounded-full">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {filterCategories.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant={view === "cards" ? "secondary" : "outline"}
                    size="icon"
                    className="rounded-full"
                    title="Cards"
                    onClick={() => setView("cards")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={view === "table" ? "secondary" : "outline"}
                    size="icon"
                    className="rounded-full"
                    title="Table"
                    onClick={() => setView("table")}
                  >
                    <Rows3 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={view === "compact" ? "secondary" : "outline"}
                    size="icon"
                    className="rounded-full"
                    title="Compact list"
                    onClick={() => setView("compact")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {view === "cards" ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((p) => (
                    <Card
                      key={p.id}
                      className="overflow-hidden border-border/80 bg-card/90 shadow-sm"
                    >
                      <div className="relative h-40 w-full bg-muted">
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element -- admin: arbitrary CDN URLs may be outside next/image remotePatterns
                          <img
                            src={p.image}
                            alt={p.title}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                            No image
                          </div>
                        )}
                        {!p.active && (
                          <Badge className="absolute right-2 top-2" variant="secondary">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold">{p.title}</p>
                            <p className="text-xs text-muted-foreground">{p.category}</p>
                          </div>
                          <Badge variant="secondary">
                            {formatCurrency(Number(p.price))}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-3">
                          {p.description}
                        </p>
                        {isWeeklyPreorderMode(operatingMode) ? (
                          <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                            <span>Prep {formatMenuDate(p.preparedDate)}</span>
                            {p.pickupDate ? (
                              <span>Pickup {formatMenuDate(p.pickupDate)}</span>
                            ) : null}
                            {p.deliveryAvailable ? (
                              <Badge variant="outline" className="text-[10px]">
                                Delivery
                              </Badge>
                            ) : null}
                          </div>
                        ) : p.deliveryAvailable ? (
                          <Badge variant="outline" className="text-[10px]">
                            Delivery
                          </Badge>
                        ) : null}
                        <div className="flex gap-2 pt-2">
                          <EditProductDialog
                            menuId={m.id}
                            product={p}
                            businessType={businessType}
                            operatingMode={operatingMode}
                            categoryOptions={categoryOptions}
                            mediaAssets={mediaAssets}
                          />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="rounded-full">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete item?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Historical orders referencing this item may block deletion.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={async () => {
                                    const res = await invokeServerAction(() =>
                                      deleteProduct(p.id),
                                    );
                                    const _err = getActionError(res);
                                    if (_err) toast.error(_err);
                                    else {
                                      toast.success("Deleted");
                                      router.refresh();
                                    }
                                  }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : view === "table" ? (
                <Card className="overflow-x-auto border-border/80">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="p-3 w-[120px]">Image</th>
                        <th className="p-3">Item</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Prep</th>
                        <th className="p-3">Price</th>
                        <th className="p-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="border-b border-border/60">
                          <td className="p-3">
                            <ProductTableImageCell
                              productId={p.id}
                              image={p.image}
                              assets={mediaAssets}
                            />
                          </td>
                          <td className="p-3 font-medium">{p.title}</td>
                          <td className="p-3">{p.category}</td>
                          <td className="p-3">{formatMenuDate(p.preparedDate)}</td>
                          <td className="p-3">{formatCurrency(Number(p.price))}</td>
                          <td className="p-3 text-right">
                            <EditProductDialog
                              menuId={m.id}
                              product={p}
                              businessType={businessType}
                              operatingMode={operatingMode}
                              categoryOptions={categoryOptions}
                              mediaAssets={mediaAssets}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              ) : (
                <Card className="divide-y divide-border/70 border-border/80">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{p.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {getProductCategoryLabel(p.category)}
                          {isWeeklyPreorderMode(operatingMode)
                            ? ` · Prep ${formatMenuDate(p.preparedDate)}`
                            : null}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums text-muted-foreground">
                          {formatCurrency(Number(p.price))}
                        </span>
                        <EditProductDialog
                          menuId={m.id}
                          product={p}
                          businessType={businessType}
                          operatingMode={operatingMode}
                          categoryOptions={categoryOptions}
                          mediaAssets={mediaAssets}
                        />
                      </div>
                    </div>
                  ))}
                </Card>
              )}

              {!filteredProducts.length ? (
                <Card className="border-dashed p-8 text-sm text-muted-foreground md:col-span-2 xl:col-span-3">
                  No items match filters for this {m.isCatalog ? "catalog" : "menu"}.
                </Card>
              ) : null}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
