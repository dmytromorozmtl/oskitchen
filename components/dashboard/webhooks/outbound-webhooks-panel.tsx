"use client";

import { useMemo, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { Check, Copy, Loader2, Send, Trash2 } from "lucide-react";

import {
  createOutboundWebhookSubscriptionAction,
  deleteOutboundWebhookSubscriptionAction,
  rotateOutboundWebhookSecretAction,
  testOutboundWebhookSubscriptionAction,
  updateOutboundWebhookSubscriptionAction,
} from "@/actions/outbound-webhooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { OutboundWebhookEventDefinition } from "@/lib/webhooks/outbound-webhook-events";
import { outboundWebhookEventLabel } from "@/lib/webhooks/outbound-webhook-events";
import type { OutboundWebhookDeliveryView } from "@/services/webhooks/outbound-webhook-delivery-service";
import type { OutboundWebhookSubscriptionView } from "@/services/webhooks/outbound-webhook-subscription-service";

type OutboundWebhooksPanelProps = {
  subscriptions: OutboundWebhookSubscriptionView[];
  deliveries: OutboundWebhookDeliveryView[];
  events: OutboundWebhookEventDefinition[];
  canManage: boolean;
};

function deliveryStatusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "SUCCEEDED":
      return "default";
    case "QUEUED":
    case "DELIVERING":
      return "secondary";
    case "FAILED":
      return "outline";
    case "DEAD":
      return "destructive";
    default:
      return "outline";
  }
}

export function OutboundWebhooksPanel({
  subscriptions,
  deliveries,
  events,
  canManage,
}: OutboundWebhooksPanelProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["order.created", "order.updated"]);

  const subscriptionById = useMemo(
    () => new Map(subscriptions.map((s) => [s.id, s])),
    [subscriptions],
  );

  function toggleEvent(eventType: string) {
    setSelectedEvents((prev) =>
      prev.includes(eventType) ? prev.filter((e) => e !== eventType) : [...prev, eventType],
    );
  }

  function handleCreate(formData: FormData) {
    if (!canManage) return;
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await createOutboundWebhookSubscriptionAction({
        name: String(formData.get("name") ?? ""),
        url: String(formData.get("url") ?? ""),
        description: String(formData.get("description") ?? "") || undefined,
        events: selectedEvents,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setRevealedSecret(result.secret);
      setMessage(`Subscription “${result.subscription.name}” created. Copy the signing secret now — it won't be shown again.`);
    });
  }

  function runAction(action: () => Promise<{ ok: boolean; error?: string; secret?: string }>, success: string) {
    if (!canManage) return;
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Action failed.");
        return;
      }
      if (result.secret) {
        setRevealedSecret(result.secret);
        setMessage(`${success} New signing secret below — update your receiver.`);
      } else {
        setMessage(success);
      }
    });
  }

  return (
    <div className="space-y-6">
      {(message || error) && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            error
              ? "border-destructive/40 bg-destructive/5 text-destructive"
              : "border-emerald-500/30 bg-emerald-500/5 text-muted-foreground"
          }`}
        >
          {error ?? message}
        </div>
      )}

      {revealedSecret ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Signing secret (shown once)</CardTitle>
            <CardDescription>
              Verify payloads with HMAC-SHA256 over <code>{`{timestamp}.{rawBody}`}</code> — see event catalog below.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2">
            <code className="flex-1 rounded-md bg-muted px-3 py-2 text-xs break-all">{revealedSecret}</code>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => navigator.clipboard.writeText(revealedSecret)}
            >
              <Copy className="mr-1 h-3.5 w-3.5" />
              Copy
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setRevealedSecret(null)}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create subscription</CardTitle>
            <CardDescription>
              HTTPS endpoint (localhost http allowed in dev). Workspace-scoped — partners receive only your tenant events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canManage ? (
              <form action={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wh-name">Name</Label>
                  <Input id="wh-name" name="name" placeholder="Slack ops bridge" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wh-url">Endpoint URL</Label>
                  <Input id="wh-url" name="url" type="url" placeholder="https://hooks.example.com/kitchenos" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wh-desc">Description</Label>
                  <Textarea id="wh-desc" name="description" rows={2} placeholder="Optional notes for your team" />
                </div>
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium">Events</legend>
                  <div className="flex flex-wrap gap-2">
                    {events.map((event) => {
                      const active = selectedEvents.includes(event.type);
                      return (
                        <button
                          key={event.type}
                          type="button"
                          onClick={() => toggleEvent(event.type)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                            active
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          {event.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                <Button type="submit" disabled={pending || selectedEvents.length === 0}>
                  {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create subscription
                </Button>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground">Integration management permission required.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event catalog</CardTitle>
            <CardDescription>PII-minimized payloads — no card data; customer email/phone excluded by default.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {events.map((event) => (
              <div key={event.type} className="rounded-md border border-border/60 px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{event.label}</span>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {event.type}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{event.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active subscriptions</CardTitle>
          <CardDescription>{subscriptions.length} endpoint(s) configured for this workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {subscriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No outbound subscriptions yet.</p>
          ) : (
            subscriptions.map((sub) => (
              <div key={sub.id} className="rounded-lg border border-border/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium">{sub.name}</h3>
                      <Badge variant={sub.active ? "secondary" : "outline"}>
                        {sub.active ? "Active" : "Paused"}
                      </Badge>
                      {sub.consecutiveFailures > 0 ? (
                        <Badge variant="destructive">{sub.consecutiveFailures} recent failures</Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted-foreground break-all">{sub.url}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {sub.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-[10px] font-normal">
                          {outboundWebhookEventLabel(event)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {canManage ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={pending}
                        onClick={() =>
                          runAction(
                            () => testOutboundWebhookSubscriptionAction({ subscriptionId: sub.id }),
                            "Test ping delivered.",
                          )
                        }
                      >
                        <Send className="mr-1 h-3.5 w-3.5" />
                        Test
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={pending}
                        onClick={() =>
                          runAction(
                            () =>
                              updateOutboundWebhookSubscriptionAction({
                                subscriptionId: sub.id,
                                active: !sub.active,
                              }),
                            sub.active ? "Subscription paused." : "Subscription activated.",
                          )
                        }
                      >
                        {sub.active ? "Pause" : "Activate"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={pending}
                        onClick={() =>
                          runAction(
                            () => rotateOutboundWebhookSecretAction({ subscriptionId: sub.id }),
                            "Secret rotated.",
                          )
                        }
                      >
                        Rotate secret
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={pending}
                        onClick={() =>
                          runAction(
                            () => deleteOutboundWebhookSubscriptionAction({ subscriptionId: sub.id }),
                            "Subscription deleted.",
                          )
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {sub.secretPreview}
                  {sub.lastSuccessAt
                    ? ` · last success ${formatDistanceToNow(sub.lastSuccessAt, { addSuffix: true })}`
                    : " · no successful deliveries yet"}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent deliveries</CardTitle>
          <CardDescription>Retries use exponential backoff; dead deliveries stop after max attempts.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border/60 text-sm">
          {deliveries.length === 0 ? (
            <p className="text-muted-foreground">No delivery attempts yet.</p>
          ) : (
            deliveries.map((row) => (
              <div key={row.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={deliveryStatusVariant(row.status)}>{row.status}</Badge>
                    <span className="font-mono text-xs">{row.eventType}</span>
                    <span className="text-muted-foreground">
                      {subscriptionById.get(row.subscriptionId)?.name ?? row.subscriptionId.slice(0, 8)}
                    </span>
                  </div>
                  {row.lastError ? (
                    <p className="mt-1 text-xs text-destructive">{row.lastError}</p>
                  ) : null}
                </div>
                <div className="text-xs text-muted-foreground">
                  {row.httpStatus ? `HTTP ${row.httpStatus} · ` : null}
                  {row.attemptCount} attempt(s) · {formatDistanceToNow(row.createdAt, { addSuffix: true })}
                  {row.status === "SUCCEEDED" ? <Check className="ml-1 inline h-3 w-3 text-emerald-600" /> : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
