ALTER TABLE "workspaces"
ADD COLUMN IF NOT EXISTS "experiment_policy_json" JSONB;
