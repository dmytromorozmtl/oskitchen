/** Reserved for privileged maintenance actions — pair with `PLATFORM_DANGEROUS_ACTION_IDS`. */
export async function platformToolsHealthcheck(): Promise<{ ok: boolean }> {
  return { ok: true };
}
