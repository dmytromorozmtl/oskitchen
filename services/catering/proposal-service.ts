import {
  CateringQuoteAuditEventType,
  type CateringQuoteStatus,
  Prisma,
} from "@prisma/client";

import {
  buildPublicProposalPayload,
  hashForProposalView,
  isPublicTokenValid,
  type PublicProposalPayload,
} from "@/lib/catering/proposal-public-links";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export type PublicProposalResult =
  | { ok: true; payload: PublicProposalPayload }
  | { ok: false; reason: "not_found" | "revoked" | "expired" };

/**
 * Load a public proposal by token. Auto-records a `CateringProposalView`
 * row and updates `publicViewedAt`. Bumps the quote status from SENT to
 * VIEWED if it isn't already. Strict allow-list of returned fields.
 */
export async function loadPublicProposal(token: string, viewerHints?: { ipHash?: string | null; userAgent?: string | null }): Promise<PublicProposalResult> {
  if (!isPublicTokenValid(token)) {
    return { ok: false, reason: token.startsWith("revoked-") ? "revoked" : "not_found" };
  }
  const quote = await prisma.cateringQuote.findUnique({
    where: { publicToken: token },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      brand: { select: { name: true, logoUrl: true } },
    },
  });
  if (!quote) return { ok: false, reason: "not_found" };

  if (quote.validUntil && quote.validUntil < new Date()) {
    // Still render the payload but mark as expired so the public page can
    // surface the right state.
  }
  if (quote.status === "ARCHIVED" || quote.status === "CANCELLED") {
    return { ok: false, reason: "revoked" };
  }

  // Audit view (best-effort)
  try {
    await prisma.cateringProposalView.create({
      data: {
        quoteId: quote.id,
        publicToken: token,
        ipHash: hashForProposalView(viewerHints?.ipHash ?? null),
        userAgentHash: hashForProposalView(viewerHints?.userAgent ?? null),
      },
    });
    await prisma.cateringQuote.update({
      where: { id: quote.id },
      data: {
        publicViewedAt: new Date(),
        ...(quote.status === "SENT" || quote.status === "READY_TO_SEND"
          ? { status: "VIEWED" satisfies CateringQuoteStatus }
          : {}),
      },
    });
    await prisma.cateringQuoteEvent.create({
      data: {
        quoteId: quote.id,
        eventType: CateringQuoteAuditEventType.QUOTE_PROPOSAL_VIEWED,
        metadataJson: { token: token.slice(0, 6) + "…" } as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    logger.warn("[catering] proposal view audit failed", error);
  }

  return {
    ok: true,
    payload: buildPublicProposalPayload({
      quote,
      items: quote.items,
      brand: quote.brand ? { name: quote.brand.name, logoUrl: quote.brand.logoUrl ?? null } : null,
    }),
  };
}
