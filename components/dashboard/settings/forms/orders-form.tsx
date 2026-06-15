"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { saveOrderSettings } from "@/actions/settings-center";
import { StickySaveBar } from "@/components/dashboard/settings/sticky-save-bar";
import type { OrderSettings } from "@/lib/settings/settings-defaults";

const ALL_PAYMENT_MODES: { value: string; label: string }[] = [
  { value: "stripe_checkout", label: "Stripe Checkout" },
  { value: "stripe_invoice", label: "Stripe Invoice" },
  { value: "manual_invoice", label: "Manual Invoice" },
  { value: "pay_later", label: "Pay later" },
  { value: "in_person_pos", label: "In-person POS" },
  { value: "channel_handled", label: "Channel handled" },
];

export function OrdersForm({ initial }: { initial: OrderSettings }) {
  const [state, setState] = useState<OrderSettings>(initial);
  const [base, setBase] = useState<OrderSettings>(initial);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(state) !== JSON.stringify(base);

  function set<K extends keyof OrderSettings>(key: K, value: OrderSettings[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function togglePaymentMode(mode: string, on: boolean) {
    const next = new Set(state.allowedPaymentModes);
    if (on) next.add(mode); else next.delete(mode);
    set("allowedPaymentModes", Array.from(next));
  }

  function onSave() {
    startTransition(async () => {
      const res = await saveOrderSettings(state);
      if (res.ok) {
        setBase(state);
        toast.success("Order settings saved.");
      } else toast.error(`Save failed: ${res.error}`);
    });
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Confirmation & approval</CardTitle>
          <CardDescription>How orders move from “new” to “confirmed”.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Toggle id="ord-autoconfirm" label="Auto-confirm manual orders" description="Skip confirmation step for owner-created orders." checked={state.autoConfirmManualOrders} onChange={(v) => set("autoConfirmManualOrders", v)} />
          <Toggle id="ord-approval" label="Require approval for catering orders" description="Catering orders enter approval queue first." checked={state.requireApprovalForCateringOrders} onChange={(v) => set("requireApprovalForCateringOrders", v)} />
          <Toggle id="ord-preorder" label="Preorders require an active menu" description="Block preorder creation when no menu is published." checked={state.preorderRequiresMenu} onChange={(v) => set("preorderRequiresMenu", v)} />
          <Toggle id="ord-fraud" label="Fraud check enabled" description="Flag suspicious orders for review." checked={state.fraudCheckEnabled} onChange={(v) => set("fraudCheckEnabled", v)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Limits, windows, and escalation</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Minimum order value"><Input type="number" min={0} value={state.minOrderValue} onChange={(e) => set("minOrderValue", Number(e.target.value))} /></Field>
          <Field label="Cancellation window (hours)"><Input type="number" min={0} value={state.cancellationWindowHours} onChange={(e) => set("cancellationWindowHours", Number(e.target.value))} /></Field>
          <Field label="Refund window (days)"><Input type="number" min={0} value={state.refundWindowDays} onChange={(e) => set("refundWindowDays", Number(e.target.value))} /></Field>
          <Field label="Delayed order escalation (minutes)"><Input type="number" min={0} value={state.delayedOrderEscalationMinutes} onChange={(e) => set("delayedOrderEscalationMinutes", Number(e.target.value))} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Allowed payment modes</CardTitle>
          <CardDescription>Order Creation Center only shows enabled modes.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {ALL_PAYMENT_MODES.map((m) => (
            <Toggle
              key={m.value}
              id={`ord-pay-${m.value}`}
              label={m.label}
              checked={state.allowedPaymentModes.includes(m.value)}
              onChange={(v) => togglePaymentMode(m.value, v)}
            />
          ))}
        </CardContent>
      </Card>

      <StickySaveBar
        dirty={dirty}
        saving={pending}
        onSave={onSave}
        onDiscard={() => setState(base)}
        message="Unsaved order policies"
      />
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({ id, label, description, checked, onChange }: { id: string; label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/70 p-3">
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}
