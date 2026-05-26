import Script from "next/script";

/**
 * Marketing tags (GA4 / Meta) only — injected when consent allows.
 * First-party operational analytics POST to `/api/storefront/analytics` via `ingestStorefrontFirstPartyEvent`
 * (see docs/STOREFRONT_SIGNED_ANALYTICS_BEACON.md).
 */
type Props = {
  googleTagManagerId?: string | null;
  googleAnalyticsId?: string | null;
  metaPixelId?: string | null;
};

/**
 * Injects storefront marketing tags. If GTM is configured, we do not also inject gtag.js to avoid double-counting GA.
 */
export function StorefrontAnalyticsScripts({ googleTagManagerId, googleAnalyticsId, metaPixelId }: Props) {
  const gtmOk = Boolean(googleTagManagerId && /^GTM-[A-Z0-9]+$/.test(googleTagManagerId));
  const gaId = googleAnalyticsId?.trim() ?? "";
  const gaOk = !gtmOk && /^G-[A-Z0-9]+$/.test(gaId);
  const pixelOk = Boolean(metaPixelId && /^\d{5,20}$/.test(metaPixelId));

  return (
    <>
      {gaOk ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="storefront-ga4" strategy="afterInteractive">
            {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', { anonymize_ip: true });
`}
          </Script>
        </>
      ) : null}
      {pixelOk ? (
        <Script id="storefront-meta-pixel" strategy="afterInteractive">
          {`
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${metaPixelId}');
fbq('track', 'PageView');
`}
        </Script>
      ) : null}
    </>
  );
}
