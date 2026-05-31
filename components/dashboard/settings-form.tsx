"use client";

import { getActionError } from "@/lib/action-result";

import Link from "next/link";
import * as React from "react";
import type { BusinessType } from "@prisma/client";
import { toast } from "sonner";

import { updateKitchenSettings } from "@/actions/settings";
import { ALL_BUSINESS_TYPES_ORDERED, BUSINESS_TYPE_LABELS } from "@/lib/business-modes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type SettingsDTO = {
  businessType: BusinessType | null;
  businessName: string | null;
  logoUrl: string | null;
  pickupAddress: string | null;
  deliveryEnabled: boolean;
  deliveryNotes: string | null;
  kitchenWorkflowDefault: string | null;
  notifyOrderConfirmation: boolean;
  notifyPreorderReminder: boolean;
  notifyPickupReminder: boolean;
  notifyDeliveryReminder: boolean;
  locale: string;
};

export function SettingsForm({ initial }: { initial: SettingsDTO }) {
  const [deliveryEnabled, setDeliveryEnabled] = React.useState(
    initial.deliveryEnabled,
  );
  const [notifyOrder, setNotifyOrder] = React.useState(
    initial.notifyOrderConfirmation,
  );
  const [notifyPreorder, setNotifyPreorder] = React.useState(
    initial.notifyPreorderReminder,
  );
  const [notifyPickup, setNotifyPickup] = React.useState(
    initial.notifyPickupReminder,
  );
  const [notifyDelivery, setNotifyDelivery] = React.useState(
    initial.notifyDeliveryReminder,
  );

  return (
    <form
      className="space-y-6"
      action={async (formData) => {
        const res = await updateKitchenSettings(formData);
        const _err = getActionError(res); if (_err) toast.error(_err);
        else toast.success("Settings saved");
      }}
    >
      <input
        type="hidden"
        name="deliveryEnabled"
        value={deliveryEnabled ? "on" : "off"}
      />
      <input
        type="hidden"
        name="notifyOrderConfirmation"
        value={notifyOrder ? "on" : "off"}
      />
      <input
        type="hidden"
        name="notifyPreorderReminder"
        value={notifyPreorder ? "on" : "off"}
      />
      <input
        type="hidden"
        name="notifyPickupReminder"
        value={notifyPickup ? "on" : "off"}
      />
      <input
        type="hidden"
        name="notifyDeliveryReminder"
        value={notifyDelivery ? "on" : "off"}
      />
      <Card className="space-y-4 border-border/80 bg-card/90 p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-semibold">Operating mode</p>
          <p className="text-xs text-muted-foreground">
            Tunes navigation focus and labels. Use &quot;Show all modules&quot; in the sidebar to
            reveal everything anytime.
          </p>
          <Label htmlFor="businessType">Business type</Label>
          <select
            id="businessType"
            name="businessType"
            defaultValue={initial.businessType ?? "MEAL_PREP"}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {ALL_BUSINESS_TYPES_ORDERED.map((k) => (
              <option key={k} value={k}>
                {BUSINESS_TYPE_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="space-y-4 border-border/80 bg-card/90 p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-semibold">Workspace modules</p>
          <p className="text-xs text-muted-foreground">
            Hide areas you don&apos;t need. Navigation and direct links respect these switches.
          </p>
          <Button asChild type="button" variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/settings/modules">Manage modules →</Link>
          </Button>
        </div>
      </Card>

      <Card className="space-y-4 border-border/80 bg-card/90 p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="businessName">Business name</Label>
            <Input
              id="businessName"
              name="businessName"
              defaultValue={initial.businessName ?? ""}
              placeholder="OS Kitchen Catering"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              name="logoUrl"
              defaultValue={initial.logoUrl ?? ""}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="pickupAddress">Pickup address</Label>
            <Textarea
              id="pickupAddress"
              name="pickupAddress"
              rows={3}
              defaultValue={initial.pickupAddress ?? ""}
            />
          </div>
        </div>
      </Card>

      <Card className="space-y-4 border-border/80 bg-card/90 p-6 shadow-sm">
        <div className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-3">
          <div>
            <p className="text-sm font-medium">Delivery enabled</p>
            <p className="text-xs text-muted-foreground">
              Toggle routing workflows for drivers.
            </p>
          </div>
          <Switch checked={deliveryEnabled} onCheckedChange={setDeliveryEnabled} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deliveryNotes">Delivery notes</Label>
          <Textarea
            id="deliveryNotes"
            name="deliveryNotes"
            rows={3}
            defaultValue={initial.deliveryNotes ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kitchenWorkflowDefault">Kitchen workflow defaults</Label>
          <Textarea
            id="kitchenWorkflowDefault"
            name="kitchenWorkflowDefault"
            rows={4}
            defaultValue={initial.kitchenWorkflowDefault ?? ""}
            placeholder="Station assignments, allergen protocol..."
          />
        </div>
      </Card>

      <Card className="space-y-4 border-border/80 bg-card/90 p-6 shadow-sm">
        <p className="text-sm font-semibold">Notifications</p>
        <div className="grid gap-4 md:grid-cols-2">
          <ToggleRow
            title="Order confirmations"
            description="Send when orders are captured"
            checked={notifyOrder}
            onCheckedChange={setNotifyOrder}
          />
          <ToggleRow
            title="Preorder reminders"
            description="Nudge guests before deadlines"
            checked={notifyPreorder}
            onCheckedChange={setNotifyPreorder}
          />
          <ToggleRow
            title="Pickup reminders"
            description="Day-before counter pickups"
            checked={notifyPickup}
            onCheckedChange={setNotifyPickup}
          />
          <ToggleRow
            title="Delivery reminders"
            description="Notify guests before dispatch"
            checked={notifyDelivery}
            onCheckedChange={setNotifyDelivery}
          />
        </div>
      </Card>

      <Card className="space-y-4 border-border/80 bg-card/90 p-6 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="locale">Language preference</Label>
          <select
            id="locale"
            name="locale"
            defaultValue={initial.locale}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
          <p className="text-xs text-muted-foreground">
            Stored for future multilingual expansions across emails and PDFs.
          </p>
        </div>
      </Card>

      <Button type="submit" className="rounded-full" variant="premium">
        Save settings
      </Button>
    </form>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-3">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
