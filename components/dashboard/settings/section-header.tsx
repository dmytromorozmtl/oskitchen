import * as Icons from "lucide-react";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

import { getSettingsSection, type SettingsSection } from "@/lib/settings/section-registry";

type SectionHeaderProps = {
  sectionKey: SettingsSection["key"];
  trailing?: ReactNode;
};

export function SectionHeader({ sectionKey, trailing }: SectionHeaderProps) {
  const section = getSettingsSection(sectionKey);
  const Icon = (Icons as unknown as Record<string, ComponentType<{ className?: string }> | undefined>)[section.icon] ?? Icons.Settings;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Link href="/dashboard/settings" className="hover:text-foreground">
            Settings
          </Link>
          <span className="mx-2">/</span>
          {section.label}
          {section.bridge && (
            <Badge variant="secondary" className="ml-2 text-[10px]">Bridge</Badge>
          )}
        </p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          <Icon className="h-6 w-6 text-primary" />
          {section.label}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{section.description}</p>
      </div>
      {trailing && <div>{trailing}</div>}
    </div>
  );
}
