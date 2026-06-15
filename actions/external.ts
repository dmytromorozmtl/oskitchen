"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth";
import { notifyGrowthInbound } from "@/lib/growth/growth-notify";
import { getRequestClientIp } from "@/lib/rate-limit/client-ip";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { consumeRateLimitToken } from "@/services/security/rate-limit-service";
import { asVoidFormAction } from "@/lib/actions/server-form-action";
import { createSupportTicket } from "@/services/support/ticket-service";

const ticketSchema = z.object({
  email: z.string().email(),
  subject: z.string().min(2).max(255),
  message: z.string().min(10).max(5000),
  category: z.enum([
    "BILLING",
    "TECHNICAL",
    "INTEGRATION",
    "ONBOARDING",
    "FEATURE_REQUEST",
    "BUG",
    "OTHER",
    "DATA_IMPORT",
    "PRODUCT_MAPPING",
    "STOREFRONT",
    "PRODUCTION",
    "PACKING",
    "ROUTES",
    "NOTIFICATIONS",
    "ACCOUNT_ACCESS",
    "SECURITY",
  ]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"]).default("MEDIUM"),
});

const partnerSchema = z.object({
  fullName: z.string().min(2).max(255),
  email: z.string().email(),
  companyName: z.string().max(255).optional().or(z.literal("")),
  website: z.string().max(512).optional().or(z.literal("")),
  clientType: z.string().max(255).optional().or(z.literal("")),
  message: z.string().max(4000).optional().or(z.literal("")),
});

const salesSchema = z.object({
  fullName: z.string().min(2).max(255),
  email: z.string().email(),
  phone: z.string().max(64).optional().or(z.literal("")),
  company: z.string().max(255).optional().or(z.literal("")),
  website: z.string().max(512).optional().or(z.literal("")),
  businessType: z.string().max(120).optional().or(z.literal("")),
  locations: z.string().max(120).optional().or(z.literal("")),
  weeklyOrders: z.string().max(120).optional().or(z.literal("")),
  currentSystems: z.string().max(2000).optional().or(z.literal("")),
  integrationsNeeded: z.array(z.string().max(80)).default([]),
  message: z.string().max(4000).optional().or(z.literal("")),
});

function values(formData: FormData, key: string): string[] {
  return formData.getAll(key).map(String).map((v) => v.trim()).filter(Boolean);
}

export async function submitSupportTicket(formData: FormData) {
  try {
    if (String(formData.get("company_hp") ?? "").trim()) return { ok: true as const };
    const session = await getSessionUser();
    const ip = await getRequestClientIp();
    const policy = session?.id ? "support_authed" : "support_public";
    const bucket = session?.id ? `support_ticket:user:${session.id}` : `support_ticket:ip:${ip}`;
    const rl = await consumeRateLimitToken(bucket, policy);
    if (!rl.ok) {
      return { error: "Too many submissions. Please try again shortly." };
    }

    const parsed = ticketSchema.safeParse({
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
      category: formData.get("category") || "OTHER",
      priority: formData.get("priority") || "MEDIUM",
    });
    if (!parsed.success) return { error: "Please check the support form and try again." };

    const d = parsed.data;
    await createSupportTicket({
      userId: session?.id ?? null,
      email: d.email.toLowerCase(),
      subject: d.subject,
      message: d.message,
      category: d.category,
      priority: d.priority,
      source: session?.id ? "DASHBOARD" : "PUBLIC_FORM",
    });
    revalidatePath("/dashboard/support");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function submitPartnerLead(formData: FormData) {
  try {
    if (String(formData.get("website_hp") ?? "").trim()) return { ok: true as const };
    const ip = await getRequestClientIp();
    const rl = await consumeRateLimitToken(`partner_lead:${ip}`, "partner_lead");
    if (!rl.ok) {
      return { error: "Too many submissions from this network. Please try again shortly." };
    }

    const parsed = partnerSchema.safeParse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      companyName: formData.get("companyName"),
      website: formData.get("website"),
      clientType: formData.get("clientType"),
      message: formData.get("message"),
    });
    if (!parsed.success) return { error: "Please check the partner form and try again." };
    const d = parsed.data;
    await prisma.partnerLead.create({
      data: {
        fullName: d.fullName,
        email: d.email.toLowerCase(),
        companyName: d.companyName || null,
        website: d.website || null,
        clientType: d.clientType || null,
        message: d.message || null,
      },
    });
    void notifyGrowthInbound(`Partner lead: ${d.companyName || d.fullName}`, `${d.email}\n${d.clientType ?? ""}\n\n${d.message ?? ""}`);
    revalidatePath("/dashboard/growth/partner-leads");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function submitSalesInquiry(formData: FormData) {
  try {
    if (String(formData.get("company_hp") ?? "").trim()) return { ok: true as const };
    const ip = await getRequestClientIp();
    const rl = await consumeRateLimitToken(`contact_sales:${ip}`, "contact_sales");
    if (!rl.ok) {
      return { error: "Too many submissions from this network. Please try again shortly." };
    }

    const parsed = salesSchema.safeParse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      company: formData.get("company"),
      website: formData.get("website"),
      businessType: formData.get("businessType"),
      locations: formData.get("locations"),
      weeklyOrders: formData.get("weeklyOrders"),
      currentSystems: formData.get("currentSystems"),
      integrationsNeeded: values(formData, "integrationsNeeded"),
      message: formData.get("message"),
    });
    if (!parsed.success) return { error: "Please check the sales form and try again." };
    const d = parsed.data;
    await prisma.salesInquiry.create({
      data: {
        fullName: d.fullName,
        email: d.email.toLowerCase(),
        phone: d.phone || null,
        company: d.company || null,
        website: d.website || null,
        businessType: d.businessType || null,
        locations: d.locations || null,
        weeklyOrders: d.weeklyOrders || null,
        currentSystems: d.currentSystems || null,
        integrationsNeeded: d.integrationsNeeded,
        message: d.message || null,
      },
    });
    void notifyGrowthInbound(`Sales inquiry: ${d.company || d.fullName}`, `${d.email}\nSystems: ${d.currentSystems ?? ""}\nIntegrations: ${d.integrationsNeeded.join(", ")}\n\n${d.message ?? ""}`);
    revalidatePath("/dashboard/growth/sales-inquiries");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export const submitSupportTicketFormAction = asVoidFormAction(submitSupportTicket);
export const submitPartnerLeadFormAction = asVoidFormAction(submitPartnerLead);
export const submitSalesInquiryFormAction = asVoidFormAction(submitSalesInquiry);
