import { BRAND_ACCENT } from "@/lib/constants";
import { SITE_URL } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";
import { storefrontSettingsListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export type BrandedPwaManifest = {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  scope: string;
  display: "standalone";
  background_color: string;
  theme_color: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose: string;
  }>;
};

export type WhiteLabelPwaConfig = {
  workspaceId: string;
  storefrontId: string;
  storeSlug: string;
  restaurantName: string;
  logoUrl: string | null;
  themeColor: string;
  manifest: BrandedPwaManifest;
  manifestUrl: string;
  serviceWorkerUrl: string;
  installUrl: string;
  brandingPageUrl: string;
  published: boolean;
  publishedAt: string | null;
};

export type PublishBrandedPwaInput = {
  workspaceId: string;
  ownerUserId: string;
  logoUrl?: string | null;
  themeColor: string;
  hideKitchenOsBranding?: boolean;
};

const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export const PWA_COLOR_PRESETS = [
  { id: "kitchen-orange", label: "Kitchen orange", hex: "#FF5F1F" },
  { id: "midnight", label: "Midnight", hex: "#0D0E12" },
  { id: "forest", label: "Forest", hex: "#166534" },
  { id: "ocean", label: "Ocean", hex: "#0369A1" },
  { id: "berry", label: "Berry", hex: "#9D174D" },
  { id: "gold", label: "Gold", hex: "#CA8A04" },
] as const;

export function normalizeThemeColor(raw: string | null | undefined): string {
  const trimmed = raw?.trim() ?? "";
  if (HEX_RE.test(trimmed)) {
    if (trimmed.length === 4) {
      const r = trimmed[1]!;
      const g = trimmed[2]!;
      const b = trimmed[3]!;
      return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
    }
    return trimmed.toUpperCase();
  }
  return BRAND_ACCENT;
}

function parsePwaPublishedAt(themePublishedJson: unknown): string | null {
  if (!themePublishedJson || typeof themePublishedJson !== "object") return null;
  const pwa = (themePublishedJson as Record<string, unknown>).pwa;
  if (!pwa || typeof pwa !== "object") return null;
  const at = (pwa as Record<string, unknown>).publishedAt;
  return typeof at === "string" ? at : null;
}

export async function resolvePrimaryStorefrontForWorkspace(
  workspaceId: string,
  ownerUserId: string,
) {
  const scope = await storefrontSettingsListWhereForOwner(ownerUserId);
  return prisma.storefrontSettings.findFirst({
    where: {
      AND: [
        scope,
        {
          OR: [{ workspaceId }, { workspaceId: null, userId: ownerUserId }],
        },
      ],
      isPrimary: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export function buildBrandedManifest(input: {
  storeSlug: string;
  restaurantName: string;
  logoUrl: string | null;
  themeColor: string;
  hideKitchenOsBranding?: boolean;
}): BrandedPwaManifest {
  const name = input.restaurantName.trim() || input.storeSlug;
  const powered = input.hideKitchenOsBranding
    ? `Order from ${name}`
    : `Order from ${name} — OS Kitchen`;
  const icon = input.logoUrl?.trim() || "/favicon.svg";
  const iconType = icon.endsWith(".png")
    ? "image/png"
    : icon.endsWith(".jpg") || icon.endsWith(".jpeg")
      ? "image/jpeg"
      : "image/svg+xml";

  return {
    name,
    short_name: name.slice(0, 12),
    description: powered,
    start_url: `/s/${input.storeSlug}`,
    scope: `/s/${input.storeSlug}`,
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: normalizeThemeColor(input.themeColor),
    icons: [
      {
        src: icon,
        sizes: "any",
        type: iconType,
        purpose: "any",
      },
      {
        src: icon,
        sizes: "512x512",
        type: iconType,
        purpose: "maskable",
      },
    ],
  };
}

export async function generateBrandedPWA(
  workspaceId: string,
): Promise<WhiteLabelPwaConfig | null> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, ownerUserId: true, name: true },
  });
  if (!workspace?.ownerUserId) return null;

  const ownerUserId = workspace.ownerUserId;
  const [storefront, kitchen] = await Promise.all([
    resolvePrimaryStorefrontForWorkspace(workspaceId, ownerUserId),
    prisma.kitchenSettings.findUnique({
      where: { userId: ownerUserId },
      select: { businessName: true, logoUrl: true, brandColorHex: true, hideKitchenOsBranding: true },
    }),
  ]);

  if (!storefront) return null;

  const restaurantName =
    storefront.publicName?.trim() ||
    kitchen?.businessName?.trim() ||
    workspace.name?.trim() ||
    storefront.storeSlug;
  const logoUrl = storefront.logoUrl?.trim() || kitchen?.logoUrl?.trim() || null;
  const themeColor = normalizeThemeColor(
    storefront.brandColor ?? kitchen?.brandColorHex ?? BRAND_ACCENT,
  );
  const base = SITE_URL.replace(/\/$/, "");
  const manifest = buildBrandedManifest({
    storeSlug: storefront.storeSlug,
    restaurantName,
    logoUrl,
    themeColor,
    hideKitchenOsBranding: kitchen?.hideKitchenOsBranding ?? false,
  });

  return {
    workspaceId,
    storefrontId: storefront.id,
    storeSlug: storefront.storeSlug,
    restaurantName,
    logoUrl,
    themeColor,
    manifest,
    manifestUrl: `${base}/s/${storefront.storeSlug}/manifest.webmanifest`,
    serviceWorkerUrl: `${base}/s/${storefront.storeSlug}/sw.js`,
    installUrl: `${base}/branding?slug=${encodeURIComponent(storefront.storeSlug)}`,
    brandingPageUrl: `${base}/s/${storefront.storeSlug}`,
    published: storefront.published,
    publishedAt: parsePwaPublishedAt(storefront.themePublishedJson),
  };
}

export async function publishBrandedPWA(
  input: PublishBrandedPwaInput,
): Promise<{ ok: true; config: WhiteLabelPwaConfig } | { ok: false; error: string }> {
  const workspaceId =
    input.workspaceId || (await ensureOwnerWorkspaceId(input.ownerUserId));
  const storefront = await resolvePrimaryStorefrontForWorkspace(
    workspaceId,
    input.ownerUserId,
  );
  if (!storefront) {
    return { ok: false, error: "No storefront found — enable storefront first." };
  }

  const themeColor = normalizeThemeColor(input.themeColor);
  const logoUrl = input.logoUrl?.trim() || storefront.logoUrl?.trim() || null;
  const publishedAt = new Date().toISOString();

  const existingPublished =
    storefront.themePublishedJson && typeof storefront.themePublishedJson === "object"
      ? (storefront.themePublishedJson as Record<string, unknown>)
      : {};

  const themePublishedJson = {
    ...existingPublished,
    pwa: {
      logoUrl,
      themeColor,
      publishedAt,
      hideKitchenOsBranding: Boolean(input.hideKitchenOsBranding),
    },
  };

  await prisma.$transaction([
    prisma.storefrontSettings.update({
      where: { id: storefront.id },
      data: {
        logoUrl: logoUrl ?? undefined,
        brandColor: themeColor,
        published: true,
        enabled: true,
        themePublishedJson,
        themePublishedAt: new Date(),
      },
    }),
    prisma.kitchenSettings.updateMany({
      where: { userId: input.ownerUserId },
      data: {
        logoUrl: logoUrl ?? undefined,
        brandColorHex: themeColor,
        ...(input.hideKitchenOsBranding != null
          ? { hideKitchenOsBranding: input.hideKitchenOsBranding }
          : {}),
      },
    }),
  ]);

  const config = await generateBrandedPWA(workspaceId);
  if (!config) return { ok: false, error: "Failed to load PWA config after publish." };
  return { ok: true, config };
}
