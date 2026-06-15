import Link from "next/link";
import { ShoppingBag, Store, Truck, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_CAPABILITIES,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_EYEBROW,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_HEADLINE,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_OPERATOR_LINKS,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_SUBLINE,
} from "@/lib/crm/cross-channel-guest-identity-p2-115-content";
import { CROSS_CHANNEL_GUEST_IDENTITY_P2_115_TEST_IDS } from "@/lib/crm/cross-channel-guest-identity-p2-115-policy";
import type { CrossChannelGuestIdentitySnapshot } from "@/services/crm/cross-channel-guest-identity-p2-115-service";

const CAPABILITY_ICONS = [ShoppingBag, Store, Truck] as const;

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Blueprint P2-115 — cross-channel guest identity panel. */
export function CrossChannelGuestIdentityPanel({
  snapshot,
}: {
  snapshot: CrossChannelGuestIdentitySnapshot;
}) {
  return (
    <div className="space-y-8" data-testid={CROSS_CHANNEL_GUEST_IDENTITY_P2_115_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {CROSS_CHANNEL_GUEST_IDENTITY_P2_115_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          {CROSS_CHANNEL_GUEST_IDENTITY_P2_115_HEADLINE}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {CROSS_CHANNEL_GUEST_IDENTITY_P2_115_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live CRM data"} · {snapshot.guestCount}{" "}
          guests · {snapshot.multiChannelCount} multi-channel · policy {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total guests</CardDescription>
            <CardTitle className="text-2xl">{snapshot.guestCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Multi-channel</CardDescription>
            <CardTitle className="text-2xl">{snapshot.multiChannelCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>POS linked</CardDescription>
            <CardTitle className="text-2xl">{snapshot.posLinkedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Storefront + delivery</CardDescription>
            <CardTitle className="text-2xl">
              {snapshot.storefrontLinkedCount}/{snapshot.deliveryLinkedCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" aria-hidden />
            <CardTitle className="text-base">Guest identity rows</CardTitle>
          </div>
          <CardDescription>Ranked by lifetime value — open unified profile for full history</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border/60">
            {snapshot.guests.map((guest) => (
              <li key={guest.guestKey} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <Link href={guest.unifiedProfileHref} className="font-medium hover:underline">
                    {guest.displayName}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {guest.email ?? guest.phone ?? guest.guestKey}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {guest.channels.map((channel) => (
                    <Badge key={channel} variant="outline" className="rounded-full capitalize">
                      {channel}
                    </Badge>
                  ))}
                  <Badge variant="secondary" className="rounded-full tabular-nums">
                    {formatMoney(guest.lifetimeValueUsd)} LTV
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {CROSS_CHANNEL_GUEST_IDENTITY_P2_115_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? Users;
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={CROSS_CHANNEL_GUEST_IDENTITY_P2_115_TEST_IDS[index + 1]}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                  <CardTitle className="text-base">{capability.label}</CardTitle>
                </div>
                <CardDescription>{capability.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="link" size="sm" className="h-auto p-0">
                  <Link href={capability.route}>Open {capability.label.toLowerCase()}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {CROSS_CHANNEL_GUEST_IDENTITY_P2_115_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
