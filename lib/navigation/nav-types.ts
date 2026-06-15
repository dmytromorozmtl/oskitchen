import type { LucideIcon } from "lucide-react";

import type { MessageKey } from "@/lib/i18n";

export type NavLinkItem = {
  href: string;
  labelKey: MessageKey;
  icon: LucideIcon;
  ownerOnly?: boolean;
};

export type NavGroupDef = {
  id: string;
  title: string;
  links: NavLinkItem[];
};
