import { getSessionUser } from '@/lib/auth';

import { SiteHeaderClient } from './site-header-client';

export async function SiteHeader() {
  const user = await getSessionUser();
  return <SiteHeaderClient isAuthenticated={Boolean(user)} />;
}
