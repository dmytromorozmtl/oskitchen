import Link from "next/link";
import { LayoutGrid, Martini, TabletSmartphone, UtensilsCrossed } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  NATIVE_TABLET_UX_P2_95_CAPABILITIES,
  NATIVE_TABLET_UX_P2_95_EYEBROW,
  NATIVE_TABLET_UX_P2_95_HEADLINE,
  NATIVE_TABLET_UX_P2_95_OPERATOR_LINKS,
  NATIVE_TABLET_UX_P2_95_SUBLINE,
} from "@/lib/pos/native-tablet-ux-p2-95-content";
import { NATIVE_TABLET_UX_P2_95_TEST_IDS } from "@/lib/pos/native-tablet-ux-p2-95-policy";
import type { NativeTabletUxSnapshot } from "@/services/pos/native-tablet-ux-p2-95-service";

const CAPABILITY_ICONS = [TabletSmartphone, Martini, UtensilsCrossed] as const;

/** Blueprint P2-95 — native tablet UX panel. */
export function NativeTabletUxPanel({ snapshot }: { snapshot: NativeTabletUxSnapshot }) {
  return (
    <div className="space-y-8" data-testid={NATIVE_TABLET_UX_P2_95_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {NATIVE_TABLET_UX_P2_95_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">{NATIVE_TABLET_UX_P2_95_HEADLINE}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {NATIVE_TABLET_UX_P2_95_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.minTouchPx}px touch floor · {snapshot.openTabCount} open tab(s) · policy{" "}
          {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Orientation</CardDescription>
            <CardTitle className="text-2xl capitalize">{snapshot.layout.orientation}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {snapshot.layout.stickyCart ? "Sticky cart in portrait" : "Split layout in landscape"}
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Bar quick items</CardDescription>
            <CardTitle className="text-2xl">{snapshot.barQuickItems.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Open tabs</CardDescription>
            <CardTitle className="text-2xl">{snapshot.openTabCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {NATIVE_TABLET_UX_P2_95_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? LayoutGrid;
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={NATIVE_TABLET_UX_P2_95_TEST_IDS[index + 1]}
            >
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <CardTitle className="text-base">{capability.label}</CardTitle>
                  <CardDescription className="mt-1">{capability.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-xs text-muted-foreground">{capability.module}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Bar mode quick-add</CardTitle>
          <CardDescription>One-tap items for tablet bar service</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {snapshot.barQuickItems.map((item) => (
            <Badge key={item.id} variant="outline" className="min-h-11 px-3 py-2 text-sm">
              {item.name} · ${item.price}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Table / tabs polish</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {snapshot.tableTabsHints.map((hint) => (
            <div key={hint.id} className="flex flex-wrap justify-between gap-2 border-b py-2 last:border-0">
              <span className="font-medium">{hint.label}</span>
              <span className="text-muted-foreground">{hint.detail}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button asChild className="min-h-11 rounded-full">
        <Link href={snapshot.recommendedRoute}>
          {snapshot.openTabCount > 0 ? "Continue open tabs" : "Open tablet POS"}
        </Link>
      </Button>

      <div className="flex flex-wrap gap-2">
        {NATIVE_TABLET_UX_P2_95_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="min-h-11 rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
