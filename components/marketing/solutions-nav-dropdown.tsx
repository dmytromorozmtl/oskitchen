'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SOLUTIONS_HUB_PRIMARY } from '@/lib/marketing/solutions-hub-content';
import { cn } from '@/lib/utils';

export function SolutionsNavDropdown({ className }: { className?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex items-center gap-1 outline-none transition-colors hover:text-foreground focus-visible:text-foreground',
          className,
        )}
      >
        Solutions
        <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          By business type
        </DropdownMenuLabel>
        {SOLUTIONS_HUB_PRIMARY.map((item) => (
          <DropdownMenuItem key={item.slug} asChild>
            <Link href={item.href}>{item.title}</Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/solutions" className="font-medium text-primary">
            View all solutions
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
