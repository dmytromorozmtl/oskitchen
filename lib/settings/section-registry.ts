/**
 * Canonical registry of Settings Center sections.
 * Sidebar, search, breadcrumbs, and Control Center overview all derive from this list.
 */

export type SettingsSectionGroupKey =
  | "workspace"
  | "operations"
  | "customers"
  | "platform"
  | "ops_admin"
  | "advanced";

export type SettingsSectionGroup = {
  key: SettingsSectionGroupKey;
  label: string;
};

export const SETTINGS_SECTION_GROUPS: readonly SettingsSectionGroup[] = [
  { key: "workspace", label: "Workspace" },
  { key: "operations", label: "Operations" },
  { key: "customers", label: "Customers & storefront" },
  { key: "platform", label: "Platform" },
  { key: "ops_admin", label: "Admin & compliance" },
  { key: "advanced", label: "Developer & advanced" },
];

export type SettingsCapability =
  | "view_settings"
  | "manage_workspace"
  | "manage_operations"
  | "manage_orders"
  | "manage_production"
  | "manage_packing"
  | "manage_delivery"
  | "manage_routes"
  | "manage_crm"
  | "manage_storefront"
  | "manage_branding"
  | "manage_domains"
  | "manage_notifications"
  | "manage_integrations"
  | "manage_billing"
  | "manage_staff"
  | "manage_security"
  | "manage_automation"
  | "manage_ai"
  | "manage_imports"
  | "manage_compliance"
  | "manage_developer"
  | "manage_advanced";

export type SettingsSection = {
  /** Stable key — used by health scoring, search, deeplinks. */
  key:
    | "overview"
    | "profile"
    | "workspace"
    | "currency"
    | "modules"
    | "operations"
    | "orders"
    | "pos"
    | "production"
    | "packing"
    | "delivery"
    | "delivery_zones"
    | "routes"
    | "crm"
    | "storefront"
    | "branding"
    | "white_label"
    | "domains"
    | "notifications"
    | "integrations"
    | "billing"
    | "referrals"
    | "voice"
    | "hardware"
    | "staff"
    | "security"
    | "automation"
    | "ai"
    | "imports"
    | "backups"
    | "compliance"
    | "developer"
    | "advanced";
  label: string;
  description: string;
  href: string;
  group: SettingsSectionGroupKey;
  /** lucide-react icon name (resolved client-side). */
  icon: string;
  /** Owner-only and super-admin bypass still applies. */
  capability: SettingsCapability;
  /** When true, the section is a structured bridge to an existing center, not a new form. */
  bridge?: boolean;
  /** Optional badge for sidebar (e.g. "Beta", "Pro"). */
  badge?: string;
  /** Optional keywords for the sidebar search. */
  keywords?: readonly string[];
};

export const SETTINGS_SECTIONS: readonly SettingsSection[] = [
  {
    key: "overview",
    label: "Control Center",
    description: "Workspace health, quick actions, and platform status.",
    href: "/dashboard/settings",
    group: "workspace",
    icon: "LayoutDashboard",
    capability: "view_settings",
    keywords: ["overview", "health", "status"],
  },
  {
    key: "profile",
    label: "Profile",
    description: "Your name, email, password, and avatar.",
    href: "/dashboard/settings/profile",
    group: "workspace",
    icon: "UserCircle",
    capability: "view_settings",
    keywords: ["account", "avatar", "password", "email", "name"],
  },
  {
    key: "workspace",
    label: "Workspace",
    description: "Legal entity, tax IDs, support contacts, hours, locale.",
    href: "/dashboard/settings/workspace",
    group: "workspace",
    icon: "Building2",
    capability: "manage_workspace",
    keywords: ["business", "tax", "vat", "gst", "hours", "currency", "timezone"],
  },
  {
    key: "currency",
    label: "Currency",
    description: "Workspace base currency, per-location overrides, and storefront Stripe alignment.",
    href: "/dashboard/settings/currency",
    group: "workspace",
    icon: "Coins",
    capability: "manage_workspace",
    keywords: ["multi-currency", "iso", "eur", "usd", "exchange", "lightspeed"],
  },
  {
    key: "modules",
    label: "Modules",
    description: "Enable, hide, or pin platform modules.",
    href: "/dashboard/settings/modules",
    group: "workspace",
    icon: "ToggleRight",
    capability: "manage_workspace",
    keywords: ["features", "navigation", "visibility"],
  },
  {
    key: "operations",
    label: "Operations",
    description: "Prep lead times, zones, cutoffs, capacity, QC.",
    href: "/dashboard/settings/operations",
    group: "operations",
    icon: "Settings2",
    capability: "manage_operations",
    keywords: ["prep", "cutoff", "qc", "allergen", "capacity"],
  },
  {
    key: "orders",
    label: "Orders",
    description: "Auto-confirm, approval, minimums, fraud, escalation.",
    href: "/dashboard/settings/orders",
    group: "operations",
    icon: "ListChecks",
    capability: "manage_orders",
    keywords: ["confirm", "approval", "minimum", "fraud"],
  },
  {
    key: "pos",
    label: "POS Terminal",
    description: "Counter sales defaults, receipt copy, payment modes, and hardware readiness.",
    href: "/dashboard/settings/pos",
    group: "operations",
    icon: "ScanBarcode",
    capability: "manage_orders",
    keywords: ["cashier", "register", "shift", "barcode", "receipt", "counter"],
  },
  {
    key: "production",
    label: "Production",
    description: "Shifts, batch sizing, station map, auto-printing.",
    href: "/dashboard/settings/production",
    group: "operations",
    icon: "ChefHat",
    capability: "manage_production",
    keywords: ["batch", "station", "shift", "kitchen"],
  },
  {
    key: "packing",
    label: "Packing",
    description: "Stages, QC requirements, label rules, hand-off policy.",
    href: "/dashboard/settings/packing",
    group: "operations",
    icon: "PackageCheck",
    capability: "manage_packing",
    keywords: ["packing", "qc", "labels"],
  },
  {
    key: "delivery",
    label: "Delivery",
    description: "Zones, fees, free thresholds, dispatch windows, couriers.",
    href: "/dashboard/settings/delivery",
    group: "operations",
    icon: "Truck",
    capability: "manage_delivery",
    keywords: ["delivery", "zones", "courier", "uber", "fees"],
  },
  {
    key: "delivery_zones",
    label: "Delivery zones & slots",
    description: "Geo-zone capacity limits and checkout slot windows.",
    href: "/dashboard/settings/delivery-zones",
    group: "operations",
    icon: "MapPin",
    capability: "manage_delivery",
    keywords: ["zones", "slots", "capacity", "geo", "checkout"],
  },
  {
    key: "routes",
    label: "Routes",
    description: "Route optimization defaults, driver assignment policy.",
    href: "/dashboard/settings/routes",
    group: "operations",
    icon: "Route",
    capability: "manage_routes",
    keywords: ["routes", "drivers", "optimization"],
  },
  {
    key: "crm",
    label: "CRM",
    description: "Segmentation, VIP, loyalty, churn, birthdays.",
    href: "/dashboard/settings/crm",
    group: "customers",
    icon: "Users",
    capability: "manage_crm",
    keywords: ["vip", "loyalty", "churn", "segmentation"],
  },
  {
    key: "storefront",
    label: "Storefront",
    description: "Pages, SEO, multilingual, multi-brand, white-label.",
    href: "/dashboard/settings/storefront",
    group: "customers",
    icon: "Store",
    capability: "manage_storefront",
    bridge: true,
    keywords: ["site", "seo", "pages"],
  },
  {
    key: "branding",
    label: "Branding",
    description: "Logo, dark logo, favicon, typography, email/label branding.",
    href: "/dashboard/settings/branding",
    group: "customers",
    icon: "Palette",
    capability: "manage_branding",
    keywords: ["logo", "color", "theme", "favicon"],
  },
  {
    key: "white_label",
    label: "White-label",
    description: "Enterprise storefront branding and OS Kitchen badge removal.",
    href: "/dashboard/settings/white-label",
    group: "customers",
    icon: "Sparkles",
    capability: "manage_branding",
    badge: "Enterprise",
    bridge: true,
    keywords: ["white label", "enterprise", "custom domain", "hide branding"],
  },
  {
    key: "domains",
    label: "Domains",
    description: "Custom domains, SSL, DNS readiness.",
    href: "/dashboard/settings/domains",
    group: "customers",
    icon: "Globe",
    capability: "manage_domains",
    keywords: ["domain", "dns", "ssl"],
  },
  {
    key: "notifications",
    label: "Notifications",
    description: "Templates, rules, internal alerts, provider.",
    href: "/dashboard/settings/notifications",
    group: "platform",
    icon: "Bell",
    capability: "manage_notifications",
    bridge: true,
    keywords: ["email", "resend", "alerts"],
  },
  {
    key: "integrations",
    label: "Integrations",
    description: "Stripe, Resend, Twilio, Slack, channels.",
    href: "/dashboard/settings/integrations",
    group: "platform",
    icon: "Plug",
    capability: "manage_integrations",
    bridge: true,
    keywords: ["stripe", "resend", "channels"],
  },
  {
    key: "billing",
    label: "Billing",
    description: "Plan, usage, invoices, payment methods.",
    href: "/dashboard/settings/billing",
    group: "platform",
    icon: "CreditCard",
    capability: "manage_billing",
    bridge: true,
    keywords: ["plan", "stripe", "invoice", "usage"],
  },
  {
    key: "referrals",
    label: "Referrals",
    description: "Refer a restaurant — both get a free month on your plan.",
    href: "/dashboard/settings/referrals",
    group: "platform",
    icon: "Gift",
    capability: "view_settings",
    bridge: true,
    keywords: ["referral", "invite", "free month", "partner"],
  },
  {
    key: "voice",
    label: "Voice ordering",
    description: "Alexa and Google Home — spoken orders to KDS.",
    href: "/dashboard/settings/voice",
    group: "platform",
    icon: "Mic",
    capability: "view_settings",
    bridge: true,
    badge: "Preview",
    keywords: ["alexa", "google home", "voice", "assistant"],
  },
  {
    key: "hardware",
    label: "Payment hardware",
    description: "Stripe Terminal — Reader M2, WisePOS E, P400 pairing.",
    href: "/dashboard/settings/hardware",
    group: "platform",
    icon: "CreditCard",
    capability: "view_settings",
    bridge: true,
    keywords: ["stripe terminal", "card reader", "m2", "wisepos", "p400"],
  },
  {
    key: "staff",
    label: "Staff & permissions",
    description: "RBAC roles, invitations, per-location access.",
    href: "/dashboard/settings/staff",
    group: "platform",
    icon: "Shield",
    capability: "manage_staff",
    bridge: true,
    keywords: ["staff", "rbac", "permissions"],
  },
  {
    key: "security",
    label: "Security",
    description: "2FA, sessions, IP restrictions, audit log, secrets.",
    href: "/dashboard/settings/security",
    group: "platform",
    icon: "Lock",
    capability: "manage_security",
    bridge: true,
    keywords: ["2fa", "session", "audit", "secret"],
  },
  {
    key: "automation",
    label: "Automation",
    description: "IF/THEN workflows across orders, production, delivery.",
    href: "/dashboard/settings/automation",
    group: "ops_admin",
    icon: "Workflow",
    capability: "manage_automation",
    bridge: true,
    keywords: ["workflow", "rules", "trigger"],
  },
  {
    key: "ai",
    label: "AI",
    description: "Provider, summaries, token caps, prompt presets.",
    href: "/dashboard/settings/ai",
    group: "ops_admin",
    icon: "Sparkles",
    capability: "manage_ai",
    keywords: ["ai", "prompts", "summaries"],
  },
  {
    key: "imports",
    label: "Imports",
    description: "CSV imports, mappings, validation logs.",
    href: "/dashboard/settings/imports",
    group: "ops_admin",
    icon: "Upload",
    capability: "manage_imports",
    bridge: true,
    keywords: ["csv", "import"],
  },
  {
    key: "backups",
    label: "Backups",
    description: "Snapshots, retention, restore previews.",
    href: "/dashboard/settings/backups",
    group: "ops_admin",
    icon: "DatabaseBackup",
    capability: "manage_imports",
    bridge: true,
    keywords: ["snapshot", "restore", "retention"],
  },
  {
    key: "compliance",
    label: "Compliance",
    description: "GDPR/PIPEDA, retention, consent, disclaimers.",
    href: "/dashboard/settings/compliance",
    group: "ops_admin",
    icon: "FileShield",
    capability: "manage_compliance",
    keywords: ["gdpr", "pipeda", "consent", "retention"],
  },
  {
    key: "developer",
    label: "Developer",
    description: "API keys, webhook inspector, feature flags, queue.",
    href: "/dashboard/settings/developer",
    group: "advanced",
    icon: "Code2",
    capability: "manage_developer",
    bridge: true,
    keywords: ["api", "webhook", "flag", "queue"],
  },
  {
    key: "advanced",
    label: "Advanced",
    description: "Workspace transfer, archive, danger zone.",
    href: "/dashboard/settings/advanced",
    group: "advanced",
    icon: "AlertTriangle",
    capability: "manage_advanced",
    keywords: ["transfer", "archive", "danger"],
  },
];

export function getSettingsSection(key: SettingsSection["key"]): SettingsSection {
  const found = SETTINGS_SECTIONS.find((s) => s.key === key);
  if (!found) throw new Error(`Unknown settings section: ${key}`);
  return found;
}

export function getSettingsSectionByHref(href: string): SettingsSection | undefined {
  return SETTINGS_SECTIONS.find((section) => section.href === href);
}

export function resolveSettingsSectionForPathname(pathname: string): SettingsSection | null {
  const path = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  const exact = getSettingsSectionByHref(path);
  if (exact) return exact;

  let best: SettingsSection | null = null;
  for (const section of SETTINGS_SECTIONS) {
    if (path === section.href || path.startsWith(`${section.href}/`)) {
      if (!best || section.href.length > best.href.length) {
        best = section;
      }
    }
  }
  return best;
}

export function sectionsByGroup(): Record<SettingsSectionGroupKey, SettingsSection[]> {
  const out: Record<SettingsSectionGroupKey, SettingsSection[]> = {
    workspace: [],
    operations: [],
    customers: [],
    platform: [],
    ops_admin: [],
    advanced: [],
  };
  for (const s of SETTINGS_SECTIONS) out[s.group].push(s);
  return out;
}
