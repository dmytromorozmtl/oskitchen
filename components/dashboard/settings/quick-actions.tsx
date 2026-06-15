import * as React from "react";
import Link from "next/link";
import {
  Bell,
  CreditCard,
  Database,
  Globe,
  PackageCheck,
  Plug,
  ShieldCheck,
  Settings2,
  Store,
  UserPlus,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  canUseSettings,
  type SettingsActorScope,
} from "@/lib/settings/settings-permissions";
import type { SettingsCapability } from "@/lib/settings/section-registry";

type QuickAction = {
  label: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  capability: SettingsCapability;
};

const ACTIONS: QuickAction[] = [
  {
    label: "Tune operations",
    description: "Prep lead times, cutoffs, capacity, and QC defaults.",
    href: "/dashboard/settings/operations",
    icon: Settings2,
    capability: "manage_operations",
  },
  {
    label: "Review order rules",
    description: "Auto-confirmation, minimums, fraud, and escalation settings.",
    href: "/dashboard/settings/orders",
    icon: PackageCheck,
    capability: "manage_orders",
  },
  {
    label: "Configure storefront",
    description: "Theme, pages, SEO, localization, and public ordering settings.",
    href: "/dashboard/settings/storefront",
    icon: Store,
    capability: "manage_storefront",
  },
  {
    label: "Connect domain",
    description: "Map a custom domain and verify DNS readiness.",
    href: "/dashboard/settings/domains",
    icon: Globe,
    capability: "manage_domains",
  },
  {
    label: "Configure notifications",
    description: "Templates, rules, provider status, and internal alerts.",
    href: "/dashboard/settings/notifications",
    icon: Bell,
    capability: "manage_notifications",
  },
  {
    label: "Browse integrations",
    description: "Stripe, Resend, Twilio, Slack, and channel connections.",
    href: "/dashboard/settings/integrations",
    icon: Plug,
    capability: "manage_integrations",
  },
  {
    label: "Connect Stripe",
    description: "Plan, usage, invoices, payment methods, and billing diagnostics.",
    href: "/dashboard/settings/billing",
    icon: CreditCard,
    capability: "manage_billing",
  },
  {
    label: "Invite staff",
    description: "Roles, permissions, and workspace access controls.",
    href: "/dashboard/settings/staff",
    icon: UserPlus,
    capability: "manage_staff",
  },
  {
    label: "Review security",
    description: "Sessions, audit surfaces, restrictions, and secret-adjacent controls.",
    href: "/dashboard/settings/security",
    icon: ShieldCheck,
    capability: "manage_security",
  },
  {
    label: "Restore backup",
    description: "Snapshots, retention policy, and restore previews.",
    href: "/dashboard/settings/backups",
    icon: Database,
    capability: "manage_imports",
  },
];

export function QuickActionsCard({ actor }: { actor: SettingsActorScope }) {
  const visibleActions = ACTIONS.filter((action) => canUseSettings(actor, action.capability));

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Quick actions</CardTitle>
      </CardHeader>
      <CardContent>
        {visibleActions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
            Your role currently has read-only access to Settings Control Center. Ask an owner or
            manager if you need access to configuration actions.
          </div>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {visibleActions.map((a) => {
              const Icon = a.icon;
              return (
                <li key={a.href}>
                  <Link
                    href={a.href}
                    className="group flex h-full flex-col rounded-xl border border-border/70 bg-background/80 p-3 transition hover:border-primary/50 hover:bg-primary/5"
                  >
                    <span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="text-sm font-semibold">{a.label}</span>
                    <span className="mt-0.5 text-xs text-muted-foreground">{a.description}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
