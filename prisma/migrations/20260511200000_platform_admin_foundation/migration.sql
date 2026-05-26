-- Platform administration: roles, impersonation audit, internal notes, feature flags.

CREATE TYPE "PlatformRole" AS ENUM (
    'SUPER_ADMIN',
    'PLATFORM_ADMIN',
    'SUPPORT_ADMIN',
    'IMPLEMENTATION_ADMIN',
    'GROWTH_ADMIN',
    'PARTNER_ADMIN',
    'STANDARD_USER'
);

CREATE TYPE "InternalNoteVisibility" AS ENUM (
    'SUPER_ADMIN',
    'SUPPORT_TEAM',
    'IMPLEMENTATION_TEAM'
);

CREATE TABLE "platform_user_roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "role" "PlatformRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_user_roles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "platform_user_roles_user_id_role_key" ON "platform_user_roles"("user_id", "role");
CREATE INDEX "platform_user_roles_user_id_idx" ON "platform_user_roles"("user_id");

ALTER TABLE "platform_user_roles" ADD CONSTRAINT "platform_user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "impersonation_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "admin_user_id" UUID NOT NULL,
    "target_user_id" UUID NOT NULL,
    "reason" VARCHAR(500),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "impersonation_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "impersonation_sessions_admin_user_id_started_at_idx" ON "impersonation_sessions"("admin_user_id", "started_at");
CREATE INDEX "impersonation_sessions_target_user_id_idx" ON "impersonation_sessions"("target_user_id");

ALTER TABLE "impersonation_sessions" ADD CONSTRAINT "impersonation_sessions_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "impersonation_sessions" ADD CONSTRAINT "impersonation_sessions_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "internal_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "entity_type" VARCHAR(120) NOT NULL,
    "entity_id" VARCHAR(255) NOT NULL,
    "author_user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "visibility" "InternalNoteVisibility" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internal_notes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "internal_notes_entity_type_entity_id_idx" ON "internal_notes"("entity_type", "entity_id");
CREATE INDEX "internal_notes_author_user_id_idx" ON "internal_notes"("author_user_id");

ALTER TABLE "internal_notes" ADD CONSTRAINT "internal_notes_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "feature_flags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" VARCHAR(120) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "feature_flags_key_key" ON "feature_flags"("key");

CREATE TABLE "workspace_feature_overrides" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "feature_key" VARCHAR(120) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_feature_overrides_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "workspace_feature_overrides_workspace_id_feature_key_key" ON "workspace_feature_overrides"("workspace_id", "feature_key");
CREATE INDEX "workspace_feature_overrides_workspace_id_idx" ON "workspace_feature_overrides"("workspace_id");

ALTER TABLE "workspace_feature_overrides" ADD CONSTRAINT "workspace_feature_overrides_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
