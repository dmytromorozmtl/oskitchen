import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { posTouchTileClass } from "@/lib/pos/touch-targets";
import {
  OPERATOR_HOME_PERSONA_HEADLINE,
  OPERATOR_HOME_PERSONA_LABEL,
  type OperatorHomeAction,
  type OperatorHomePersona,
  pickOperatorHomePrimaryAction,
} from "@/lib/navigation/operator-home-era18";
import { cn } from "@/lib/utils";

export function OperatorHomePanel(props: {
  persona: Exclude<OperatorHomePersona, "owner">;
  actions: OperatorHomeAction[];
}) {
  const primary = pickOperatorHomePrimaryAction(props.actions);
  const secondary = props.actions.filter((action) => action.id !== primary?.id);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <BadgePersona label={OPERATOR_HOME_PERSONA_LABEL[props.persona]} />
          <span className="text-sm text-muted-foreground">Focused operator home</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {OPERATOR_HOME_PERSONA_LABEL[props.persona]} workspace
        </h1>
        <p className="max-w-2xl text-muted-foreground">{OPERATOR_HOME_PERSONA_HEADLINE[props.persona]}</p>
      </div>

      {primary ? (
        <Card className="border-primary/20 bg-primary/[0.03] shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Primary action</CardTitle>
            <CardDescription>{primary.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className={cn("h-14 w-full rounded-2xl text-lg", posTouchTileClass)}>
              <Link href={primary.href} data-testid={`operator-home-primary-${primary.id}`}>
                {primary.label}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {secondary.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {secondary.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              data-testid={`operator-home-action-${action.id}`}
              className={cn(
                "group flex min-h-[7.5rem] flex-col rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md",
                posTouchTileClass,
              )}
            >
              <span className="font-semibold leading-snug">{action.label}</span>
              <span className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed">
                {action.description}
              </span>
              <span className="mt-3 inline-flex items-center text-sm font-medium text-primary">
                Open
                <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-start gap-3 py-8">
            <LayoutDashboard className="h-8 w-8 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">
              No quick actions match your current permissions. Ask a workspace owner to adjust your role,
              or open Today for the full operational overview.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard/today">Open Today</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function BadgePersona({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground">
      {label}
    </span>
  );
}
