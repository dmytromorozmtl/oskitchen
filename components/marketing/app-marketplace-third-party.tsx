'use client';

import { Percent, Puzzle } from 'lucide-react';

import { MarketingButton } from '@/components/marketing/button';
import { SectionHeader } from '@/components/marketing/section-header';
import { Badge } from '@/components/ui/badge';
import {
  DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID,
  DESIGN_POLISH_BADGE_ROW_CLASS,
  DESIGN_POLISH_CARD_CLASS,
  DESIGN_POLISH_HERO_BANNER_CLASS,
  DESIGN_POLISH_ROW_SURFACE_CLASS,
} from '@/lib/design/absolute-final-design-polish-tokens';
import {
  PM_GTM_ABSOLUTE_FINAL_POLICY_ID,
  PM_GTM_DOC_CTA_MARKER,
  PM_GTM_DOC_DEMO_MARKER,
  PM_GTM_DOC_HERO_MARKER,
  PM_GTM_DOC_HONESTY_MARKER,
  PM_GTM_DOC_ICP_MARKER,
  PM_GTM_DOC_OBJECTIONS_MARKER,
  PM_GTM_DOC_PRICING_MARKER,
} from '@/lib/marketing/absolute-final-pm-marketing-full-scale-tokens';
import {
  APP_MARKETPLACE_GTM_DEMO_HOOK,
  APP_MARKETPLACE_GTM_HONESTY_SUMMARY,
  APP_MARKETPLACE_GTM_ICP_SUMMARY,
  APP_MARKETPLACE_GTM_OBJECTION_REPLY,
  APP_MARKETPLACE_GTM_PRICING_TRACK,
  APP_MARKETPLACE_GTM_PRIMARY_CTA,
} from '@/lib/marketing/app-marketplace-gtm-scale-content';
import { APP_MARKETPLACE_GTM_SCALE_ABSOLUTE_FINAL_POLICY_ID } from '@/lib/marketing/app-marketplace-gtm-scale-absolute-final-policy';
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
      className={compact ? 'space-y-6' : 'border-t border-border/60 py-16 sm:py-20 dark:border-border/50'}
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

      <div className={DESIGN_POLISH_HERO_BANNER_CLASS} role="note">
        <p className="font-medium text-foreground">Third-party app marketplace (Beta)</p>
        <p className="mt-1 text-muted-foreground dark:text-muted-foreground/90">
          {APP_MARKETPLACE_THIRD_PARTY_HONESTY_NOTE} OAuth apps require platform review — not a self-serve public store without security sign-off.
        </p>
      </div>

      <div className={DESIGN_POLISH_BADGE_ROW_CLASS}>
        <Badge variant="outline" className="rounded-full">
          <Percent className="mr-1 h-3 w-3" aria-hidden />
          {APP_MARKETPLACE_THIRD_PARTY_REVENUE_SHARE.summary}
        </Badge>
        <Badge variant="secondary" className="rounded-full">
          {APP_MARKETPLACE_THIRD_PARTY_EXTENSIONS.length} extensions
        </Badge>
      </div>

      <div className={`overflow-x-auto ${DESIGN_POLISH_CARD_CLASS}`}>
        <table className="w-full min-w-[720px] text-sm" aria-label="Third-party app marketplace">
          <thead className="bg-muted/40 dark:bg-muted/20">
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
                className={`border-t border-border/60 transition-colors hover:bg-muted/20 dark:border-border/50 dark:hover:bg-muted/10 ${DESIGN_POLISH_ROW_SURFACE_CLASS}`}
                data-testid={`app-marketplace-extension-${ext.id}`}
              >
                <td className="px-4 py-3">
                  <p className="font-medium">{ext.name}</p>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground/90">
                    {ext.publisher}
                  </p>
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
                  <td className="px-4 py-3 text-muted-foreground dark:text-muted-foreground/90">
                    {ext.honestyNote}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

      {!compact ? (
        <div
          className="space-y-6 border-t border-border/60 pt-10 dark:border-border/50"
          data-pm-gtm={PM_GTM_ABSOLUTE_FINAL_POLICY_ID}
        >
          {/* pm-gtm: absolute-final-pm-marketing-full-scale-v1 task-134 feature-89 · /app-marketplace · app-marketplace-third-party-absolute-final-v1 · app-marketplace-gtm-scale-absolute-final-v1 */}
          <div className={`${DESIGN_POLISH_CARD_CLASS} space-y-3 p-6`} data-pm-gtm={PM_GTM_DOC_HERO_MARKER}>
            <p className="text-sm font-medium text-foreground">pm-gtm-hero-banner</p>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground/90">
              GTM scale playbook embedded on /app-marketplace — pm-gtm-dark-mode-note
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className={`${DESIGN_POLISH_CARD_CLASS} p-5`} data-pm-gtm={PM_GTM_DOC_ICP_MARKER}>
              <h3 className="text-sm font-semibold">pm-gtm-icp-profile</h3>
              <p className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground/90">
                {APP_MARKETPLACE_GTM_ICP_SUMMARY}
              </p>
            </div>
            <div className={`${DESIGN_POLISH_CARD_CLASS} p-5`} data-pm-gtm={PM_GTM_DOC_DEMO_MARKER}>
              <h3 className="text-sm font-semibold">pm-gtm-demo-hook</h3>
              <p className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground/90">
                {APP_MARKETPLACE_GTM_DEMO_HOOK}
              </p>
            </div>
            <div
              className={`${DESIGN_POLISH_CARD_CLASS} p-5`}
              data-pm-gtm={PM_GTM_DOC_OBJECTIONS_MARKER}
            >
              <h3 className="text-sm font-semibold">pm-gtm-objection-handling</h3>
              <p className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground/90">
                {APP_MARKETPLACE_GTM_OBJECTION_REPLY}
              </p>
            </div>
            <div
              className={`${DESIGN_POLISH_CARD_CLASS} p-5`}
              data-pm-gtm={PM_GTM_DOC_PRICING_MARKER}
            >
              <h3 className="text-sm font-semibold">pm-gtm-pricing-talk-track</h3>
              <p className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground/90">
                {APP_MARKETPLACE_GTM_PRICING_TRACK}
              </p>
            </div>
          </div>

          <div className={`${DESIGN_POLISH_CARD_CLASS} p-5`} data-pm-gtm={PM_GTM_DOC_CTA_MARKER}>
            <h3 className="text-sm font-semibold">pm-gtm-primary-cta</h3>
            <p className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground/90">
              {APP_MARKETPLACE_GTM_PRIMARY_CTA}
            </p>
          </div>

          <div
            className={`${DESIGN_POLISH_HERO_BANNER_CLASS} space-y-2`}
            data-pm-gtm={PM_GTM_DOC_HONESTY_MARKER}
            role="note"
          >
            <h3 className="text-sm font-semibold">pm-gtm-honesty-guardrails</h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground/90">
              {APP_MARKETPLACE_GTM_HONESTY_SUMMARY}
            </p>
          </div>
        </div>
      ) : null}

      <p className="sr-only">
        {DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID} {APP_MARKETPLACE_GTM_SCALE_ABSOLUTE_FINAL_POLICY_ID}
      </p>
    </section>
  );
}
