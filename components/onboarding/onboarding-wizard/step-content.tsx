"use client";

import type { BusinessType } from "@prisma/client";
import Link from "next/link";
import { toast } from "sonner";

import {
  onboardingComplete,
  onboardingSaveBrandsLocations,
  onboardingSaveOperatingModel,
  onboardingSaveRecommendedModules,
  onboardingSaveStep1,
  onboardingSaveStep2,
  onboardingSaveStep3Menu,
  onboardingSaveStep4Products,
  onboardingSaveStep5Channels,
  onboardingSaveWelcome,
  onboardingSkipStepGeneric,
  onboardingSkipToDashboard,
  onboardingSkipWeeklyMenu,
} from "@/actions/onboarding";
import { importDemoWorkspace } from "@/actions/demo";
import { getActionError } from "@/lib/action-result";
import { OnboardingLocaleFields } from "@/components/onboarding/onboarding-locale-fields";
import {
  OPERATING_MODEL_COPY,
  type OnboardingStepContentProps,
} from "@/components/onboarding/onboarding-wizard/onboarding-wizard-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ALL_BUSINESS_TYPES_ORDERED, BUSINESS_TYPE_LABELS } from "@/lib/business-modes";
import { defaultOperatingModelForBusinessType } from "@/lib/onboarding/onboarding-business-modes";
import { candidateModuleKeysForBusinessType } from "@/lib/onboarding/onboarding-modules";
import type { OperatingModelId } from "@/lib/onboarding/onboarding-types";
import { WORKFLOW_TEMPLATE_OPTIONS } from "@/lib/business-workflows";

export function OnboardingStepContent(props: OnboardingStepContentProps) {
  const {
    currentStepId,
    pending,
    defaults,
    browserTz,
    menuId,
    workflowDefault,
    resolvedOperatingDefault,
    flowBusinessType,
    setFlowBusinessType,
    setFlowOperatingModel,
    appendHidden,
    run,
    handleSkip,
    router,
  } = props;

  return (
    <>
      {currentStepId === "welcome" ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Welcome to OS Kitchen</CardTitle>
            <CardDescription>
              Let’s configure your workspace based on how your food business operates. You can skip anytime — nothing
              here is permanent.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                fd.delete("skipSetup");
                appendHidden(fd);
                void run(() => onboardingSaveWelcome(fd), true);
              }}
            >
              <input type="hidden" name="currentStepId" value="welcome" />
              <Button type="submit" disabled={pending} className="rounded-full">
                Continue
              </Button>
            </form>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData();
                fd.set("skipSetup", "1");
                appendHidden(fd);
                void run(() => onboardingSaveWelcome(fd), false);
              }}
            >
              <input type="hidden" name="currentStepId" value="welcome" />
              <input type="hidden" name="skipSetup" value="1" />
              <Button type="submit" variant="outline" className="w-full rounded-full" disabled={pending}>
                Skip setup
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
      
      {currentStepId === "business_profile" ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Business profile</CardTitle>
            <CardDescription>Shown on packing slips, emails, and internal tools.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const country = String(fd.get("country") ?? "").trim();
                if (!country) {
                  toast.error("Please select a country");
                  return;
                }
                appendHidden(fd);
                const btRaw = String(fd.get("businessType") ?? "");
                const bt = (ALL_BUSINESS_TYPES_ORDERED as readonly string[]).includes(btRaw)
                  ? (btRaw as BusinessType)
                  : null;
                if (bt) {
                  setFlowBusinessType(bt);
                  setFlowOperatingModel(defaultOperatingModelForBusinessType(bt));
                }
                void run(() => onboardingSaveStep1(fd), true);
              }}
            >
              <input type="hidden" name="currentStepId" value="business_profile" />
              <div className="space-y-2">
                <Label htmlFor="businessName">Business name</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  required
                  defaultValue={defaults.businessName}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Business type</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {ALL_BUSINESS_TYPES_ORDERED.map((k) => (
                    <label
                      key={k}
                      className="flex cursor-pointer gap-2 rounded-xl border border-input bg-background/80 p-3 text-sm shadow-sm hover:bg-muted/40"
                    >
                      <input
                        type="radio"
                        name="businessType"
                        value={k}
                        defaultChecked={(defaults.businessType ?? "MEAL_PREP") === k}
                      />
                      <span>
                        <span className="font-medium">{BUSINESS_TYPE_LABELS[k]}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="locationsCount">Number of locations</Label>
                  <Input
                    id="locationsCount"
                    name="locationsCount"
                    type="number"
                    min={1}
                    defaultValue={defaults.locationsCount}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brandsCount">Number of brands</Label>
                  <Input
                    id="brandsCount"
                    name="brandsCount"
                    type="number"
                    min={0}
                    defaultValue={defaults.brandsCount}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kitchenWorkflowDefault">Default workflow template</Label>
                <select
                  id="kitchenWorkflowDefault"
                  name="kitchenWorkflowDefault"
                  defaultValue={workflowDefault}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  {WORKFLOW_TEMPLATE_OPTIONS.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Operating model (next step) fine-tunes Today and playbooks — this is your starting template.
                </p>
              </div>
              <OnboardingLocaleFields
                defaultCountry={defaults.country}
                defaultCurrency={defaults.currency}
                defaultTimezone={defaults.timezone}
                defaultLocale={defaults.locale}
                browserTimezone={browserTz}
              />
      
              <div className="flex flex-wrap gap-2 pt-2">
                <Button type="submit" disabled={pending} className="rounded-full">
                  Continue
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
      
      {currentStepId === "operating_model" ? (
        <Card>
          <CardHeader>
            <CardTitle>Operating model</CardTitle>
            <CardDescription>How do you mainly take orders? This routes the rest of setup.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                appendHidden(fd);
                const model = String(fd.get("operatingModel") ?? "") as OperatingModelId;
                if (model) setFlowOperatingModel(model);
                void run(() => onboardingSaveOperatingModel(fd), true);
              }}
            >
              <input type="hidden" name="currentStepId" value="operating_model" />
              <div className="grid gap-2 sm:grid-cols-2">
                {OPERATING_MODEL_COPY.map((m) => (
                  <label
                    key={m.id}
                    className="flex cursor-pointer flex-col gap-1 rounded-xl border border-input bg-muted/20 p-3 text-left text-sm hover:bg-muted/40"
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="radio"
                        name="operatingModel"
                        value={m.id}
                        required
                        defaultChecked={resolvedOperatingDefault === m.id}
                      />
                      <span>
                        <span className="font-medium">{m.title}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">{m.description}</span>
                      </span>
                    </div>
                  </label>
                ))}
              </div>
              <Button type="submit" className="mt-4 rounded-full" disabled={pending}>
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
      
      {currentStepId === "brands_locations" ? (
        <Card>
          <CardHeader>
            <CardTitle>Brands & footprint</CardTitle>
            <CardDescription>Rough counts for routing — create real brands under Brands after setup.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                appendHidden(fd);
                void run(() => onboardingSaveBrandsLocations(fd), true);
              }}
            >
              <input type="hidden" name="currentStepId" value="brands_locations" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bl_locationsCount">Locations</Label>
                  <Input
                    id="bl_locationsCount"
                    name="locationsCount"
                    type="number"
                    min={1}
                    defaultValue={defaults.locationsCount}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bl_brandsCount">Brands</Label>
                  <Input
                    id="bl_brandsCount"
                    name="brandsCount"
                    type="number"
                    min={0}
                    defaultValue={defaults.brandsCount}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={pending} className="rounded-full">
                  Continue
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full"
                  disabled={pending}
                  onClick={() => handleSkip("brands_locations")}
                >
                  Skip
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
      
      {currentStepId === "fulfillment" ? (
        <Card>
          <CardHeader>
            <CardTitle>Fulfillment</CardTitle>
            <CardDescription>Pickup and delivery expectations for customers.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                appendHidden(fd);
                void run(() => onboardingSaveStep2(fd), true);
              }}
            >
              <input type="hidden" name="currentStepId" value="fulfillment" />
              <div className="space-y-2">
                <Label htmlFor="pickupAddress">Pickup address</Label>
                <Input
                  id="pickupAddress"
                  name="pickupAddress"
                  defaultValue={defaults.pickupAddress}
                  className="rounded-xl"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="deliveryEnabled"
                  name="deliveryEnabled"
                  type="checkbox"
                  defaultChecked={defaults.deliveryEnabled}
                  className="h-4 w-4 rounded border border-input"
                />
                <Label htmlFor="deliveryEnabled" className="font-normal">
                  Offer delivery
                </Label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="deliveryRadiusKm">Delivery radius (km)</Label>
                  <Input
                    id="deliveryRadiusKm"
                    name="deliveryRadiusKm"
                    type="number"
                    min={0}
                    defaultValue={defaults.deliveryRadiusKm}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderCutoffTime">Order cutoff (HH:mm)</Label>
                  <Input
                    id="orderCutoffTime"
                    name="orderCutoffTime"
                    placeholder="18:00"
                    defaultValue={defaults.orderCutoffTime}
                    className="rounded-xl font-mono text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupWindows">Pickup windows (free text)</Label>
                <Input
                  id="pickupWindows"
                  name="pickupWindows"
                  placeholder="e.g. Tue–Thu 4–7pm"
                  defaultValue={defaults.pickupWindows}
                  className="rounded-xl"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={pending} className="rounded-full">
                  Continue
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full"
                  disabled={pending}
                  onClick={() => handleSkip("fulfillment")}
                >
                  Skip
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
      
      {currentStepId === "weekly_menu" ? (
        <Card>
          <CardHeader>
            <CardTitle>Weekly menu</CardTitle>
            <CardDescription>Preorder cycle — skip if you run day-of service.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                appendHidden(fd);
                void run(() => onboardingSaveStep3Menu(fd), true);
              }}
            >
              <input type="hidden" name="currentStepId" value="weekly_menu" />
              <div className="space-y-2">
                <Label htmlFor="menuTitle">Menu title</Label>
                <Input
                  id="menuTitle"
                  name="menuTitle"
                  required
                  defaultValue="My weekly menu"
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start</Label>
                  <Input id="startDate" name="startDate" type="date" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End</Label>
                  <Input id="endDate" name="endDate" type="date" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preorderDeadline">Preorder deadline</Label>
                  <Input id="preorderDeadline" name="preorderDeadline" type="date" required className="rounded-xl" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={pending} className="rounded-full">
                  Continue
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full"
                  disabled={pending}
                  onClick={() => {
                    void run(() => onboardingSkipWeeklyMenu(), true, "Skipped");
                  }}
                >
                  Skip
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
      
      {currentStepId === "menu_items" ? (
        <Card>
          <CardHeader>
            <CardTitle>Menu items</CardTitle>
            <CardDescription>Add demo dishes or skip — you can build catalogs under Menus later.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                appendHidden(fd);
                void run(() => onboardingSaveStep4Products(fd), true);
              }}
            >
              <input type="hidden" name="currentStepId" value="menu_items" />
              <input type="hidden" name="menuId" value={menuId ?? ""} />
              <input type="hidden" name="mode" value="demo" />
              <p className="text-sm text-muted-foreground">
                We&apos;ll add three balanced demo dishes — swap anytime under Menu items.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={pending} className="rounded-full">
                  Add demo dishes
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full"
                  disabled={pending}
                  onClick={() => {
                    const fd = new FormData();
                    fd.set("menuId", menuId ?? "");
                    fd.set("mode", "skip");
                    fd.set("currentStepId", "menu_items");
                    void run(() => onboardingSaveStep4Products(fd), true);
                  }}
                >
                  Skip — I&apos;ll add later
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
      
      {currentStepId === "sales_channels" ? (
        <Card>
          <CardHeader>
            <CardTitle>Sales channels</CardTitle>
            <CardDescription>
              Choose where orders may come from. Manual orders stay on. Connect credentials after setup — we never
              fake integrations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                appendHidden(fd);
                void run(() => onboardingSaveStep5Channels(fd), true);
              }}
            >
              <input type="hidden" name="currentStepId" value="sales_channels" />
              <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
                <div className="flex items-center gap-2">
                  <input checked disabled type="checkbox" className="h-4 w-4" />
                  <span className="text-sm">Manual orders (always)</span>
                </div>
                <div className="flex items-center gap-2">
                  <input id="ch_storefront" name="ch_storefront" type="checkbox" className="h-4 w-4" />
                  <Label htmlFor="ch_storefront" className="font-normal">
                    Native OS Kitchen storefront
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input id="ch_woocommerce" name="ch_woocommerce" type="checkbox" className="h-4 w-4" />
                  <Label htmlFor="ch_woocommerce" className="font-normal">
                    WooCommerce
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input id="ch_shopify" name="ch_shopify" type="checkbox" className="h-4 w-4" />
                  <Label htmlFor="ch_shopify" className="font-normal">
                    Shopify
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input id="ch_uber_eats" name="ch_uber_eats" type="checkbox" className="h-4 w-4" />
                  <Label htmlFor="ch_uber_eats" className="font-normal">
                    Uber Eats
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input id="ch_uber_direct" name="ch_uber_direct" type="checkbox" className="h-4 w-4" />
                  <Label htmlFor="ch_uber_direct" className="font-normal">
                    Uber Direct
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input id="ch_doordash" name="ch_doordash" type="checkbox" className="h-4 w-4" />
                  <Label htmlFor="ch_doordash" className="font-normal">
                    DoorDash (placeholder)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input id="ch_csv" name="ch_csv" type="checkbox" className="h-4 w-4" />
                  <Label htmlFor="ch_csv" className="font-normal">
                    CSV import
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input id="ch_phone_email" name="ch_phone_email" type="checkbox" className="h-4 w-4" />
                  <Label htmlFor="ch_phone_email" className="font-normal">
                    Phone / email orders
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input id="ch_catering_quotes" name="ch_catering_quotes" type="checkbox" className="h-4 w-4" />
                  <Label htmlFor="ch_catering_quotes" className="font-normal">
                    Catering quotes
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input id="ch_meal_plan_subscriptions" name="ch_meal_plan_subscriptions" type="checkbox" className="h-4 w-4" />
                  <Label htmlFor="ch_meal_plan_subscriptions" className="font-normal">
                    Meal plan subscriptions
                  </Label>
                </div>
              </div>
              <Button type="submit" disabled={pending} className="rounded-full">
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
      
      {currentStepId === "recommended_modules" ? (
        <Card>
          <CardHeader>
            <CardTitle>Recommended modules</CardTitle>
            <CardDescription>★ = suggested for your business type — toggle what you want now.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                appendHidden(fd);
                void run(() => onboardingSaveRecommendedModules(fd), true, "Saved", {
                  advanceTimeoutMs: 5000,
                });
              }}
            >
              <input type="hidden" name="currentStepId" value="recommended_modules" />
              <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border p-3">
                {candidateModuleKeysForBusinessType(flowBusinessType).map((m) => (
                  <div key={m.key} className="flex items-center gap-2 text-sm">
                    <input
                      id={`mod-${m.key}`}
                      name={`module_${m.key}`}
                      type="checkbox"
                      defaultChecked={m.recommended}
                      className="h-4 w-4"
                    />
                    <Label htmlFor={`mod-${m.key}`} className="font-normal">
                      {m.label}
                      {m.recommended ? <span className="ml-1 text-xs text-primary">★</span> : null}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={pending} className="rounded-full">
                  Continue
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full"
                  disabled={pending}
                  onClick={() => handleSkip("recommended_modules")}
                >
                  Skip
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
      
      {currentStepId === "finish" ? (
        <Card>
          <CardHeader>
            <CardTitle>You&apos;re ready</CardTitle>
            <CardDescription>Jump in, load demo data, or wire channels next.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              className="rounded-full"
              variant="premium"
              disabled={pending}
              onClick={() => void run(() => onboardingComplete(), false)}
            >
              Go to dashboard
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              disabled={pending}
              onClick={() =>
                void run(async () => {
                  const r = await importDemoWorkspace();
                  if ("error" in r && r.error) return r;
                  return { ok: true as const, redirectTo: "/dashboard/today" as const };
                }, false, "Demo kitchen loaded — sample data is simulated.")
              }
            >
              Import demo data (simulated)
            </Button>
            <Button variant="ghost" className="rounded-full" asChild>
              <Link href="/dashboard/sales-channels">Connect a store</Link>
            </Button>
            <Button
              variant="link"
              className="text-muted-foreground"
              disabled={pending}
              onClick={() => void run(() => onboardingSkipToDashboard(), false)}
            >
              Skip summary
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
