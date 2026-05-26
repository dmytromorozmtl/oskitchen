import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";

import type { PublishChecklistItem } from "@/lib/storefront/publish-checklist";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { publishChecklistBlocksGoLive } from "@/lib/storefront/launch-readiness";

export function PublishChecklistCard({
  items,
  showBlockerBanner = true,
}: {
  items: PublishChecklistItem[];
  showBlockerBanner?: boolean;
}) {
  const allOk = items.every((i) => i.ok);
  const gate = publishChecklistBlocksGoLive(items);
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle>Publish checklist</CardTitle>
        <CardDescription>
          {allOk
            ? "Ready to publish — guests should see a consistent storefront."
            : "Complete these items before going live or sharing your store link."}
        </CardDescription>
      </CardHeader>
      {showBlockerBanner && gate.blocked ? (
        <div className="mx-6 -mt-2 mb-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p className="font-medium">Go-live blocked</p>
          <p className="mt-1 text-xs opacity-90">
            Theme publish and public &quot;Published&quot; toggle require navigation, theme snapshot, and valid
            sections.
          </p>
        </div>
      ) : null}
      <CardContent>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3 text-sm">
              {item.ok ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <p className={item.ok ? "font-medium" : "font-medium text-foreground"}>{item.label}</p>
                {item.detail ? <p className="text-xs text-muted-foreground">{item.detail}</p> : null}
                {item.href && !item.ok ? (
                  <Link href={item.href} className="text-xs text-primary underline-offset-4 hover:underline">
                    Fix →
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
