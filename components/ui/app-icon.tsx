import type { LucideIcon } from "lucide-react";
import type * as React from "react";

import { appIconSizeClass, type AppIconSize } from "@/lib/design/icon-system";
import { cn } from "@/lib/utils";

export type AppIconProps = {
  icon: LucideIcon;
  size?: AppIconSize;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<LucideIcon>, "ref">;

/** Lucide icon with canonical OS Kitchen size tokens (DES-25). */
export function AppIcon({ icon: Icon, size = "md", className, ...props }: AppIconProps) {
  return <Icon className={cn(appIconSizeClass(size), "shrink-0", className)} {...props} />;
}
