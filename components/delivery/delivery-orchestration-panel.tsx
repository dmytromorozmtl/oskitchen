import Link from "next/link";
import { MapPin, Package, Route, Truck, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DELIVERY_ORCHESTRATION_P3_147_CAPABILITIES,
  DELIVERY_ORCHESTRATION_P3_147_EYEBROW,
  DELIVERY_ORCHESTRATION_P3_147_OPERATOR_LINKS,
  DELIVERY_ORCHESTRATION_P3_147_SUBLINE,
} from "@/lib/delivery/delivery-orchestration-p3-147-content";
import {
  DELIVERY_ORCHESTRATION_P3_147_COMPETITOR,
  DELIVERY_ORCHESTRATION_P3_147_HEADLINE,
  DELIVERY_ORCHESTRATION_P3_147_IMPLEMENTATION_REF,
  DELIVERY_ORCHESTRATION_P3_147_POLICY_ID,
  DELIVERY_ORCHESTRATION_P3_147_ROUTE,
  DELIVERY_ORCHESTRATION_P3_147_TEST_IDS,
} from "@/lib/delivery/delivery-orchestration-p3-147-policy";

const CAPABILITY_ICONS = [Package, Zap, Route, MapPin, Truck, Package] as const;

/** Capability ids: order_hub · dispatch_optimize · route_optimization · route_planner · driver_tracking · third_party_dispatch · testid delivery-orchestration-olo */

/** Blueprint P3-147 — Olo parity delivery orchestration hub. */
export function DeliveryOrchestrationPanel() {
  return (
    <div className="space-y-8" data-testid={DELIVERY_ORCHESTRATION_P3_147_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full uppercase">
          {DELIVERY_ORCHESTRATION_P3_147_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          {DELIVERY_ORCHESTRATION_P3_147_HEADLINE}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {DELIVERY_ORCHESTRATION_P3_147_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          Competitor: {DELIVERY_ORCHESTRATION_P3_147_COMPETITOR} · implementation{" "}
          {DELIVERY_ORCHESTRATION_P3_147_IMPLEMENTATION_REF} · policy{" "}
          {DELIVERY_ORCHESTRATION_P3_147_POLICY_ID}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DELIVERY_ORCHESTRATION_P3_147_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? Route;
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
                <CardDescription>{capability.oloTypical}</CardDescription>
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

      <div className="flex flex-wrap gap-2">
        {DELIVERY_ORCHESTRATION_P3_147_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>

      <p className="sr-only">Orchestration hub route {DELIVERY_ORCHESTRATION_P3_147_ROUTE}</p>
    </div>
  );
}
