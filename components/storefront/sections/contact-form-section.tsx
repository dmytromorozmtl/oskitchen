import { StorefrontFormRenderer } from "@/components/storefront/forms/storefront-form-renderer";
import { StorefrontContactForm } from "@/components/storefront/storefront-contact-form";
import { prisma } from "@/lib/prisma";
import { turnstileSiteKey } from "@/lib/storefront/turnstile";
import type { contactFormSectionSchema } from "@/lib/storefront/section-schemas/builder-sections";
import type { z } from "zod";

type Content = z.infer<typeof contactFormSectionSchema>;

export async function ContactFormSection({
  storefrontId,
  storeSlug,
  content,
}: {
  storefrontId: string;
  storeSlug: string;
  content: Content;
}) {
  const formId = content.formId?.trim();
  const form = formId
    ? await prisma.storefrontForm.findFirst({
        where: { id: formId, storefrontId, active: true, archived: false },
        select: { id: true, title: true, fieldsJson: true, honeypotName: true },
      })
    : null;

  return (
    <div className="space-y-4">
      {content.heading ? <h2 className="text-2xl font-semibold tracking-tight">{content.heading}</h2> : null}
      {content.body ? <p className="text-muted-foreground">{content.body}</p> : null}
      {form ? (
        <StorefrontFormRenderer form={form} storeSlug={storeSlug} />
      ) : (
        <StorefrontContactForm
          storeSlug={storeSlug}
          type="CONTACT"
          title={content.heading ?? "Contact us"}
          turnstileSiteKey={turnstileSiteKey()}
        />
      )}
    </div>
  );
}
