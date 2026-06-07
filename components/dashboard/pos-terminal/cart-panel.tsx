"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, UserRound } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
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
  posTerminalDecreaseQuantityLabel,
  posTerminalIncreaseQuantityLabel,
} from "@/lib/pos/pos-terminal-icon-button-labels";
import { posTabletCartPanelClass } from "@/lib/pos/pos-tablet-layout";
import {
  posTouchCompactClass,
  posTouchSelectLargeClass,
} from "@/lib/pos/touch-targets";
import { cn } from "@/lib/utils";

import type { PosTerminalCartPanelProps } from "@/components/dashboard/pos-terminal/pos-terminal-types";

export type CartPanelProps = PosTerminalCartPanelProps & {
  paymentPanel: ReactNode;
  modifierPanel: ReactNode;
  receiptPanel: ReactNode;
};

export function CartPanel({
  paymentPanel,
  modifierPanel,
  receiptPanel,
  ...p
}: CartPanelProps) {
  return (
      <Card className={posTabletCartPanelClass(p.layoutOrientation, p.tabletMode)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="h-5 w-5" />
            Cart
          </CardTitle>
          <CardDescription>
            {p.speedMode
              ? "Speed mode — register, cart, and complete sale first."
              : "Large tap targets for counter service."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Register</Label>
            <Select value={p.registerId} onValueChange={p.onRegisterChange}>
              <SelectTrigger className={posTouchSelectLargeClass}>
                <SelectValue placeholder="Choose register" />
              </SelectTrigger>
              <SelectContent>
                {p.registers.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                    {r.location ? ` · ${r.location.name}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Staff member</Label>
            <Select value={p.staffId} onValueChange={p.onStaffChange}>
              <SelectTrigger className={posTouchSelectLargeClass}>
                <SelectValue placeholder="Staff on sale" />
              </SelectTrigger>
              <SelectContent>
                {p.staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {p.customerAttachEnabled && p.showSecondaryPanels ? (
          <div className="space-y-3 rounded-xl border border-border/70 bg-muted/15 p-3">
            <div className="flex items-center justify-between gap-2">
              <Label className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-muted-foreground" aria-hidden />
                Customer
              </Label>
              <Button
                variant="link"
                className={cn("text-xs", posTouchCompactClass)}
                asChild
              >
                <Link href="/dashboard/customers">CRM</Link>
              </Button>
            </div>

            {p.selectedCustomer ? (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2 rounded-lg border border-border/60 bg-background/80 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium leading-tight">{p.selectedCustomer.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.selectedCustomer.email}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn("rounded-lg text-xs", posTouchCompactClass)}
                      onClick={p.onClearCustomer}
                    >
                      Walk-in
                    </Button>
                  </div>
                </div>
                {p.customerProfileNotice ? (
                  <p className="rounded-lg bg-background/60 px-3 py-2 text-xs leading-snug text-muted-foreground">
                    {p.customerProfileNotice}
                  </p>
                ) : null}
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  Optional — attach this sale to a CRM profile for history and receipts.
                </p>
                <Input
                  ref={p.customerSearchRef}
                  data-testid="pos-customer-query"
                  value={p.customerQuery}
                  onChange={(e) => p.onCustomerQueryChange(e.target.value)}
                  placeholder="Search name, email, or phone…"
                  className="h-11 rounded-lg text-sm"
                  autoComplete="off"
                />
                {p.searchingCustomer ? (
                  <p className="text-xs text-muted-foreground">Searching…</p>
                ) : null}
                {p.customerSearchError ? (
                  <p className="text-xs text-destructive">{p.customerSearchError}</p>
                ) : null}
                {p.searchHits.length ? (
                  <div className="max-h-40 space-y-1 overflow-y-auto">
                    {p.searchHits.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        data-testid={`pos-customer-select-${c.id}`}
                        className={`flex w-full ${posTouchCompactClass} flex-col rounded-lg border border-border/60 bg-background/90 px-3 py-2 text-left text-sm transition hover:border-primary/40`}
                        onClick={() => p.onSelectCustomer(c)}
                      >
                        <span className="font-medium leading-tight">{c.label}</span>
                        <span className="text-xs text-muted-foreground">{c.email}</span>
                      </button>
                    ))}
                  </div>
                ) : p.customerQuery.trim().length >= 2 && !p.searchingCustomer ? (
                  <p className="text-xs text-muted-foreground">No matches — try another term or create below.</p>
                ) : null}

                {p.recentCustomers.length ? (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Recent</p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.recentCustomers.map((c) => (
                        <Button
                          key={c.id}
                          type="button"
                          variant="secondary"
                          size="sm"
                          className={cn(
                            "max-w-[11rem] truncate rounded-full px-3 text-xs font-normal",
                            posTouchCompactClass,
                          )}
                          title={c.email}
                          onClick={() =>
                            p.onSelectCustomer({
                              id: c.id,
                              email: c.email,
                              label: c.label,
                              phone: c.phone,
                            })
                          }
                        >
                          {c.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2 border-t border-border/50 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn("w-full rounded-lg text-xs", posTouchCompactClass)}
                    onClick={p.onToggleQuickCustomer}
                  >
                    {p.showQuickCustomer ? "Hide quick add" : "Quick new customer"}
                  </Button>
                  {p.showQuickCustomer ? (
                    <div className="space-y-2">
                      <Input
                        value={p.quickName}
                        onChange={(e) => p.onQuickNameChange(e.target.value)}
                        placeholder="Name"
                        className="h-11 rounded-lg text-sm"
                        autoComplete="name"
                      />
                      <Input
                        value={p.quickEmail}
                        onChange={(e) => p.onQuickEmailChange(e.target.value)}
                        placeholder="Email (required)"
                        type="email"
                        className="h-11 rounded-lg text-sm"
                        autoComplete="email"
                      />
                      <Input
                        value={p.quickPhone}
                        onChange={(e) => p.onQuickPhoneChange(e.target.value)}
                        placeholder="Phone (optional)"
                        className="h-11 rounded-lg text-sm"
                        autoComplete="tel"
                      />
                      {p.quickCustomerError ? (
                        <p className="text-xs text-destructive">{p.quickCustomerError}</p>
                      ) : null}
                      <Button
                        type="button"
                        className="h-11 w-full rounded-lg text-sm"
                        disabled={p.quickCustomerPending}
                        data-testid="pos-customer-quick-create"
                        onClick={p.onQuickCreateCustomer}
                      >
                        {p.quickCustomerPending ? "Saving…" : "Create and attach"}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground leading-relaxed">
              Linking counter sales to saved CRM customers requires the{" "}
              <span className="font-medium text-foreground">customer CRM</span> entitlement. Walk-in
              checkout is unchanged.
            </div>
          )}

          <div className="rounded-xl border border-dashed border-border/80 bg-muted/30 px-3 py-2 text-sm">
            <p className="font-medium">Shift</p>
            <p className="text-muted-foreground">
              {p.shiftId ? `Open shift ${p.shiftId.slice(0, 8)}…` : "No open shift — cash variance tracking optional."}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Fulfillment</Label>
            <Select value={p.fulfillment} onValueChange={p.onFulfillmentChange}>
              <SelectTrigger className={posTouchSelectLargeClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PICKUP">Pickup</SelectItem>
                <SelectItem value="DINE_IN">Dine-in</SelectItem>
                <SelectItem value="DELIVERY">Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentPanel}
          {modifierPanel}

          <div className={cn("max-h-72 space-y-3 overflow-y-auto pr-1", p.pending && "opacity-60")}>
            {p.pending ? (
              <div className="space-y-2" aria-hidden>
                <div className="h-16 animate-pulse rounded-xl bg-muted" />
                <div className="h-16 animate-pulse rounded-xl bg-muted" />
              </div>
            ) : null}
            {p.cart.map((line) => (
              <div
                key={line.key}
                className="flex items-start justify-between gap-2 rounded-xl border border-border/70 bg-background/80 p-3"
              >
                <div>
                  <p className="font-medium leading-snug">{line.title}</p>
                  <p className="text-xs text-muted-foreground">${line.unitPrice.toFixed(2)} each</p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className={posTouchCompactClass}
                    aria-label={posTerminalDecreaseQuantityLabel(line.title)}
                    onClick={() => p.onBumpLine(line.key, -1)}
                  >
                    <Minus className="h-4 w-4" aria-hidden />
                  </Button>
                  <span className="w-8 text-center text-base font-semibold">{line.quantity}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className={posTouchCompactClass}
                    aria-label={posTerminalIncreaseQuantityLabel(line.title)}
                    onClick={() => p.onBumpLine(line.key, 1)}
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className={cn("text-destructive", posTouchCompactClass)}
                    onClick={() => p.onRemoveLine(line.key)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            {!p.cart.length ? (
              <EmptyState
                icon={ShoppingCart}
                variant="inline"
                title="Cart is empty"
                description="Tap a product tile to start a sale."
                showDemoLink={false}
              />
            ) : null}
          </div>


          {receiptPanel}
        </CardContent>
      </Card>
  );
}
