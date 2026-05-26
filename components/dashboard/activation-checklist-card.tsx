import Link from "next/link";

import type { ActivationState } from "@prisma/client";

import { dismissActivationChecklistForm } from "@/actions/growth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { syncActivationFromDatabase } from "@/lib/activation";
import { prisma } from "@/lib/prisma";

type ActivationKey = keyof Pick<
  ActivationState,
  | "onboardingCompleted"
  | "businessSettingsCompleted"
  | "firstMenuCreated"
  | "firstProductCreated"
  | "firstOrderCreated"
  | "firstProductionCompleted"
  | "firstPackingExported"
  | "firstIntegrationConnected"
  | "billingStarted"
>;

const STEPS: { key: ActivationKey; label: string; href: string }[] = [
  {
    key: "onboardingCompleted",
    label: "Finish onboarding",
    href: "/onboarding",
  },
  {
    key: "businessSettingsCompleted",
    label: "Save business settings",
    href: "/dashboard/settings",
  },
  {
    key: "firstMenuCreated",
    label: "Create your first weekly menu",
    href: "/dashboard/menus",
  },
  {
    key: "firstProductCreated",
    label: "Add menu items",
    href: "/dashboard/products",
  },
  {
    key: "firstOrderCreated",
    label: "Create or import an order",
    href: "/dashboard/orders",
  },
  {
    key: "firstProductionCompleted",
    label: "Complete a production step",
    href: "/dashboard/production",
  },
  {
    key: "firstPackingExported",
    label: "Use packing / labels",
    href: "/dashboard/packing",
  },
  {
    key: "firstIntegrationConnected",
    label: "Connect a sales channel",
    href: "/dashboard/sales-channels",
  },
  {
    key: "billingStarted",
    label: "Review billing / plan",
    href: "/dashboard/billing",
  },
];

export async function ActivationChecklistCard({ userId }: { userId: string }) {
  await syncActivationFromDatabase(userId);
  const state = await prisma.activationState.findUnique({
    where: { userId },
  });
  if (!state || state.checklistDismissed) return null;

  const items = STEPS.map((s) => ({
    ...s,
    done: Boolean(state[s.key]),
  }));
  const pct = Math.round(
    (items.filter((i) => i.done).length / items.length) * 100,
  );
  const next = items.find((i) => !i.done);

  return (
    <Card className="border-primary/25 bg-primary/5 shadow-sm">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-lg">Activation checklist</CardTitle>
          <CardDescription>
            {pct}% complete — {next ? `next: ${next.label}` : "Great momentum."}
          </CardDescription>
        </div>
        <form action={dismissActivationChecklistForm}>
          <Button type="submit" variant="ghost" size="sm" className="rounded-full">
            Dismiss
          </Button>
        </form>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <li key={i.key}>
              <Link
                href={i.href}
                className={
                  i.done
                    ? "text-sm text-muted-foreground line-through"
                    : "text-sm font-medium text-primary hover:underline"
                }
              >
                {i.done ? "✓ " : "○ "}
                {i.label}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
