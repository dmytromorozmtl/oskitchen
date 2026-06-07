'use client';

import { Activity, Cable } from 'lucide-react';

import { MarketingButton } from '@/components/marketing/button';
import { SectionHeader } from '@/components/marketing/section-header';
import { Badge } from '@/components/ui/badge';
import {
  SYNC_HEALTH_DASHBOARD_MARKETING_CHANNELS,
  SYNC_HEALTH_DASHBOARD_MARKETING_CTA,
  SYNC_HEALTH_DASHBOARD_MARKETING_H1,
  SYNC_HEALTH_DASHBOARD_MARKETING_HONESTY_NOTE,
  SYNC_HEALTH_DASHBOARD_MARKETING_SUBTITLE,
  syncHealthBandLabel,
} from '@/lib/marketing/sync-health-dashboard-marketing-content';
import { SYNC_HEALTH_INTEGRATION_HEALTH_DASHBOARD } from '@/lib/marketing/sync-health-dashboard-marketing-absolute-final-policy';

const BAND_STYLES = {
  healthy: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200',
  watch: 'border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-100',
  skipped: 'border-border bg-muted/40 text-muted-foreground',
  offline: 'border-destructive/30 bg-destructive/10 text-destructive',
} as const;

const MATURITY_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  LIVE: 'default',
  BETA: 'secondary',
  SKIPPED: 'outline',
  SETUP_READY: 'outline',
};

type Props = {
  compact?: boolean;
  showHeader?: boolean;
};

export function SyncHealthDashboardMarketing({ compact = false, showHeader = true }: Props) {
  return (
    <section
      className={compact ? 'space-y-6' : 'border-t border-border/60 py-16 sm:py-20'}
      data-testid="sync-health-dashboard-marketing"
    >
      {showHeader ? (
        <SectionHeader
          tag="Per-channel sync health"
          title={SYNC_HEALTH_DASHBOARD_MARKETING_H1}
          description={SYNC_HEALTH_DASHBOARD_MARKETING_SUBTITLE}
          centered={!compact}
          className={compact ? undefined : 'mx-auto'}
        />
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-border/80">
        <table className="w-full min-w-[720px] text-sm" aria-label="Per-channel sync health">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Channel</th>
              <th className="px-4 py-3 text-left font-medium">Maturity</th>
              <th className="px-4 py-3 text-left font-medium">Sync band</th>
              <th className="px-4 py-3 text-left font-medium">Last sync</th>
              <th className="px-4 py-3 text-left font-medium">Webhook</th>
              {!compact ? (
                <th className="px-4 py-3 text-left font-medium">Signal</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {SYNC_HEALTH_DASHBOARD_MARKETING_CHANNELS.map((channel) => (
              <tr
                key={channel.id}
                className="border-t border-border/60"
                data-testid={`sync-health-channel-${channel.id}`}
              >
                <td className="px-4 py-3 font-medium">{channel.label}</td>
                <td className="px-4 py-3">
                  <Badge variant={MATURITY_VARIANT[channel.maturity] ?? 'outline'}>
                    {channel.maturity}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${BAND_STYLES[channel.band]}`}
                  >
                    {syncHealthBandLabel(channel.band)}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{channel.lastSyncLabel}</td>
                <td className="px-4 py-3 text-muted-foreground">{channel.webhookLabel}</td>
                {!compact ? (
                  <td className="px-4 py-3 text-muted-foreground">{channel.syncSignal}</td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        <Cable className="mr-1 inline h-3.5 w-3.5" aria-hidden />
        {SYNC_HEALTH_DASHBOARD_MARKETING_HONESTY_NOTE} Illustrative rows — not fake green when{' '}
        <strong>SKIPPED</strong> or <strong>BETA</strong>. Marketplace channels remain{' '}
        <strong>partner-gated</strong> until credentialed.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <MarketingButton href={SYNC_HEALTH_DASHBOARD_MARKETING_CTA.primaryHref}>
          {SYNC_HEALTH_DASHBOARD_MARKETING_CTA.primaryLabel}
        </MarketingButton>
        <MarketingButton href={SYNC_HEALTH_INTEGRATION_HEALTH_DASHBOARD} variant="secondary">
          <Activity className="h-4 w-4" aria-hidden />
          {SYNC_HEALTH_DASHBOARD_MARKETING_CTA.dashboardLabel}
        </MarketingButton>
        {!compact ? (
          <MarketingButton href={SYNC_HEALTH_DASHBOARD_MARKETING_CTA.ihcMarketingHref} variant="ghost">
            Integration Health overview
          </MarketingButton>
        ) : null}
      </div>
    </section>
  );
}
