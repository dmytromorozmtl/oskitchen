"use client";

import { getActionError } from "@/lib/action-result";

import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { createOrderViaCenterAction } from "@/actions/order-creation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  modeFor,
  type OrderCreationModeConfig,
} from "@/lib/orders/order-creation-modes";
import { FULFILLMENT_LABEL, type FulfillmentDetailKey } from "@/lib/orders/order-fulfillment";
import { PAYMENT_MODE_LABEL, type PaymentModeKey } from "@/lib/orders/order-payment";
import { ORDER_STATUS_LABEL, type OrderStatusKey } from "@/lib/orders/order-status";
import {
  ORDER_TYPE_DESCRIPTION,
  ORDER_TYPE_LABEL,
  USER_CREATABLE_ORDER_TYPES,
  type OrderCreationType,
} from "@/lib/orders/order-types";
import { cn, formatCurrency } from "@/lib/utils";

export type CenterCustomer = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
};

export type CenterProduct = {
  id: string;
  title: string;
  menuId: string;
  menuTitle: string;
  price: number;
  active: boolean;
  catalogOnly: boolean;
  isOnActiveMenu: boolean;
};

export type CenterContext = {
  hasActiveMenu: boolean;
  activeMenuTitle: string | null;
  products: CenterProduct[];
  customers: CenterCustomer[];
};

type Line = {
  key: string;
  productId?: string;
  title?: string;
  quantity: number;
  unitPrice?: number;
  notes?: string;
  preparedDate?: string;
};

const STEPS = [
  "Order type",
  "Customer",
  "Items",
  "Fulfillment",
  "Payment / status",
  "Review",
] as const;

export function OrderCenter({ context }: { context: CenterContext }) {
  const [step, setStep] = React.useState(0);
  const [orderType, setOrderType] = React.useState<OrderCreationType | null>(null);

  const mode: OrderCreationModeConfig | null = orderType ? modeFor(orderType) : null;

  // Customer state
  const [customerMode, setCustomerMode] = React.useState<"guest" | "existing">("guest");
  const [customerId, setCustomerId] = React.useState<string | undefined>(undefined);
  const [customerName, setCustomerName] = React.useState("");
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [allergyNotes, setAllergyNotes] = React.useState("");
  const [dietaryNotes, setDietaryNotes] = React.useState("");

  // Items state
  const [lines, setLines] = React.useState<Line[]>([
    { key: crypto.randomUUID(), quantity: 1 },
  ]);

  // Fulfillment state
  const [fulfillment, setFulfillment] = React.useState<FulfillmentDetailKey>("PICKUP");
  const [fulfillmentDate, setFulfillmentDate] = React.useState("");
  const [windowStart, setWindowStart] = React.useState("");
  const [windowEnd, setWindowEnd] = React.useState("");
  const [addrLine1, setAddrLine1] = React.useState("");
  const [addrCity, setAddrCity] = React.useState("");
  const [addrRegion, setAddrRegion] = React.useState("");
  const [addrPostal, setAddrPostal] = React.useState("");
  const [deliveryNotes, setDeliveryNotes] = React.useState("");

  // Payment / status state
  const [paymentMode, setPaymentMode] = React.useState<PaymentModeKey>("PAY_LATER");
  const [statusKey, setStatusKey] = React.useState<OrderStatusKey>("CONFIRMED");
  const [notes, setNotes] = React.useState("");

  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!mode) return;
    setFulfillment(mode.defaultFulfillment);
    setPaymentMode(mode.defaultPaymentMode);
    setStatusKey(mode.defaultStatus);
  }, [mode]);

  const availableProducts = React.useMemo(() => {
    if (!mode) return [];
    if (mode.type === "PREORDER") {
      return context.products.filter((p) => p.isOnActiveMenu);
    }
    if (!mode.allowsCatalog && !mode.allowsActiveMenu) return [];
    return context.products.filter((p) => p.active);
  }, [context.products, mode]);

  const subtotal = React.useMemo(() => {
    let s = 0;
    for (const line of lines) {
      const prod = line.productId ? context.products.find((p) => p.id === line.productId) : null;
      const unit = typeof line.unitPrice === "number" ? line.unitPrice : prod ? prod.price : 0;
      s += unit * (line.quantity || 0);
    }
    return s;
  }, [lines, context.products]);

  function selectType(t: OrderCreationType) {
    setOrderType(t);
    setStep(1);
  }

  function addLine() {
    setLines((p) => [...p, { key: crypto.randomUUID(), quantity: 1 }]);
  }

  function removeLine(key: string) {
    setLines((p) => p.filter((l) => l.key !== key));
  }

  function updateLine(key: string, patch: Partial<Line>) {
    setLines((p) => p.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  async function submit() {
    if (!mode || !orderType) return;

    const validLines = lines.filter(
      (l) => (l.productId || (l.title && l.title.trim().length > 0)) && l.quantity > 0,
    );
    if (validLines.length === 0) {
      toast.error("Add at least one line item.");
      setStep(2);
      return;
    }

    if (mode.requiresActiveWeeklyMenu && !context.hasActiveMenu) {
      toast.error("Weekly preorder requires an active weekly menu.");
      return;
    }

    setSubmitting(true);
    const fd = new FormData();
    fd.set(
      "payload",
      JSON.stringify({
        orderType,
        statusKey,
        fulfillmentDetail: fulfillment,
        paymentMode,
        customerId: customerMode === "existing" ? customerId : undefined,
        customerName: customerName || undefined,
        customerEmail: customerEmail || undefined,
        customerPhone: customerPhone || undefined,
        fulfillmentDate: fulfillmentDate || undefined,
        fulfillmentWindowStart: windowStart || undefined,
        fulfillmentWindowEnd: windowEnd || undefined,
        deliveryAddressJson:
          addrLine1 || addrCity
            ? { line1: addrLine1, city: addrCity, region: addrRegion, postalCode: addrPostal, notes: deliveryNotes || undefined }
            : undefined,
        notes: notes || undefined,
        deliveryNotes: deliveryNotes || undefined,
        allergyNotes: allergyNotes || undefined,
        dietaryNotes: dietaryNotes || undefined,
        subtotal,
        lines: validLines.map((l) => ({
          productId: l.productId || undefined,
          title: l.title || undefined,
          quantity: l.quantity,
          unitPrice: typeof l.unitPrice === "number" ? l.unitPrice : undefined,
          notes: l.notes || undefined,
          preparedDate: l.preparedDate || undefined,
        })),
      }),
    );
    try {
      const res = await createOrderViaCenterAction(fd);
      if (!res.ok) {
        toast.error(getActionError(res) ?? "Something went wrong");
        return;
      }
      toast.success("Order created.");
      window.location.href = `/dashboard/orders?created=${res.orderId}`;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Order creation failed.");
    } finally {
      setSubmitting(false);
    }
  }

  const customerWarning =
    !customerName && !customerId
      ? "No customer name provided — order will be saved as a walk-in."
      : null;

  const deliveryWarning =
    ["DELIVERY", "EVENT_DELIVERY", "CATERING_LOADOUT", "THIRD_PARTY_DELIVERY"].includes(fulfillment) &&
    !addrLine1
      ? "Delivery selected without an address."
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">New order</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Create manual orders, preorders, pickup/delivery orders, catering orders, bakery
            orders, café orders, or custom requests.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/orders">Back</Link>
        </Button>
      </div>

      <Stepper step={step} onJump={(i) => orderType && setStep(i)} />

      {step === 0 && (
        <TypeStep
          onSelect={selectType}
          hasActiveMenu={context.hasActiveMenu}
          activeMenuTitle={context.activeMenuTitle}
        />
      )}

      {step > 0 && orderType && mode && (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {step === 1 && (
              <CustomerStep
                mode={mode}
                customers={context.customers}
                customerMode={customerMode}
                onCustomerMode={setCustomerMode}
                customerId={customerId}
                onCustomerId={setCustomerId}
                name={customerName}
                onName={setCustomerName}
                email={customerEmail}
                onEmail={setCustomerEmail}
                phone={customerPhone}
                onPhone={setCustomerPhone}
                allergyNotes={allergyNotes}
                onAllergyNotes={setAllergyNotes}
                dietaryNotes={dietaryNotes}
                onDietaryNotes={setDietaryNotes}
              />
            )}
            {step === 2 && (
              <ItemsStep
                mode={mode}
                products={availableProducts}
                lines={lines}
                onAdd={addLine}
                onRemove={removeLine}
                onUpdate={updateLine}
                hasActiveMenu={context.hasActiveMenu}
              />
            )}
            {step === 3 && (
              <FulfillmentStep
                mode={mode}
                fulfillment={fulfillment}
                onFulfillment={setFulfillment}
                fulfillmentDate={fulfillmentDate}
                onFulfillmentDate={setFulfillmentDate}
                windowStart={windowStart}
                windowEnd={windowEnd}
                onWindowStart={setWindowStart}
                onWindowEnd={setWindowEnd}
                addrLine1={addrLine1}
                addrCity={addrCity}
                addrRegion={addrRegion}
                addrPostal={addrPostal}
                onAddr={(p) => {
                  if (p.line1 !== undefined) setAddrLine1(p.line1);
                  if (p.city !== undefined) setAddrCity(p.city);
                  if (p.region !== undefined) setAddrRegion(p.region);
                  if (p.postal !== undefined) setAddrPostal(p.postal);
                }}
                deliveryNotes={deliveryNotes}
                onDeliveryNotes={setDeliveryNotes}
              />
            )}
            {step === 4 && (
              <PaymentStatusStep
                mode={mode}
                paymentMode={paymentMode}
                onPaymentMode={setPaymentMode}
                statusKey={statusKey}
                onStatus={setStatusKey}
                notes={notes}
                onNotes={setNotes}
              />
            )}
            {step === 5 && (
              <ReviewStep
                mode={mode}
                lines={lines}
                products={context.products}
                customerName={customerName || (customerId ? "(linked customer)" : "Walk-in customer")}
                customerEmail={customerEmail}
                fulfillment={fulfillment}
                fulfillmentDate={fulfillmentDate}
                subtotal={subtotal}
                statusKey={statusKey}
                paymentMode={paymentMode}
                allergyNotes={allergyNotes}
                customerWarning={customerWarning}
                deliveryWarning={deliveryWarning}
              />
            )}

            <div className="flex flex-wrap justify-between gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || submitting}>
                Back
              </Button>
              {step < 5 ? (
                <Button onClick={() => setStep((s) => Math.min(5, s + 1))} disabled={submitting}>
                  Next
                </Button>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" disabled={submitting} onClick={() => { setStatusKey("DRAFT"); void submit(); }}>
                    Save draft
                  </Button>
                  <Button disabled={submitting} onClick={submit}>
                    {submitting ? "Creating…" : `Create ${ORDER_STATUS_LABEL[statusKey].toLowerCase()} order`}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Summary
            mode={mode}
            subtotal={subtotal}
            statusKey={statusKey}
            paymentMode={paymentMode}
            fulfillment={fulfillment}
            customerName={customerName}
            warnings={[customerWarning, deliveryWarning].filter((w): w is string => Boolean(w))}
          />
        </div>
      )}
    </div>
  );
}

function Stepper({ step, onJump }: { step: number; onJump: (i: number) => void }) {
  return (
    <ol className="flex flex-wrap gap-2 text-xs">
      {STEPS.map((label, idx) => (
        <li key={label}>
          <button
            type="button"
            onClick={() => onJump(idx)}
            className={cn(
              "rounded-full border px-3 py-1.5 font-medium transition-colors",
              idx === step
                ? "border-primary bg-primary text-primary-foreground"
                : idx < step
                  ? "border-muted bg-muted text-foreground"
                  : "border-dashed text-muted-foreground",
            )}
          >
            {idx + 1}. {label}
          </button>
        </li>
      ))}
    </ol>
  );
}

function TypeStep({
  onSelect,
  hasActiveMenu,
  activeMenuTitle,
}: {
  onSelect: (t: OrderCreationType) => void;
  hasActiveMenu: boolean;
  activeMenuTitle: string | null;
}) {
  return (
    <div className="space-y-4">
      {!hasActiveMenu && (
        <Card className="border-amber-300 bg-amber-50/40">
          <CardHeader>
            <CardTitle className="text-base text-amber-900">Weekly preorder needs an active menu</CardTitle>
            <CardDescription className="text-amber-900/80">
              Activate a weekly menu to create weekly preorders. You can still create manual,
              custom, catering, bakery, café, restaurant, or event orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/menus">Open Weekly Menus</Link>
            </Button>
          </CardContent>
        </Card>
      )}
      {hasActiveMenu && activeMenuTitle && (
        <p className="text-xs text-muted-foreground">
          Active weekly menu: <span className="font-medium text-foreground">{activeMenuTitle}</span>
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {USER_CREATABLE_ORDER_TYPES.map((t) => {
          const m = modeFor(t);
          const disabled = m.requiresActiveWeeklyMenu && !hasActiveMenu;
          return (
            <button
              type="button"
              key={t}
              onClick={() => !disabled && onSelect(t)}
              disabled={disabled}
              className={cn(
                "flex flex-col gap-2 rounded-2xl border bg-card p-4 text-left transition-colors",
                disabled ? "cursor-not-allowed opacity-50" : "hover:border-primary",
              )}
            >
              <span className="flex items-center justify-between">
                <span className="text-base font-semibold">{ORDER_TYPE_LABEL[t]}</span>
                {m.requiresActiveWeeklyMenu ? <Badge variant="outline">menu required</Badge> : null}
              </span>
              <span className="text-xs text-muted-foreground">{ORDER_TYPE_DESCRIPTION[t]}</span>
              <span className="mt-auto flex flex-wrap gap-1 text-[10px] text-muted-foreground">
                <span className="rounded bg-muted px-1.5 py-0.5">menu: {m.allowsActiveMenu ? "yes" : "no"}</span>
                <span className="rounded bg-muted px-1.5 py-0.5">catalog: {m.allowsCatalog ? "yes" : "no"}</span>
                <span className="rounded bg-muted px-1.5 py-0.5">custom: {m.allowsCustomLines ? "yes" : "no"}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CustomerStep(props: {
  mode: OrderCreationModeConfig;
  customers: CenterCustomer[];
  customerMode: "guest" | "existing";
  onCustomerMode: (v: "guest" | "existing") => void;
  customerId: string | undefined;
  onCustomerId: (v: string | undefined) => void;
  name: string;
  onName: (v: string) => void;
  email: string;
  onEmail: (v: string) => void;
  phone: string;
  onPhone: (v: string) => void;
  allergyNotes: string;
  onAllergyNotes: (v: string) => void;
  dietaryNotes: string;
  onDietaryNotes: (v: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Customer</CardTitle>
        <CardDescription>
          Optional for some types. Required fields may differ based on the chosen order type.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button size="sm" variant={props.customerMode === "guest" ? "default" : "outline"} onClick={() => props.onCustomerMode("guest")}>
            Guest / new
          </Button>
          <Button size="sm" variant={props.customerMode === "existing" ? "default" : "outline"} onClick={() => props.onCustomerMode("existing")}>
            Existing
          </Button>
        </div>

        {props.customerMode === "existing" ? (
          <div className="space-y-2">
            <Label>Pick customer</Label>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={props.customerId ?? ""}
              onChange={(e) => props.onCustomerId(e.target.value || undefined)}
            >
              <option value="">Select…</option>
              {props.customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name ?? c.email} · {c.email}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={props.name} onChange={(e) => props.onName(e.target.value)} placeholder="Customer name" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={props.email} onChange={(e) => props.onEmail(e.target.value)} placeholder="optional@email.com" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={props.phone} onChange={(e) => props.onPhone(e.target.value)} placeholder="+1 555 555 5555" />
            </div>
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="allergies">Allergy notes</Label>
            <Textarea id="allergies" rows={2} value={props.allergyNotes} onChange={(e) => props.onAllergyNotes(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="dietary">Dietary preferences</Label>
            <Textarea id="dietary" rows={2} value={props.dietaryNotes} onChange={(e) => props.onDietaryNotes(e.target.value)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ItemsStep(props: {
  mode: OrderCreationModeConfig;
  products: CenterProduct[];
  lines: Line[];
  onAdd: () => void;
  onRemove: (key: string) => void;
  onUpdate: (key: string, patch: Partial<Line>) => void;
  hasActiveMenu: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Items</CardTitle>
        <CardDescription>
          {props.mode.type === "PREORDER"
            ? "Only items on the active weekly menu are allowed."
            : props.mode.allowsCustomLines
              ? "Pick from your catalog or add custom lines."
              : "Pick from the catalog."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {props.mode.type === "PREORDER" && !props.hasActiveMenu ? (
          <p className="text-sm text-amber-700">No active weekly menu. Pick another order type or activate a menu.</p>
        ) : null}
        {props.products.length === 0 && !props.mode.allowsCustomLines ? (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">No menu items yet</CardTitle>
              <CardDescription>Add menu items or pick another order type.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button asChild size="sm">
                <Link href="/dashboard/menus">Add menu item</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {props.lines.map((line) => (
          <div key={line.key} className="grid gap-2 rounded-xl border bg-muted/20 p-3 md:grid-cols-[2fr_120px_120px_auto]">
            <div className="space-y-1">
              <Label>Item</Label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={line.productId ?? ""}
                onChange={(e) => props.onUpdate(line.key, { productId: e.target.value || undefined, title: undefined })}
              >
                <option value="">{props.mode.allowsCustomLines ? "Custom line…" : "Pick item…"}</option>
                {props.products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} · {p.menuTitle} ({formatCurrency(p.price)})
                  </option>
                ))}
              </select>
              {!line.productId && props.mode.allowsCustomLines ? (
                <Input
                  placeholder="Custom item title"
                  value={line.title ?? ""}
                  onChange={(e) => props.onUpdate(line.key, { title: e.target.value })}
                />
              ) : null}
            </div>
            <div className="space-y-1">
              <Label>Qty</Label>
              <Input
                type="number"
                min={1}
                value={line.quantity}
                onChange={(e) => props.onUpdate(line.key, { quantity: Math.max(1, Number(e.target.value) || 1) })}
              />
            </div>
            <div className="space-y-1">
              <Label>Unit price</Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                value={line.unitPrice ?? ""}
                placeholder={
                  line.productId
                    ? String(props.products.find((p) => p.id === line.productId)?.price ?? 0)
                    : "0.00"
                }
                onChange={(e) => {
                  const v = e.target.value;
                  props.onUpdate(line.key, { unitPrice: v ? Number(v) : undefined });
                }}
              />
            </div>
            <div className="flex items-end justify-end">
              <Button variant="ghost" onClick={() => props.onRemove(line.key)}>Remove</Button>
            </div>
            <div className="md:col-span-4">
              <Label>Notes</Label>
              <Input
                value={line.notes ?? ""}
                placeholder="Optional notes (e.g. allergies, special prep, prepared date)"
                onChange={(e) => props.onUpdate(line.key, { notes: e.target.value })}
              />
            </div>
          </div>
        ))}

        <div>
          <Button variant="outline" size="sm" onClick={props.onAdd}>
            Add line
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FulfillmentStep(props: {
  mode: OrderCreationModeConfig;
  fulfillment: FulfillmentDetailKey;
  onFulfillment: (v: FulfillmentDetailKey) => void;
  fulfillmentDate: string;
  onFulfillmentDate: (v: string) => void;
  windowStart: string;
  windowEnd: string;
  onWindowStart: (v: string) => void;
  onWindowEnd: (v: string) => void;
  addrLine1: string;
  addrCity: string;
  addrRegion: string;
  addrPostal: string;
  onAddr: (p: { line1?: string; city?: string; region?: string; postal?: string }) => void;
  deliveryNotes: string;
  onDeliveryNotes: (v: string) => void;
}) {
  const needsAddress =
    ["DELIVERY", "EVENT_DELIVERY", "CATERING_LOADOUT", "THIRD_PARTY_DELIVERY"].includes(props.fulfillment);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Fulfillment</CardTitle>
        <CardDescription>How the order is delivered or picked up.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <div className="flex flex-wrap gap-2">
            {props.mode.allowedFulfillments.map((f) => (
              <Button
                key={f}
                size="sm"
                variant={props.fulfillment === f ? "default" : "outline"}
                onClick={() => props.onFulfillment(f)}
              >
                {FULFILLMENT_LABEL[f]}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="fdate">Service date</Label>
            <Input id="fdate" type="date" value={props.fulfillmentDate} onChange={(e) => props.onFulfillmentDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ws">Window start</Label>
            <Input id="ws" type="datetime-local" value={props.windowStart} onChange={(e) => props.onWindowStart(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="we">Window end</Label>
            <Input id="we" type="datetime-local" value={props.windowEnd} onChange={(e) => props.onWindowEnd(e.target.value)} />
          </div>
        </div>
        {needsAddress && (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="line1">Address line 1</Label>
              <Input id="line1" value={props.addrLine1} onChange={(e) => props.onAddr({ line1: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={props.addrCity} onChange={(e) => props.onAddr({ city: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="region">Region / state</Label>
              <Input id="region" value={props.addrRegion} onChange={(e) => props.onAddr({ region: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="postal">Postal code</Label>
              <Input id="postal" value={props.addrPostal} onChange={(e) => props.onAddr({ postal: e.target.value })} />
            </div>
          </div>
        )}
        <div className="space-y-1">
          <Label htmlFor="dnotes">Delivery / setup notes</Label>
          <Textarea id="dnotes" rows={2} value={props.deliveryNotes} onChange={(e) => props.onDeliveryNotes(e.target.value)} />
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentStatusStep(props: {
  mode: OrderCreationModeConfig;
  paymentMode: PaymentModeKey;
  onPaymentMode: (v: PaymentModeKey) => void;
  statusKey: OrderStatusKey;
  onStatus: (v: OrderStatusKey) => void;
  notes: string;
  onNotes: (v: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Payment &amp; status</CardTitle>
        <CardDescription>
          OS Kitchen never fakes payments. Pick a mode that matches reality.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Status on save</Label>
          <div className="flex flex-wrap gap-2">
            {props.mode.allowedStatuses.map((s) => (
              <Button key={s} size="sm" variant={props.statusKey === s ? "default" : "outline"} onClick={() => props.onStatus(s)}>
                {ORDER_STATUS_LABEL[s]}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Payment mode</Label>
          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={props.paymentMode}
            onChange={(e) => props.onPaymentMode(e.target.value as PaymentModeKey)}
          >
            {(Object.keys(PAYMENT_MODE_LABEL) as PaymentModeKey[]).map((m) => (
              <option key={m} value={m}>{PAYMENT_MODE_LABEL[m]}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" rows={3} value={props.notes} onChange={(e) => props.onNotes(e.target.value)} placeholder="Any other notes…" />
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewStep(props: {
  mode: OrderCreationModeConfig;
  lines: Line[];
  products: CenterProduct[];
  customerName: string;
  customerEmail: string;
  fulfillment: FulfillmentDetailKey;
  fulfillmentDate: string;
  subtotal: number;
  statusKey: OrderStatusKey;
  paymentMode: PaymentModeKey;
  allergyNotes: string;
  customerWarning: string | null;
  deliveryWarning: string | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Review</CardTitle>
        <CardDescription>{ORDER_TYPE_LABEL[props.mode.type]}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p><span className="text-muted-foreground">Customer:</span> {props.customerName}{props.customerEmail ? ` · ${props.customerEmail}` : ""}</p>
        <p><span className="text-muted-foreground">Fulfillment:</span> {FULFILLMENT_LABEL[props.fulfillment]}{props.fulfillmentDate ? ` · ${props.fulfillmentDate}` : ""}</p>
        <p><span className="text-muted-foreground">Status:</span> {ORDER_STATUS_LABEL[props.statusKey]} · {PAYMENT_MODE_LABEL[props.paymentMode]}</p>
        <ul className="space-y-1 text-xs">
          {props.lines.filter((l) => l.productId || l.title).map((l) => {
            const p = l.productId ? props.products.find((x) => x.id === l.productId) : null;
            const unit = typeof l.unitPrice === "number" ? l.unitPrice : p?.price ?? 0;
            return (
              <li key={l.key} className="flex items-center justify-between rounded border px-2 py-1">
                <span>{p?.title ?? l.title ?? "Custom item"} × {l.quantity}</span>
                <span className="tabular-nums">{formatCurrency(unit * l.quantity)}</span>
              </li>
            );
          })}
        </ul>
        <p className="text-base font-semibold">Subtotal {formatCurrency(props.subtotal)}</p>

        {props.allergyNotes ? (
          <p className="rounded border border-amber-300 bg-amber-50/40 px-3 py-2 text-xs text-amber-900">
            Allergy notes: {props.allergyNotes}
          </p>
        ) : null}
        {props.customerWarning ? <p className="text-xs text-amber-700">{props.customerWarning}</p> : null}
        {props.deliveryWarning ? <p className="text-xs text-amber-700">{props.deliveryWarning}</p> : null}
      </CardContent>
    </Card>
  );
}

function Summary(props: {
  mode: OrderCreationModeConfig;
  subtotal: number;
  statusKey: OrderStatusKey;
  paymentMode: PaymentModeKey;
  fulfillment: FulfillmentDetailKey;
  customerName: string;
  warnings: string[];
}) {
  return (
    <Card className="lg:sticky lg:top-4 lg:self-start">
      <CardHeader>
        <CardTitle className="text-base">Summary</CardTitle>
        <CardDescription>{ORDER_TYPE_LABEL[props.mode.type]}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p><span className="text-muted-foreground">Customer:</span> {props.customerName || "Walk-in"}</p>
        <p><span className="text-muted-foreground">Fulfillment:</span> {FULFILLMENT_LABEL[props.fulfillment]}</p>
        <p><span className="text-muted-foreground">Status:</span> {ORDER_STATUS_LABEL[props.statusKey]}</p>
        <p><span className="text-muted-foreground">Payment:</span> {PAYMENT_MODE_LABEL[props.paymentMode]}</p>
        <p className="text-lg font-semibold">Subtotal {formatCurrency(props.subtotal)}</p>
        {props.warnings.length > 0 && (
          <ul className="text-xs text-amber-700">
            {props.warnings.map((w, i) => <li key={i}>· {w}</li>)}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
