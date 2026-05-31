import dns from "node:dns/promises";

import { SITE_URL } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export type StorefrontDomainVerificationStatus =
  | "NOT_CONFIGURED"
  | "PENDING"
  | "DNS_MISSING"
  | "DNS_VERIFIED"
  | "SSL_PENDING"
  | "ACTIVE"
  | "ERROR";

function normalizeHost(input: string | null | undefined): string {
  let h = (input ?? "").trim().toLowerCase();
  if (!h) return "";
  h = h.replace(/^https?:\/\//, "");
  h = h.split("/")[0] ?? "";
  h = h.split(":")[0] ?? "";
  return h;
}

function txtRecordName(hostname: string): string {
  return `_kos-verify.${hostname}`;
}

async function txtContainsToken(hostname: string, token: string): Promise<boolean> {
  const name = txtRecordName(hostname);
  try {
    const chunks = await dns.resolveTxt(name);
    const flat = chunks.map((c) => c.join("")).join("|");
    return flat.includes(token);
  } catch {
    return false;
  }
}

async function resolveHostSlug(host: string): Promise<{ slug: string | null }> {
  const secret = process.env.STOREFRONT_MIDDLEWARE_SECRET;
  if (!secret) {
    return { slug: null };
  }
  const base = SITE_URL.replace(/\/$/, "");
  const res = await fetch(`${base}/api/storefront/resolve-host?host=${encodeURIComponent(host)}`, {
    headers: { "x-kos-mw-secret": secret },
    cache: "no-store",
  });
  if (!res.ok) return { slug: null };
  const json = (await res.json()) as { slug?: string | null };
  return { slug: json.slug ?? null };
}

export type DomainVerificationRun = {
  status: StorefrontDomainVerificationStatus;
  checkedAt: Date;
  error: string | null;
  txtRecordName: string;
  token: string;
  resolveSlug: string | null;
  sslNote: string;
};

/**
 * Verifies DNS TXT challenge and whether internal host resolution maps to this storefront.
 * Does not claim certificate validity — TLS is reported separately.
 */
export async function runStorefrontDomainVerification(storefrontId: string): Promise<DomainVerificationRun> {
  const sf = await prisma.storefrontSettings.findUnique({
    where: { id: storefrontId },
    select: {
      id: true,
      storeSlug: true,
      customDomain: true,
      customDomainVerificationToken: true,
    },
  });
  const checkedAt = new Date();
  const sslNote =
    "Automatic TLS certificate status is managed by your hosting provider (for example Vercel). OS Kitchen does not query certificate chains from this dashboard.";

  if (!sf) {
    return {
      status: "ERROR",
      checkedAt,
      error: "Storefront not found.",
      txtRecordName: "",
      token: "",
      resolveSlug: null,
      sslNote,
    };
  }

  const host = normalizeHost(sf.customDomain);
  if (!host) {
    return {
      status: "NOT_CONFIGURED",
      checkedAt,
      error: null,
      txtRecordName: "",
      token: "",
      resolveSlug: null,
      sslNote,
    };
  }

  let token = (sf.customDomainVerificationToken ?? "").trim();
  if (!token) {
    token = `kos_${Math.random().toString(36).slice(2, 14)}${Math.random().toString(36).slice(2, 8)}`.slice(0, 64);
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { customDomainVerificationToken: token },
    });
  }

  const record = txtRecordName(host);
  const txtOk = await txtContainsToken(host, token);
  const { slug } = await resolveHostSlug(host);
  const slugMatches = Boolean(slug && slug === sf.storeSlug);

  let status: StorefrontDomainVerificationStatus = "PENDING";
  let error: string | null = null;

  if (!txtOk) {
    status = "DNS_MISSING";
    error = `TXT record missing or token mismatch. Create TXT name ${record} with value containing your verification token.`;
  } else if (!slugMatches) {
    status = "DNS_VERIFIED";
    error =
      "TXT verified, but internal host routing does not resolve this hostname to your storefront slug yet. Confirm CNAME/A records and hosting configuration, then refresh.";
  } else {
    status = "ACTIVE";
    error = null;
  }

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: {
      customDomainLastCheckedAt: checkedAt,
      customDomainLastError: error,
      customDomainStatus: status,
    },
  });

  return {
    status,
    checkedAt,
    error,
    txtRecordName: record,
    token,
    resolveSlug: slug,
    sslNote,
  };
}

/** Refresh resolve + TXT without minting a new token. */
export async function refreshStorefrontDomainRouting(storefrontId: string): Promise<DomainVerificationRun> {
  const sf = await prisma.storefrontSettings.findUnique({
    where: { id: storefrontId },
    select: {
      id: true,
      storeSlug: true,
      customDomain: true,
      customDomainVerificationToken: true,
    },
  });
  const checkedAt = new Date();
  const sslNote =
    "Automatic TLS certificate status is managed by your hosting provider. OS Kitchen does not inspect certificates from here.";

  if (!sf) {
    return {
      status: "ERROR",
      checkedAt,
      error: "Storefront not found.",
      txtRecordName: "",
      token: "",
      resolveSlug: null,
      sslNote,
    };
  }

  const host = normalizeHost(sf.customDomain);
  if (!host) {
    return {
      status: "NOT_CONFIGURED",
      checkedAt,
      error: null,
      txtRecordName: "",
      token: (sf.customDomainVerificationToken ?? "").trim(),
      resolveSlug: null,
      sslNote,
    };
  }

  const token = (sf.customDomainVerificationToken ?? "").trim();
  const record = token ? txtRecordName(host) : "";
  const txtOk = token ? await txtContainsToken(host, token) : false;
  const { slug } = await resolveHostSlug(host);
  const slugMatches = Boolean(slug && slug === sf.storeSlug);

  let status: StorefrontDomainVerificationStatus;
  let error: string | null = null;
  if (!token) {
    status = "PENDING";
    error = "Run “Verify DNS” once to generate a verification token.";
  } else if (!txtOk) {
    status = "DNS_MISSING";
    error = `TXT record missing or token mismatch at ${record}.`;
  } else if (!slugMatches) {
    status = "DNS_VERIFIED";
    error = "TXT OK, but hostname routing is not mapped to this storefront yet.";
  } else {
    status = "ACTIVE";
  }

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: {
      customDomainLastCheckedAt: checkedAt,
      customDomainLastError: error,
      customDomainStatus: status,
    },
  });

  return {
    status,
    checkedAt,
    error,
    txtRecordName: record,
    token,
    resolveSlug: slug,
    sslNote,
  };
}
