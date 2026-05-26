-- Beta program applications (public form submissions)

CREATE TYPE "BetaApplicationStatus" AS ENUM ('NEW', 'REVIEWED', 'ACCEPTED', 'DECLINED');

CREATE TABLE "beta_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" VARCHAR(40),
    "business_name" TEXT NOT NULL,
    "business_type" "BusinessType" NOT NULL,
    "website" TEXT,
    "current_platform" TEXT,
    "weekly_order_volume" VARCHAR(120),
    "pain_points" TEXT,
    "status" "BetaApplicationStatus" NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beta_applications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "beta_applications_email_idx" ON "beta_applications"("email");
CREATE INDEX "beta_applications_status_created_at_idx" ON "beta_applications"("status", "created_at");
