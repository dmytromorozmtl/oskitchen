import Link from 'next/link';
import { Store } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { APP_MARKETPLACE_THIRD_PARTY_ROUTE } from '@/lib/platform/app-marketplace-third-party-absolute-final-policy';

export function AppMarketplaceThirdPartyStrip() {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"
      data-testid="app-marketplace-third-party-strip"
    >
      <div className="flex items-start gap-3">
        <Store className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="font-semibold">Third-party app marketplace</p>
          <p className="text-sm text-muted-foreground">
            Certified SI partners, OAuth sandbox apps, and developer extensions — platform review
            required. Not a self-serve Toast/Square store yet.
          </p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
        <Link href={APP_MARKETPLACE_THIRD_PARTY_ROUTE}>View marketplace</Link>
      </Button>
    </div>
  );
}
