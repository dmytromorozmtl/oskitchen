'use client';

import Script from 'next/script';

import { useMarketingConsentGranted } from '@/components/analytics/use-marketing-consent';

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();

/**
 * Meta (Facebook) Pixel — loads after consent; set NEXT_PUBLIC_META_PIXEL_ID.
 * @see https://developers.facebook.com/docs/meta-pixel
 */
export function MetaPixel() {
  const consentGranted = useMarketingConsentGranted();
  if (!META_PIXEL_ID || !/^\d+$/.test(META_PIXEL_ID) || !consentGranted) return null;

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('consent', 'revoke');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
