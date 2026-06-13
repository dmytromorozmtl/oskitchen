import { permanentRedirect } from 'next/navigation';

import { COMMISSARY_KITCHEN_SOFTWARE_LANDING_PATH } from '@/lib/marketing/commissary-kitchen-software-landing-content';

/** Legacy short route — canonical ICP landing is /commissary-kitchen-software (P3-61). */
export default function LegacyCommissarySoftwareLandingPage() {
  permanentRedirect(COMMISSARY_KITCHEN_SOFTWARE_LANDING_PATH);
}
