/** ISO 3166-1 alpha-2 codes for onboarding country picker. */
export type OnboardingCountryOption = { code: string; name: string };

export const ONBOARDING_COUNTRIES: readonly OnboardingCountryOption[] = [
  { code: "CA", name: "Canada" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "IE", name: "Ireland" },
  { code: "PT", name: "Portugal" },
  { code: "AT", name: "Austria" },
  { code: "PL", name: "Poland" },
  { code: "CZ", name: "Czech Republic" },
  { code: "RO", name: "Romania" },
  { code: "HU", name: "Hungary" },
  { code: "GR", name: "Greece" },
  { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croatia" },
  { code: "SI", name: "Slovenia" },
  { code: "SK", name: "Slovakia" },
  { code: "LT", name: "Lithuania" },
  { code: "LV", name: "Latvia" },
  { code: "EE", name: "Estonia" },
  { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" },
  { code: "CY", name: "Cyprus" },
  { code: "IS", name: "Iceland" },
  { code: "MX", name: "Mexico" },
  { code: "BR", name: "Brazil" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },
  { code: "PE", name: "Peru" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "ZA", name: "South Africa" },
  { code: "IL", name: "Israel" },
  { code: "TR", name: "Turkey" },
  { code: "NZ", name: "New Zealand" },
  { code: "HK", name: "Hong Kong" },
  { code: "TW", name: "Taiwan" },
  { code: "MY", name: "Malaysia" },
  { code: "TH", name: "Thailand" },
  { code: "VN", name: "Vietnam" },
  { code: "PH", name: "Philippines" },
  { code: "ID", name: "Indonesia" },
  { code: "UA", name: "Ukraine" },
  { code: "OTHER", name: "Other" },
] as const;

export type OnboardingCurrencyOption = { code: string; label: string };

export const ONBOARDING_CURRENCIES: readonly OnboardingCurrencyOption[] = [
  { code: "USD", label: "USD — US Dollar" },
  { code: "CAD", label: "CAD — Canadian Dollar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "AUD", label: "AUD — Australian Dollar" },
  { code: "NZD", label: "NZD — New Zealand Dollar" },
  { code: "CHF", label: "CHF — Swiss Franc" },
  { code: "JPY", label: "JPY — Japanese Yen" },
  { code: "SEK", label: "SEK — Swedish Krona" },
  { code: "NOK", label: "NOK — Norwegian Krone" },
  { code: "DKK", label: "DKK — Danish Krone" },
  { code: "PLN", label: "PLN — Polish Złoty" },
  { code: "CZK", label: "CZK — Czech Koruna" },
  { code: "HUF", label: "HUF — Hungarian Forint" },
  { code: "RON", label: "RON — Romanian Leu" },
  { code: "BGN", label: "BGN — Bulgarian Lev" },
  { code: "MXN", label: "MXN — Mexican Peso" },
  { code: "BRL", label: "BRL — Brazilian Real" },
  { code: "ARS", label: "ARS — Argentine Peso" },
  { code: "CLP", label: "CLP — Chilean Peso" },
  { code: "COP", label: "COP — Colombian Peso" },
  { code: "SGD", label: "SGD — Singapore Dollar" },
  { code: "AED", label: "AED — UAE Dirham" },
  { code: "ILS", label: "ILS — Israeli Shekel" },
  { code: "TRY", label: "TRY — Turkish Lira" },
  { code: "ZAR", label: "ZAR — South African Rand" },
  { code: "INR", label: "INR — Indian Rupee" },
  { code: "KRW", label: "KRW — South Korean Won" },
  { code: "CNY", label: "CNY — Chinese Yuan" },
  { code: "UAH", label: "UAH — Ukrainian Hryvnia" },
] as const;

export type OnboardingTimezoneGroup = { label: string; zones: readonly { value: string; label: string }[] };

export const ONBOARDING_TIMEZONE_GROUPS: readonly OnboardingTimezoneGroup[] = [
  {
    label: "North America",
    zones: [
      { value: "America/Toronto", label: "America/Toronto (EST/EDT)" },
      { value: "America/New_York", label: "America/New_York (EST/EDT)" },
      { value: "America/Chicago", label: "America/Chicago (CST/CDT)" },
      { value: "America/Denver", label: "America/Denver (MST/MDT)" },
      { value: "America/Los_Angeles", label: "America/Los_Angeles (PST/PDT)" },
      { value: "America/Vancouver", label: "America/Vancouver (PST/PDT)" },
      { value: "America/Mexico_City", label: "America/Mexico_City (CST/CDT)" },
    ],
  },
  {
    label: "Europe",
    zones: [
      { value: "Europe/London", label: "Europe/London (GMT/BST)" },
      { value: "Europe/Paris", label: "Europe/Paris (CET/CEST)" },
      { value: "Europe/Berlin", label: "Europe/Berlin (CET/CEST)" },
      { value: "Europe/Madrid", label: "Europe/Madrid (CET/CEST)" },
      { value: "Europe/Amsterdam", label: "Europe/Amsterdam (CET/CEST)" },
      { value: "Europe/Warsaw", label: "Europe/Warsaw (CET/CEST)" },
      { value: "Europe/Kyiv", label: "Europe/Kyiv (EET/EEST)" },
    ],
  },
  {
    label: "Asia & Pacific",
    zones: [
      { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
      { value: "Asia/Singapore", label: "Asia/Singapore (SGT)" },
      { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
      { value: "Asia/Seoul", label: "Asia/Seoul (KST)" },
      { value: "Australia/Sydney", label: "Australia/Sydney (AEST/AEDT)" },
      { value: "Pacific/Auckland", label: "Pacific/Auckland (NZST/NZDT)" },
    ],
  },
  {
    label: "Other",
    zones: [{ value: "UTC", label: "UTC" }],
  },
] as const;

const COUNTRY_BY_CODE = new Map(ONBOARDING_COUNTRIES.map((c) => [c.code, c]));
const COUNTRY_BY_NAME = new Map(ONBOARDING_COUNTRIES.map((c) => [c.name.toLowerCase(), c]));

/** Map stored DB value (code or legacy name) to select value. */
export function normalizeOnboardingCountryValue(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  const upper = t.toUpperCase();
  if (COUNTRY_BY_CODE.has(upper)) return upper;
  const byName = COUNTRY_BY_NAME.get(t.toLowerCase());
  if (byName) return byName.code;
  return "";
}

export function isKnownOnboardingCurrency(code: string): boolean {
  return ONBOARDING_CURRENCIES.some((c) => c.code === code);
}

export function isKnownOnboardingTimezone(tz: string): boolean {
  return ONBOARDING_TIMEZONE_GROUPS.some((g) => g.zones.some((z) => z.value === tz));
}
