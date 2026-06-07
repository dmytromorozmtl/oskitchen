import Link from 'next/link';
import { Store } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { OWN_YOUR_CHANNEL_UPSELL_ROUTE } from '@/lib/marketing/own-your-channel-upsell-absolute-final-policy';

export function OwnYourChannelUpsellStrip() {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"
      data-testid="own-your-channel-upsell-strip"
    >
      <div className="flex items-start gap-3">
        <Store className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="font-semibold">Own your channel</p>
          <p className="text-sm text-muted-foreground">
            Shift repeat orders from marketplace commission to an owned storefront — assess, compare,
            launch in three steps.
          </p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
        <Link href={OWN_YOUR_CHANNEL_UPSELL_ROUTE}>Start upsell flow</Link>
      </Button>
    </div>
  );
}
