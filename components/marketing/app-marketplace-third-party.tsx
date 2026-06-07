'use client';

import { Percent, Puzzle } from 'lucide-react';

import { MarketingButton } from '@/components/marketing/button';
import { SectionHeader } from '@/components/marketing/section-header';
import { Badge } from '@/components/ui/badge';
import {
  APP_MARKETPLACE_THIRD_PARTY_CTA,
  APP_MARKETPLACE_THIRD_PARTY_EXTENSIONS,
  APP_MARKETPLACE_THIRD_PARTY_H1,
  APP_MARKETPLACE_THIRD_PARTY_HONESTY_NOTE,
  APP_MARKETPLACE_THIRD_PARTY_REVENUE_SHARE,
  APP_MARKETPLACE_THIRD_PARTY_SUBTITLE,
  appMarketplaceThirdPartyKindLabel,
} from '@/lib/platform/app-marketplace-third-party-content';

const MATURITY_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  LIVE: 'default',
  BETA: 'secondary',
  CERTIFIED: 'secondary',
  ROADMAP: 'outline',
};

type Props = {
  compact?: boolean;
  showHeader?: boolean;
};

export function AppMarketplaceThirdParty({ compact = false, showHeader = true }: Props) {
  return (
    <section
      className={compact ? 'space-y-6' : 'border-t border-border/60 py-16 sm:py-20'}
      data-testid="app-marketplace-third-party"
    >
      {showHeader ? (
        <SectionHeader
          tag="Third-party extensions · platform review"
          title={APP_MARKETPLACE_THIRD_PARTY_H1}
          description={APP_MARKETPLACE_THIRD_PARTY_SUBTITLE}
          centered={!compact}
          className={compact ? undefined : 'mx-auto'}
        />
      ) : null}

      <div className="flex flex-wrap gap-2 text-sm">
        <Badge variant="outline" className="rounded-full">
          <Percent className="mr-1 h-3 w-3" aria-hidden />
          {APP_MARKETPLACE_THIRD_PARTY_REVENUE_SHARE.summary}
        </Badge>
        <Badge variant="secondary" className="rounded-full">
          {APP_MARKETPLACE_THIRD_PARTY_EXTENSIONS.length} extensions
        </Badge>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/80">
        <table className="w-full min-w-[720px] text-sm" aria-label="Third-party app marketplace">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Extension</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Maturity</th>
              {!compact ? (
                <th className="px-4 py-3 text-left font-medium">Notes</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {APP_MARKETPLACE_THIRD_PARTY_EXTENSIONS.map((ext) => (
              <tr
                key={ext.id}
                className="border-t border-border/60"
                data-testid={`app-marketplace-extension-${ext.id}`}
              >
                <td className="px-4 py-3">
                  <p className="font-medium">{ext.name}</p>
                  <p className="text-xs text-muted-foreground">{ext.publisher}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Puzzle className="h-3.5 w-3.5" aria-hidden />
                    {appMarketplaceThirdPartyKindLabel(ext.kind)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={MATURITY_VARIANT[ext.maturity] ?? 'outline'} className="rounded-full text-[10px]">
                    {ext.maturity}
                  </Badge>
                </td>
                {!compact ? (
                  <td className="px-4 py-3 text-muted-foreground">{ext.honestyNote}</td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        {APP_MARKETPLACE_THIRD_PARTY_HONESTY_NOTE} OAuth apps require platform review — not a self-serve
        public store without security sign-off.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <MarketingButton href={APP_MARKETPLACE_THIRD_PARTY_CTA.primaryHref}>
          {APP_MARKETPLACE_THIRD_PARTY_CTA.primaryLabel}
        </MarketingButton>
        <MarketingButton href={APP_MARKETPLACE_THIRD_PARTY_CTA.developerHref} variant="secondary">
          {APP_MARKETPLACE_THIRD_PARTY_CTA.developerLabel}
        </MarketingButton>
        {!compact ? (
          <MarketingButton href={APP_MARKETPLACE_THIRD_PARTY_CTA.partnersHref} variant="ghost">
            Certified SI partners
          </MarketingButton>
        ) : null}
      </div>
    </section>
  );
}
