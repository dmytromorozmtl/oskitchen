export type MarketingConsentEvent = {
  consentType: string;
  value: boolean;
  createdAt: Date;
};

/** Latest EMAIL_MARKETING consent must be true — consent-aware sync gate. */
export function hasMarketingEmailConsent(events: MarketingConsentEvent[]): boolean {
  const latest = events
    .filter((e) => e.consentType === "EMAIL_MARKETING")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  return latest?.value === true;
}
