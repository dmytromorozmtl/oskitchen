import Link from "next/link";
import { CalendarDays, ClipboardList, Package, ShoppingCart, TrendingDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  INVENTORY_RESERVATIONS_DEPTH_P3_144_EYEBROW,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITIES,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_OPERATOR_LINKS,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITIES,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_SUBLINE,
} from "@/lib/inventory/inventory-reservations-depth-p3-144-content";
import {
  INVENTORY_RESERVATIONS_DEPTH_P3_144_COMPETITOR,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_HEADLINE,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITY_COUNT,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_POLICY_ID,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITY_COUNT,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATIONS_ROUTE,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_ROUTE,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_TEST_IDS,
  INVENTORY_RESERVATIONS_DEPTH_P3_144_TOTAL_CAPABILITY_COUNT,
} from "@/lib/inventory/inventory-reservations-depth-p3-144-policy";

/** Capability ids: stock_counts · receiving · variance · purchase_suggestions · pos_impacts · calendar_host · waitlist_sms · conflict_detection · public_booking */

const INVENTORY_ICONS = [ClipboardList, Package, TrendingDown, ShoppingCart, Package] as const;

/** Blueprint P3-144 — inventory + reservations depth hub (Lightspeed parity baseline). */
export function InventoryReservationsDepthPanel() {
  return (
    <div className="space-y-8" data-testid={INVENTORY_RESERVATIONS_DEPTH_P3_144_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full uppercase">
          {INVENTORY_RESERVATIONS_DEPTH_P3_144_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          {INVENTORY_RESERVATIONS_DEPTH_P3_144_HEADLINE}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {INVENTORY_RESERVATIONS_DEPTH_P3_144_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          Competitor: {INVENTORY_RESERVATIONS_DEPTH_P3_144_COMPETITOR} · policy{" "}
          {INVENTORY_RESERVATIONS_DEPTH_P3_144_POLICY_ID} · {INVENTORY_RESERVATIONS_DEPTH_P3_144_TOTAL_CAPABILITY_COUNT}{" "}
          capabilities ({INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITY_COUNT} inventory +{" "}
          {INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITY_COUNT} reservations)
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Inventory depth
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INVENTORY_RESERVATIONS_DEPTH_P3_144_INVENTORY_CAPABILITIES.map((capability, index) => {
            const Icon = INVENTORY_ICONS[index] ?? Package;
            return (
              <Card
                key={capability.id}
                className="border-border/80 shadow-sm"
                data-testid={capability.testId}
                data-capability-id={capability.id}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" aria-hidden />
                    <CardTitle className="text-base">{capability.label}</CardTitle>
                  </div>
                  <CardDescription>{capability.lightspeedTypical}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="rounded-full text-[10px] uppercase">
                    {capability.osKitchenStatus}
                  </Badge>
                  <Button asChild size="sm" variant="ghost" className="rounded-full">
                    <Link href={capability.route}>Open</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Reservations depth
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATION_CAPABILITIES.map((capability) => (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={capability.testId}
              data-capability-id={capability.id}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" aria-hidden />
                  <CardTitle className="text-base">{capability.label}</CardTitle>
                </div>
                <CardDescription>{capability.lightspeedTypical}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="rounded-full text-[10px] uppercase">
                  {capability.osKitchenStatus}
                </Badge>
                <Button asChild size="sm" variant="ghost" className="rounded-full">
                  <Link href={capability.route}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {INVENTORY_RESERVATIONS_DEPTH_P3_144_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>

      <p className="sr-only">
        Depth hub route {INVENTORY_RESERVATIONS_DEPTH_P3_144_ROUTE} · reservations{" "}
        {INVENTORY_RESERVATIONS_DEPTH_P3_144_RESERVATIONS_ROUTE}
      </p>
    </div>
  );
}
