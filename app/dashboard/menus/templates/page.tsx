import Link from "next/link";

import { applyMenuTemplate } from "@/actions/menus";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MENU_TEMPLATE_IDS,
  menuTemplateLabel,
  menuTemplatePayload,
} from "@/lib/menus/menu-templates";
import { menuStrategyDefinition } from "@/lib/menus/menu-strategies";
import { getTenantActor } from "@/lib/scope/cached-tenant";

export default async function MenuTemplatesPage() {
  await getTenantActor();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Link href="/dashboard/menus" className="hover:text-foreground">
            Menus
          </Link>
          <span className="mx-2">/</span>
          Templates
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Menu templates</h1>
        <p className="mt-2 text-muted-foreground">
          Apply a starter scaffold — dates, strategy, and category hints are prefilled. Attach menu
          items from the menu detail screen after creation.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {MENU_TEMPLATE_IDS.map((id) => {
          const payload = menuTemplatePayload(id);
          const strat = menuStrategyDefinition(payload.strategy);
          return (
            <Card key={id} className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">{menuTemplateLabel(id)}</CardTitle>
                <CardDescription>{strat.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <form action={applyMenuTemplate.bind(null, id)}>
                  <Button type="submit" size="sm" className="rounded-full" variant="premium">
                    Apply template
                  </Button>
                </form>
                <Button size="sm" variant="outline" className="rounded-full" asChild>
                  <Link href="/dashboard/menus/new">Customize in wizard</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
