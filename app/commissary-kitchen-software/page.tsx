import { permanentRedirect } from 'next/navigation';

import { COMMISSARY_SOFTWARE_ICP_PATH } from '@/lib/marketing/icp-landing-pages-policy';

/** Legacy route — canonical ICP landing is /commissary-software (P1-79). */
export default function LegacyCommissaryKitchenSoftwareLandingPage() {
  permanentRedirect(COMMISSARY_SOFTWARE_ICP_PATH);
}
