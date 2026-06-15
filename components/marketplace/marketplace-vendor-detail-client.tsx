"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";

import {
  quickReorderMarketplaceVendorAction,
  rateMarketplaceVendorAction,
  toggleMarketplaceVendorFavoriteAction,
  uploadMarketplaceVendorContractAction,
} from "@/actions/marketplace/vendors";
import { MarketplaceOrderStatusBadge } from "@/components/marketplace/marketplace-order-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import type { MarketplaceVendorDetail } from "@/services/marketplace/marketplace-vendors-service";

export function MarketplaceVendorDetailClient({
  vendor,
  canManageContract,
  canRate,
  canReorder,
}: {
  vendor: MarketplaceVendorDetail;
  canManageContract: boolean;
  canRate: boolean;
  canReorder: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-6">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>{vendor.companyName}</CardTitle>
              <CardDescription>
                {vendor.legalName} · {vendor.type.replace(/_/g, " ").toLowerCase()}
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await toggleMarketplaceVendorFavoriteAction(vendor.id);
                  if (result.ok) toast.success(result.isFavorite ? "Favorited" : "Unfavorited");
                  else toast.error(result.error);
                })
              }
            >
              {vendor.isFavorite ? "Unfavorite" : "Favorite"}
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Total spent" value={formatCurrency(vendor.totalSpent, "USD")} />
            <Metric label="Orders" value={String(vendor.orderCount)} />
            <Metric
              label="Avg rating"
              value={vendor.avgRating != null ? `${vendor.avgRating} / 5` : "—"}
            />
            <Metric
              label="Avg delivery"
              value={vendor.avgDeliveryDays != null ? `${vendor.avgDeliveryDays} days` : "—"}
            />
          </CardContent>
        </Card>

        {canManageContract ? (
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Contract</CardTitle>
              <CardDescription>
                Store contract metadata and reference URL for this supplier relationship.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vendor.contract ? (
                <div className="mb-4 rounded-xl border border-border/70 bg-muted/30 p-3 text-sm">
                  <p className="font-medium">{vendor.contract.fileName}</p>
                  {vendor.contract.fileUrl ? (
                    <a
                      href={vendor.contract.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Open document
                    </a>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    Uploaded {new Date(vendor.contract.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              ) : null}

              <form
                className="grid gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  const data = new FormData(event.currentTarget);
                  startTransition(async () => {
                    const result = await uploadMarketplaceVendorContractAction({
                      vendorId: vendor.id,
                      fileName: String(data.get("fileName") ?? ""),
                      fileUrl: String(data.get("fileUrl") ?? "") || null,
                      effectiveDate: String(data.get("effectiveDate") ?? "") || null,
                      expiresAt: String(data.get("expiresAt") ?? "") || null,
                      notes: String(data.get("notes") ?? "") || null,
                    });
                    if (result.ok) toast.success("Contract saved");
                    else toast.error(result.error);
                  });
                }}
              >
                <div>
                  <Label htmlFor="fileName">Document name</Label>
                  <Input id="fileName" name="fileName" required placeholder="2026-supply-agreement.pdf" />
                </div>
                <div>
                  <Label htmlFor="fileUrl">Document URL</Label>
                  <Input id="fileUrl" name="fileUrl" placeholder="https://…" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="effectiveDate">Effective date</Label>
                    <Input id="effectiveDate" name="effectiveDate" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="expiresAt">Expires</Label>
                    <Input id="expiresAt" name="expiresAt" type="date" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" rows={2} placeholder="Net-30, MOQ exceptions…" />
                </div>
                <Button type="submit" disabled={pending} className="w-fit rounded-full">
                  Save contract
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Order history</CardTitle>
          </CardHeader>
          <CardContent>
            {vendor.orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders with this vendor yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendor.orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/marketplace/orders/${order.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {order.poNumber ?? order.id.slice(0, 8)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <MarketplaceOrderStatusBadge status={order.status as never} />
                      </TableCell>
                      <TableCell>
                        {formatCurrency(order.total, order.currency as "USD")}
                      </TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {canRate && vendor.rateableOrders.length > 0 ? (
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Rate vendor</CardTitle>
              <CardDescription>Score completed orders to help your team choose suppliers.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  const data = new FormData(event.currentTarget);
                  startTransition(async () => {
                    const result = await rateMarketplaceVendorAction({
                      vendorId: vendor.id,
                      purchaseOrderId: String(data.get("purchaseOrderId") ?? ""),
                      qualityScore: Number(data.get("qualityScore")),
                      accuracyScore: Number(data.get("accuracyScore")),
                      deliveryScore: Number(data.get("deliveryScore")),
                      packagingScore: Number(data.get("packagingScore")),
                      comment: String(data.get("comment") ?? "") || null,
                    });
                    if (result.ok) toast.success("Review submitted");
                    else toast.error(result.error);
                  });
                }}
              >
                <div>
                  <Label>Order</Label>
                  <Select name="purchaseOrderId" required>
                    <SelectTrigger className="rounded-full">
                      <SelectValue placeholder="Select completed order" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendor.rateableOrders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.poNumber ?? order.id.slice(0, 8)} ·{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ScoreField name="qualityScore" label="Quality" />
                <ScoreField name="accuracyScore" label="Accuracy" />
                <ScoreField name="deliveryScore" label="Delivery" />
                <ScoreField name="packagingScore" label="Packaging" />
                <div>
                  <Label htmlFor="comment">Comment</Label>
                  <Textarea id="comment" name="comment" rows={2} />
                </div>
                <Button type="submit" disabled={pending} className="w-fit rounded-full">
                  Submit review
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="space-y-4">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {canReorder ? (
              <Button
                className="w-full rounded-full"
                disabled={pending || vendor.orderCount === 0}
                onClick={() =>
                  startTransition(async () => {
                    const result = await quickReorderMarketplaceVendorAction(vendor.id);
                    if (result.ok) {
                      toast.success(`Added ${result.itemCount} lines to cart`);
                      window.location.href = "/dashboard/marketplace/checkout";
                    } else toast.error(result.error);
                  })
                }
              >
                Quick reorder last PO
              </Button>
            ) : null}
            <Button asChild variant="outline" className="w-full rounded-full">
              <Link href={`/dashboard/marketplace/catalog?vendor=${vendor.id}`}>Browse catalog</Link>
            </Button>
          </CardContent>
        </Card>

        {vendor.topProducts.length > 0 ? (
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Top products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {vendor.topProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/dashboard/marketplace/products/${product.slug}`}
                  className="block rounded-xl border border-border/70 p-3 text-sm hover:bg-muted/40"
                >
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(product.basePrice, product.currency as "USD")}
                  </p>
                </Link>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {vendor.verifiedAt ? (
          <Badge variant="secondary" className="rounded-full">
            Verified {new Date(vendor.verifiedAt).toLocaleDateString()}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function ScoreField({ name, label }: { name: string; label: string }) {
  return (
    <div>
      <Label htmlFor={name}>{label} (1–5)</Label>
      <Input id={name} name={name} type="number" min={1} max={5} defaultValue={5} required />
    </div>
  );
}
