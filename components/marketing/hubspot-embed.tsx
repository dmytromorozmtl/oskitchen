'use client';

import Script from 'next/script';

const PORTAL_ID = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID?.trim();
const REGION = process.env.NEXT_PUBLIC_HUBSPOT_REGION?.trim() || 'na1';

type Props = {
  formId: string;
  className?: string;
};

/**
 * HubSpot embedded form — set NEXT_PUBLIC_HUBSPOT_PORTAL_ID and form GUID env vars.
 * Falls back to null when portal ID is unset (parent should render native form).
 */
export function HubSpotEmbed({ formId, className }: Props) {
  if (!PORTAL_ID || !formId) return null;

  const targetId = `hubspot-form-${formId}`;

  return (
    <div className={className}>
      <Script
        id={`hs-forms-${formId}`}
        strategy="afterInteractive"
        src={`https://js-${REGION}.hsforms.net/forms/embed/v2.js`}
        onLoad={() => {
          const hbspt = (window as unknown as { hbspt?: { forms: { create: (o: Record<string, string>) => void } } })
            .hbspt;
          if (!hbspt?.forms?.create) return;
          const el = document.getElementById(targetId);
          if (!el || el.dataset.hsLoaded === 'true') return;
          el.dataset.hsLoaded = 'true';
          hbspt.forms.create({
            region: REGION,
            portalId: PORTAL_ID,
            formId,
            target: `#${targetId}`,
          });
        }}
      />
      <div id={targetId} className="min-h-[320px] w-full" />
    </div>
  );
}

export function hasHubSpotPortal(): boolean {
  return Boolean(PORTAL_ID);
}

export function hubSpotSalesFormId(): string | undefined {
  return process.env.NEXT_PUBLIC_HUBSPOT_SALES_FORM_ID?.trim();
}

export function hubSpotDemoFormId(): string | undefined {
  return process.env.NEXT_PUBLIC_HUBSPOT_DEMO_FORM_ID?.trim() || hubSpotSalesFormId();
}
