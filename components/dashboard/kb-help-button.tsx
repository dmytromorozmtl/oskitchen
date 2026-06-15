"use client";

import Link from "next/link";
import { CircleHelp } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type KbHelpButtonProps = {
  /** KB article slug — see `lib/knowledge-base/catalog.ts` */
  articleSlug: string;
  title?: string;
  description?: string;
};

export function KbHelpButton({ articleSlug, title = "Help", description }: KbHelpButtonProps) {
  const href = `/dashboard/support/kb/${articleSlug}`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-muted"
          aria-label={`Help: ${title}`}
        >
          <CircleHelp className="h-4 w-4" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-xs">
        <p className="font-medium">{title}</p>
        {description ? <p className="mt-1 text-muted-foreground">{description}</p> : null}
        <p className="mt-2 text-primary">Open guide →</p>
      </TooltipContent>
    </Tooltip>
  );
}
