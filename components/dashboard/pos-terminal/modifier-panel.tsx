"use client";

import { Percent, Tag } from "lucide-react";

import { PosManagerOverrideChecklist } from "@/components/dashboard/pos-manager-override-checklist";
import { PosManagerOverrideHero } from "@/components/dashboard/pos-manager-override-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { POS_MANAGER_OVERRIDE_ANCHOR } from "@/lib/pos/pos-manager-override-clarity-era19-policy";
import { POS_TERMINAL_DISCOUNT_PERCENT_PRESETS } from "@/lib/pos/pos-terminal-discount-ui";
import { posTouchCompactClass } from "@/lib/pos/touch-targets";
import { cn } from "@/lib/utils";

import type { PosTerminalModifierPanelProps } from "@/components/dashboard/pos-terminal/pos-terminal-types";

export function ModifierPanel(props: PosTerminalModifierPanelProps) {
  if (!props.showSecondaryPanels) return null;

  return (
    <div
      id={POS_MANAGER_OVERRIDE_ANCHOR}
      className="scroll-mt-24 space-y-3 rounded-xl border border-border/70 bg-muted/15 p-3"
      data-testid="pos-modifier-panel"
    >
      <PosManagerOverrideChecklist {...props.managerOverrideInput} />
      {props.showManagerOverrideHero ? (
        <PosManagerOverrideHero {...props.managerOverrideInput} />
      ) : null}
      <div className="flex items-center justify-between gap-2">
        <Label className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" aria-hidden />
          Manager discount
        </Label>
        {props.canApplyPosDiscount &&
        (props.discountMode !== "none" || props.paymentMode === "COMPED") ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn("text-xs", posTouchCompactClass)}
            onClick={() => {
              props.onResetDiscount();
              props.onClearCompIfNeeded();
            }}
          >
            Clear
          </Button>
        ) : null}
      </div>

      {props.canApplyPosDiscount ? (
        <>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={props.discountMode === "fixed" ? "default" : "outline"}
              size="sm"
              className={cn("rounded-full", posTouchCompactClass)}
              data-testid="pos-discount-mode-fixed"
              onClick={() => {
                props.onDiscountModeChange("fixed");
                props.onClearCompIfNeeded();
              }}
            >
              $ Amount
            </Button>
            <Button
              type="button"
              variant={props.discountMode === "percent" ? "default" : "outline"}
              size="sm"
              className={cn("rounded-full", posTouchCompactClass)}
              data-testid="pos-discount-mode-percent"
              onClick={() => {
                props.onDiscountModeChange("percent");
                props.onClearCompIfNeeded();
              }}
            >
              <Percent className="mr-1 h-3.5 w-3.5" aria-hidden />
              Percent
            </Button>
            <Button
              type="button"
              variant={props.paymentMode === "COMPED" ? "default" : "outline"}
              size="sm"
              className={cn("rounded-full", posTouchCompactClass)}
              data-testid="pos-discount-comp-sale"
              onClick={props.onCompSale}
            >
              Comp sale
            </Button>
          </div>

          {props.discountMode === "fixed" && props.paymentMode !== "COMPED" ? (
            <div className="space-y-1">
              <Input
                data-testid="pos-discount-fixed-input"
                value={props.fixedDiscountInput}
                onChange={(e) => props.onFixedDiscountInputChange(e.target.value)}
                placeholder="Discount amount (e.g. 5.00)"
                inputMode="decimal"
                className="h-11 rounded-lg text-sm"
              />
              {props.fixedDiscountInvalid ? (
                <p className="text-xs text-destructive">Enter a valid discount amount.</p>
              ) : null}
            </div>
          ) : null}

          {props.discountMode === "percent" && props.paymentMode !== "COMPED" ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {POS_TERMINAL_DISCOUNT_PERCENT_PRESETS.map((pct) => (
                  <Button
                    key={pct}
                    type="button"
                    variant="secondary"
                    size="sm"
                    className={cn("rounded-full px-3", posTouchCompactClass)}
                    data-testid={`pos-discount-preset-${pct}`}
                    onClick={() => props.onPercentDiscountInputChange(String(pct))}
                  >
                    {pct}%
                  </Button>
                ))}
              </div>
              <Input
                data-testid="pos-discount-percent-input"
                value={props.percentDiscountInput}
                onChange={(e) => props.onPercentDiscountInputChange(e.target.value)}
                placeholder="Custom percent (0–100)"
                inputMode="decimal"
                className="h-11 rounded-lg text-sm"
              />
              {props.percentDiscountInvalid ? (
                <p className="text-xs text-destructive">Enter a percent between 0 and 100.</p>
              ) : null}
            </div>
          ) : null}

          {props.paymentMode === "COMPED" ? (
            <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
              Comp mode — entire sale recorded as manager-approved comp.
            </p>
          ) : null}
        </>
      ) : (
        <p className="text-xs leading-relaxed text-muted-foreground">
          Ask a manager to sign in or grant{" "}
          <span className="font-medium">POS discount apply</span> to comp items or apply checkout
          discounts on this register.
        </p>
      )}
    </div>
  );
}
