"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  isPartnerOAuthScope,
  PARTNER_OAUTH_SCOPES,
} from "@/lib/developer/partner-oauth-scopes";
import { submitPartnerOAuthAppForReview } from "@/services/platform/partner-app-review-service";

const registerSchema = z.object({
  clientId: z.string().min(4).max(96),
  name: z.string().min(2).max(255),
  publisher: z.string().min(2).max(255),
  description: z.string().min(20).max(4000),
  redirectUris: z.string().min(8),
  allowedScopes: z.array(z.enum(PARTNER_OAUTH_SCOPES)).min(1),
  embedUrl: z.string().url().optional().or(z.literal("")),
  embedOrigins: z.string().optional(),
  contactEmail: z.string().email(),
  honestyNote: z.string().max(500).optional(),
});

export async function submitPartnerAppRegistrationAction(raw: z.infer<typeof registerSchema>) {
  const input = registerSchema.safeParse(raw);
  if (!input.success) {
    return { ok: false as const, error: "Please complete all required fields." };
  }

  const redirectUris = input.data.redirectUris
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const embedOrigins = (input.data.embedOrigins ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const result = await submitPartnerOAuthAppForReview({
    clientId: input.data.clientId,
    name: input.data.name,
    publisher: input.data.publisher,
    description: input.data.description,
    redirectUris,
    allowedScopes: input.data.allowedScopes.filter(isPartnerOAuthScope),
    embedUrl: input.data.embedUrl?.trim() || null,
    embedOrigins,
    contactEmail: input.data.contactEmail,
    honestyNote: input.data.honestyNote?.trim() || null,
  });

  if (!result.ok) return { ok: false as const, error: result.error };

  revalidatePath("/platform/partner-apps");
  return { ok: true as const, clientId: result.clientId };
}
