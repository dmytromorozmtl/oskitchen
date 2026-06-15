-- External readiness intake systems: support, partner leads, sales inquiries.

CREATE TYPE "SupportTicketStatus" AS ENUM ('NEW', 'OPEN', 'WAITING', 'RESOLVED', 'CLOSED');
CREATE TYPE "SupportTicketCategory" AS ENUM ('BILLING', 'TECHNICAL', 'INTEGRATION', 'ONBOARDING', 'FEATURE_REQUEST', 'BUG', 'OTHER');
CREATE TYPE "SupportTicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "PartnerLeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'REJECTED');
CREATE TYPE "SalesInquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED_WON', 'CLOSED_LOST');

CREATE TABLE "support_tickets" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID,
  "email" VARCHAR(255) NOT NULL,
  "subject" VARCHAR(255) NOT NULL,
  "message" TEXT NOT NULL,
  "category" "SupportTicketCategory" NOT NULL DEFAULT 'OTHER',
  "priority" "SupportTicketPriority" NOT NULL DEFAULT 'MEDIUM',
  "status" "SupportTicketStatus" NOT NULL DEFAULT 'NEW',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "support_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "partner_leads" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "full_name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "company_name" VARCHAR(255),
  "website" VARCHAR(512),
  "client_type" VARCHAR(255),
  "message" TEXT,
  "status" "PartnerLeadStatus" NOT NULL DEFAULT 'NEW',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "partner_leads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sales_inquiries" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "full_name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(64),
  "company" VARCHAR(255),
  "website" VARCHAR(512),
  "business_type" VARCHAR(120),
  "locations" VARCHAR(120),
  "weekly_orders" VARCHAR(120),
  "current_systems" TEXT,
  "integrations_needed" JSONB,
  "message" TEXT,
  "status" "SalesInquiryStatus" NOT NULL DEFAULT 'NEW',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sales_inquiries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "support_tickets_user_id_idx" ON "support_tickets"("user_id");
CREATE INDEX "support_tickets_status_created_at_idx" ON "support_tickets"("status", "created_at");
CREATE INDEX "support_tickets_category_idx" ON "support_tickets"("category");
CREATE INDEX "partner_leads_status_created_at_idx" ON "partner_leads"("status", "created_at");
CREATE INDEX "sales_inquiries_status_created_at_idx" ON "sales_inquiries"("status", "created_at");
