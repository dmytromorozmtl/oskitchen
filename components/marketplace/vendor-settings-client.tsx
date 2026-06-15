"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Copy, Plus, Trash2 } from "lucide-react";

import {
  addVendorComplianceDocumentAction,
  addVendorWebhookAction,
  generateVendorApiKeyAction,
  inviteVendorTeamMemberAction,
  removeVendorTeamMemberAction,
  removeVendorWebhookAction,
  requestVendorPlanUpgradeAction,
  updateVendorNotificationPrefsAction,
  updateVendorProfileSettingsAction,
} from "@/actions/vendor/settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  VENDOR_PLAN_OPTIONS,
  VENDOR_TEAM_ROLE_OPTIONS,
  VENDOR_WEBHOOK_EVENTS,
} from "@/lib/marketplace/vendor-settings-types";
import { cn } from "@/lib/utils";
import type { VendorSettingsModel } from "@/services/marketplace/vendor-settings-service";
import type { VendorPlanTier } from "@prisma/client";

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "team", label: "Team" },
  { key: "notifications", label: "Notifications" },
  { key: "api", label: "API & webhooks" },
  { key: "plan", label: "Subscription" },
  { key: "compliance", label: "Compliance" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function VendorSettingsClient({
  model,
  canManage,
}: {
  model: VendorSettingsModel;
  canManage: boolean;
}) {
  const [tab, setTab] = useState<TabKey>("profile");
  const [pending, startTransition] = useTransition();
  const [zonesText, setZonesText] = useState(model.settings.profile.deliveryZones.join(", "));
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<(typeof VENDOR_TEAM_ROLE_OPTIONS)[number]["value"]>("MANAGER");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEvents, setWebhookEvents] = useState<string[]>(["new_order"]);
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);
  const [generatedWebhookSecret, setGeneratedWebhookSecret] = useState<string | null>(null);

  if (!canManage) {
    return <p className="text-sm text-muted-foreground">Read-only — you cannot edit vendor settings.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              tab === item.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "profile" ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Storefront profile</CardTitle>
            <CardDescription>Logo, banner, description, and delivery zones shown to buyers.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                startTransition(async () => {
                  const result = await updateVendorProfileSettingsAction({
                    logoUrl: String(data.get("logoUrl") ?? "") || null,
                    bannerUrl: String(data.get("bannerUrl") ?? "") || null,
                    description: String(data.get("description") ?? "") || null,
                    deliveryZones: zonesText.split(",").map((zone) => zone.trim()).filter(Boolean),
                  });
                  if (result.ok) toast.success("Profile updated");
                  else toast.error(result.error);
                });
              }}
            >
              <Field label="Logo URL" name="logoUrl" defaultValue={model.settings.profile.logoUrl ?? ""} />
              <Field label="Banner URL" name="bannerUrl" defaultValue={model.settings.profile.bannerUrl ?? ""} />
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  defaultValue={model.settings.profile.description ?? ""}
                />
              </div>
              <div>
                <Label htmlFor="zones">Delivery zones (comma-separated)</Label>
                <Input
                  id="zones"
                  value={zonesText}
                  onChange={(event) => setZonesText(event.target.value)}
                  placeholder="US-TX, US-CA, US-NY"
                  className="rounded-full"
                />
              </div>
              <Button type="submit" disabled={pending} className="rounded-full">
                Save profile
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {tab === "team" ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Team access</CardTitle>
            <CardDescription>Invite teammates with Admin, Manager, Finance, or Support roles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="teammate@company.com"
                className="rounded-full"
              />
              <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as typeof inviteRole)}>
                <SelectTrigger className="rounded-full sm:w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VENDOR_TEAM_ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                disabled={pending || !inviteEmail.trim()}
                className="rounded-full"
                onClick={() =>
                  startTransition(async () => {
                    const result = await inviteVendorTeamMemberAction({
                      email: inviteEmail,
                      role: inviteRole,
                    });
                    if (result.ok) {
                      toast.success(`Invited ${inviteEmail}`);
                      setInviteEmail("");
                    } else toast.error(result.error);
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Invite
              </Button>
            </div>
            <div className="space-y-2">
              {model.settings.team.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{member.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.role} · {member.status}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const result = await removeVendorTeamMemberAction(member.id);
                        if (result.ok) toast.success("Invite removed");
                        else toast.error(result.error);
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === "notifications" ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(
              [
                ["newOrderEmail", "New order emails"],
                ["lowStockEmail", "Low stock alerts"],
                ["payoutEmail", "Payout processed"],
                ["messageEmail", "Buyer message emails"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <Checkbox
                  defaultChecked={model.settings.notifications[key]}
                  onCheckedChange={(checked) =>
                    startTransition(async () => {
                      const result = await updateVendorNotificationPrefsAction({
                        ...model.settings.notifications,
                        [key]: checked === true,
                      });
                      if (!result.ok) toast.error(result.error);
                    })
                  }
                />
                {label}
              </label>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {tab === "api" ? (
        <div className="space-y-4">
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">API keys</CardTitle>
              <CardDescription>
                Current key: {model.settings.apiKeyPreview ?? "Not generated yet"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                type="button"
                disabled={pending}
                className="rounded-full"
                onClick={() =>
                  startTransition(async () => {
                    const result = await generateVendorApiKeyAction();
                    if (result.ok) {
                      setGeneratedApiKey(result.apiKey);
                      toast.success("API key generated — copy it now");
                    } else toast.error(result.error);
                  })
                }
              >
                Generate API key
              </Button>
              {generatedApiKey ? (
                <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-muted/30 p-3">
                  <code className="flex-1 break-all text-xs">{generatedApiKey}</code>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      void navigator.clipboard.writeText(generatedApiKey);
                      toast.success("Copied");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Webhooks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Input
                  value={webhookUrl}
                  onChange={(event) => setWebhookUrl(event.target.value)}
                  placeholder="https://example.com/webhooks/marketplace"
                  className="rounded-full"
                />
                <Button
                  type="button"
                  disabled={pending || !webhookUrl.trim()}
                  className="rounded-full"
                  onClick={() =>
                    startTransition(async () => {
                      const result = await addVendorWebhookAction({
                        url: webhookUrl,
                        events: webhookEvents,
                      });
                      if (result.ok) {
                        setGeneratedWebhookSecret(result.secret);
                        setWebhookUrl("");
                        toast.success("Webhook added");
                      } else toast.error(result.error);
                    })
                  }
                >
                  Add webhook
                </Button>
              </div>
              <div className="flex flex-wrap gap-3">
                {VENDOR_WEBHOOK_EVENTS.map((event) => (
                  <label key={event} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={webhookEvents.includes(event)}
                      onCheckedChange={(checked) =>
                        setWebhookEvents((prev) =>
                          checked ? [...prev, event] : prev.filter((value) => value !== event),
                        )
                      }
                    />
                    {event}
                  </label>
                ))}
              </div>
              {generatedWebhookSecret ? (
                <p className="text-xs text-muted-foreground">
                  Signing secret (shown once): <code>{generatedWebhookSecret}</code>
                </p>
              ) : null}
              <div className="space-y-2">
                {model.settings.webhooks.map((hook) => (
                  <div
                    key={hook.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-border/70 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{hook.url}</p>
                      <p className="text-xs text-muted-foreground">
                        {hook.events.join(", ")} · secret {hook.secretPreview}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          const result = await removeVendorWebhookAction(hook.id);
                          if (result.ok) toast.success("Webhook removed");
                          else toast.error(result.error);
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {tab === "plan" ? (
        <div className="grid gap-4 md:grid-cols-3">
          {VENDOR_PLAN_OPTIONS.map((plan) => (
            <Card
              key={plan.value}
              className={cn(
                "border-border/80 shadow-sm",
                model.planTier === plan.value && "ring-2 ring-primary",
              )}
            >
              <CardHeader>
                <CardTitle className="text-base">{plan.label}</CardTitle>
                <CardDescription>{plan.commission} commission</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{plan.detail}</p>
                {model.planTier === plan.value ? (
                  <Badge className="rounded-full">Current plan</Badge>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    className="rounded-full"
                    onClick={() =>
                      startTransition(async () => {
                        const result = await requestVendorPlanUpgradeAction(plan.value as VendorPlanTier);
                        if (result.ok) toast.success(`Upgraded to ${plan.label}`);
                        else toast.error(result.error);
                      })
                    }
                  >
                    Upgrade
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {tab === "compliance" ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Compliance documents</CardTitle>
            <CardDescription>Insurance, food safety, and vendor compliance uploads.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                startTransition(async () => {
                  const result = await addVendorComplianceDocumentAction({
                    fileName: String(data.get("fileName") ?? ""),
                    fileUrl: String(data.get("fileUrl") ?? "") || null,
                    category: String(data.get("category") ?? "") || null,
                  });
                  if (result.ok) {
                    toast.success("Document added");
                    event.currentTarget.reset();
                  } else toast.error(result.error);
                });
              }}
            >
              <Field label="Document name" name="fileName" required />
              <Field label="Category" name="category" placeholder="Insurance, W-9, etc." />
              <Field label="File URL" name="fileUrl" className="sm:col-span-2" />
              <Button type="submit" disabled={pending} className="rounded-full sm:col-span-2">
                Upload document
              </Button>
            </form>
            <div className="space-y-2">
              {model.settings.complianceDocuments.map((doc, index) => (
                <div
                  key={`${doc.fileName}-${index}`}
                  className="rounded-xl border border-border/70 px-3 py-2 text-sm"
                >
                  <p className="font-medium">{doc.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.category ?? "General"} · {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  required,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
