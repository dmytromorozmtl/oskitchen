-- Per-user module enable/disable (workspace-scoped expansion can add workspace_id later).

CREATE TABLE "kitchen_module_preferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "module_key" VARCHAR(80) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kitchen_module_preferences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "kitchen_module_preferences_user_id_module_key_key"
  ON "kitchen_module_preferences"("user_id", "module_key");

CREATE INDEX "kitchen_module_preferences_user_id_idx"
  ON "kitchen_module_preferences"("user_id");

ALTER TABLE "kitchen_module_preferences"
  ADD CONSTRAINT "kitchen_module_preferences_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
