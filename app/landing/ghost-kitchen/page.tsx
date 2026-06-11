import { permanentRedirect } from 'next/navigation';

import { GHOST_KITCHEN_SOFTWARE_ICP_PATH } from '@/lib/marketing/icp-landing-pages-policy';

/** Legacy route — canonical ICP landing is /ghost-kitchen-software (P1-79). */
export default function LegacyGhostKitchenLandingPage() {
  permanentRedirect(GHOST_KITCHEN_SOFTWARE_ICP_PATH);
}
