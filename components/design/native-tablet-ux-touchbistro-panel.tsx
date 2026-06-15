import Link from "next/link";
import { LayoutGrid, Martini, TabletSmartphone, UtensilsCrossed } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  NATIVE_TABLET_UX_P3_145_CAPABILITIES,
  NATIVE_TABLET_UX_P3_145_EYEBROW,
  NATIVE_TABLET_UX_P3_145_MIN_TOUCH_PX,
  NATIVE_TABLET_UX_P3_145_OPERATOR_LINKS,
  NATIVE_TABLET_UX_P3_145_SUBLINE,
} from "@/lib/design/native-tablet-ux-p3-145-content";
import {
  NATIVE_TABLET_UX_P3_145_COMPETITOR,
  NATIVE_TABLET_UX_P3_145_HEADLINE,
  NATIVE_TABLET_UX_P3_145_IMPLEMENTATION_REF,
  NATIVE_TABLET_UX_P3_145_POLICY_ID,
  NATIVE_TABLET_UX_P3_145_ROUTE,
  NATIVE_TABLET_UX_P3_145_TEST_IDS,
} from "@/lib/design/native-tablet-ux-p3-145-policy";

const CAPABILITY_ICONS = [TabletSmartphone, Martini, UtensilsCrossed] as const;

/** Capability ids: ipad_layouts · bar_mode · table_tabs — 44px touch floor · testid native-tablet-ux-touchbistro */

/** Blueprint P3-145 — TouchBistro parity native tablet UX design hub. */
export function NativeTabletUxTouchbistroPanel() {
  return (
    <div className="space-y-8" data-testid={NATIVE_TABLET_UX_P3_145_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full uppercase">
          {NATIVE_TABLET_UX_P3_145_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">{NATIVE_TABLET_UX_P3_145_HEADLINE}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {NATIVE_TABLET_UX_P3_145_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          Competitor: {NATIVE_TABLET_UX_P3_145_COMPETITOR} · {NATIVE_TABLET_UX_P3_145_MIN_TOUCH_PX}px
          touch floor · implementation {NATIVE_TABLET_UX_P3_145_IMPLEMENTATION_REF} · policy{" "}
          {NATIVE_TABLET_UX_P3_145_POLICY_ID}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {NATIVE_TABLET_UX_P3_145_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? LayoutGrid;
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
                <CardDescription>{capability.touchbistroTypical}</CardDescription>
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
        {NATIVE_TABLET_UX_P3_145_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>

      <p className="sr-only">Design hub route {NATIVE_TABLET_UX_P3_145_ROUTE}</p>
    </div>
  );
}
