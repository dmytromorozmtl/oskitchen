import { PRODUCTION_APP_URL } from '@/lib/auth/public-site-url';
import { APP_NAME } from '@/lib/constants';

import { JsonLd } from './json-ld';

const SITE = PRODUCTION_APP_URL;

/** WebPage schema for regional landing — Organization is in root layout. */
export function LocalSeoSchema() {
  return (
    <JsonLd
      id="schema-service-areas-webpage"
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${APP_NAME} Service Areas`,
        url: `${SITE}/service-areas`,
        description:
          'KitchenOS cloud POS, kitchen display, and production software for restaurants, meal prep, catering, and ghost kitchens in the United States and Canada.',
        inLanguage: 'en-US',
        isPartOf: {
          '@type': 'WebSite',
          name: APP_NAME,
          url: SITE,
        },
      }}
    />
  );
}
