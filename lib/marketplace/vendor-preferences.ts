export type MarketplaceVendorContract = {
  fileName: string;
  fileUrl?: string | null;
  effectiveDate?: string | null;
  expiresAt?: string | null;
  notes?: string | null;
  uploadedAt: string;
};

export type MarketplaceVendorPreferences = {
  favoriteVendorIds: string[];
  vendorContracts: Record<string, MarketplaceVendorContract>;
};

export const DEFAULT_MARKETPLACE_VENDOR_PREFERENCES: MarketplaceVendorPreferences = {
  favoriteVendorIds: [],
  vendorContracts: {},
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseMarketplaceVendorPreferences(raw: unknown): MarketplaceVendorPreferences {
  if (!isPlainObject(raw)) return { ...DEFAULT_MARKETPLACE_VENDOR_PREFERENCES };

  const favoriteVendorIds = Array.isArray(raw.favoriteVendorIds)
    ? raw.favoriteVendorIds.filter((id): id is string => typeof id === "string")
    : [];

  const vendorContracts: Record<string, MarketplaceVendorContract> = {};
  if (isPlainObject(raw.vendorContracts)) {
    for (const [vendorId, entry] of Object.entries(raw.vendorContracts)) {
      if (!isPlainObject(entry) || typeof entry.fileName !== "string") continue;
      vendorContracts[vendorId] = {
        fileName: entry.fileName,
        fileUrl: typeof entry.fileUrl === "string" ? entry.fileUrl : null,
        effectiveDate: typeof entry.effectiveDate === "string" ? entry.effectiveDate : null,
        expiresAt: typeof entry.expiresAt === "string" ? entry.expiresAt : null,
        notes: typeof entry.notes === "string" ? entry.notes : null,
        uploadedAt:
          typeof entry.uploadedAt === "string" ? entry.uploadedAt : new Date().toISOString(),
      };
    }
  }

  return { favoriteVendorIds, vendorContracts };
}

export function marketplacePrefsFromSettingsCenter(settingsCenterJson: unknown): MarketplaceVendorPreferences {
  if (!isPlainObject(settingsCenterJson)) {
    return { ...DEFAULT_MARKETPLACE_VENDOR_PREFERENCES };
  }
  return parseMarketplaceVendorPreferences(settingsCenterJson.marketplace);
}

export function mergeMarketplacePrefsIntoSettingsCenter(
  settingsCenterJson: unknown,
  prefs: MarketplaceVendorPreferences,
): Record<string, unknown> {
  const root = isPlainObject(settingsCenterJson) ? { ...settingsCenterJson } : {};
  root.marketplace = prefs;
  return root;
}

export function toggleFavoriteVendorId(
  prefs: MarketplaceVendorPreferences,
  vendorId: string,
): MarketplaceVendorPreferences {
  const set = new Set(prefs.favoriteVendorIds);
  if (set.has(vendorId)) set.delete(vendorId);
  else set.add(vendorId);
  return { ...prefs, favoriteVendorIds: [...set] };
}
