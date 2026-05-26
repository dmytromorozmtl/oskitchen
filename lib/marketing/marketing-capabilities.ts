import { buildCapabilityRows, type CapabilityRow } from '@/lib/capabilities/capability-matrix';
import type { ServerEnv } from '@/lib/env';

/** Static capability matrix for public marketing pages (no DATABASE_URL at build time). */
const MARKETING_ENV = {} as ServerEnv;

export function listMarketingCapabilities(): CapabilityRow[] {
  return buildCapabilityRows(MARKETING_ENV);
}
