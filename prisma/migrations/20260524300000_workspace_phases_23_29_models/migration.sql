-- Phases 23–29: final user-scoped workspace_id columns

ALTER TABLE "packing_tasks" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "packing_tasks_workspace_id_idx" ON "packing_tasks"("workspace_id");
DO $$ BEGIN ALTER TABLE "packing_tasks" ADD CONSTRAINT "packing_tasks_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "packing_verification_sessions" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "packing_verification_sessions_workspace_id_idx" ON "packing_verification_sessions"("workspace_id");
DO $$ BEGIN ALTER TABLE "packing_verification_sessions" ADD CONSTRAINT "packing_verification_sessions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "packing_waves" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "packing_waves_workspace_id_idx" ON "packing_waves"("workspace_id");
DO $$ BEGIN ALTER TABLE "packing_waves" ADD CONSTRAINT "packing_waves_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "partner_members" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "partner_members_workspace_id_idx" ON "partner_members"("workspace_id");
DO $$ BEGIN ALTER TABLE "partner_members" ADD CONSTRAINT "partner_members_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "pickup_windows" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "pickup_windows_workspace_id_idx" ON "pickup_windows"("workspace_id");
DO $$ BEGIN ALTER TABLE "pickup_windows" ADD CONSTRAINT "pickup_windows_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "platform_user_roles" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "platform_user_roles_workspace_id_idx" ON "platform_user_roles"("workspace_id");
DO $$ BEGIN ALTER TABLE "platform_user_roles" ADD CONSTRAINT "platform_user_roles_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "playbooks" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "playbooks_workspace_id_idx" ON "playbooks"("workspace_id");
DO $$ BEGIN ALTER TABLE "playbooks" ADD CONSTRAINT "playbooks_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "playbook_events" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "playbook_events_workspace_id_idx" ON "playbook_events"("workspace_id");
DO $$ BEGIN ALTER TABLE "playbook_events" ADD CONSTRAINT "playbook_events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "playbook_runs" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "playbook_runs_workspace_id_idx" ON "playbook_runs"("workspace_id");
DO $$ BEGIN ALTER TABLE "playbook_runs" ADD CONSTRAINT "playbook_runs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "pnl_snapshots" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "pnl_snapshots_workspace_id_idx" ON "pnl_snapshots"("workspace_id");
DO $$ BEGIN ALTER TABLE "pnl_snapshots" ADD CONSTRAINT "pnl_snapshots_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "pos_audit_events" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "pos_audit_events_workspace_id_idx" ON "pos_audit_events"("workspace_id");
DO $$ BEGIN ALTER TABLE "pos_audit_events" ADD CONSTRAINT "pos_audit_events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "pos_held_orders" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "pos_held_orders_workspace_id_idx" ON "pos_held_orders"("workspace_id");
DO $$ BEGIN ALTER TABLE "pos_held_orders" ADD CONSTRAINT "pos_held_orders_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "pos_inventory_impact_events" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "pos_inventory_impact_events_workspace_id_idx" ON "pos_inventory_impact_events"("workspace_id");
DO $$ BEGIN ALTER TABLE "pos_inventory_impact_events" ADD CONSTRAINT "pos_inventory_impact_events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "pos_tabs" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "pos_tabs_workspace_id_idx" ON "pos_tabs"("workspace_id");
DO $$ BEGIN ALTER TABLE "pos_tabs" ADD CONSTRAINT "pos_tabs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "price_scenarios" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "price_scenarios_workspace_id_idx" ON "price_scenarios"("workspace_id");
DO $$ BEGIN ALTER TABLE "price_scenarios" ADD CONSTRAINT "price_scenarios_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "printed_labels" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "printed_labels_workspace_id_idx" ON "printed_labels"("workspace_id");
DO $$ BEGIN ALTER TABLE "printed_labels" ADD CONSTRAINT "printed_labels_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "production_batches" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "production_batches_workspace_id_idx" ON "production_batches"("workspace_id");
DO $$ BEGIN ALTER TABLE "production_batches" ADD CONSTRAINT "production_batches_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "production_plan_tasks" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "production_plan_tasks_workspace_id_idx" ON "production_plan_tasks"("workspace_id");
DO $$ BEGIN ALTER TABLE "production_plan_tasks" ADD CONSTRAINT "production_plan_tasks_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "production_stage_presets" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "production_stage_presets_workspace_id_idx" ON "production_stage_presets"("workspace_id");
DO $$ BEGIN ALTER TABLE "production_stage_presets" ADD CONSTRAINT "production_stage_presets_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "production_stations" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "production_stations_workspace_id_idx" ON "production_stations"("workspace_id");
DO $$ BEGIN ALTER TABLE "production_stations" ADD CONSTRAINT "production_stations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "production_templates" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "production_templates_workspace_id_idx" ON "production_templates"("workspace_id");
DO $$ BEGIN ALTER TABLE "production_templates" ADD CONSTRAINT "production_templates_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "production_work_items" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "production_work_items_workspace_id_idx" ON "production_work_items"("workspace_id");
DO $$ BEGIN ALTER TABLE "production_work_items" ADD CONSTRAINT "production_work_items_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "product_mapping_events" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "product_mapping_events_workspace_id_idx" ON "product_mapping_events"("workspace_id");
DO $$ BEGIN ALTER TABLE "product_mapping_events" ADD CONSTRAINT "product_mapping_events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "product_mapping_import_batches" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "product_mapping_import_batches_workspace_id_idx" ON "product_mapping_import_batches"("workspace_id");
DO $$ BEGIN ALTER TABLE "product_mapping_import_batches" ADD CONSTRAINT "product_mapping_import_batches_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "purchase_orders" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "purchase_orders_workspace_id_idx" ON "purchase_orders"("workspace_id");
DO $$ BEGIN ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "referral_codes" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "referral_codes_workspace_id_idx" ON "referral_codes"("workspace_id");
DO $$ BEGIN ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "reorder_queue_items" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "reorder_queue_items_workspace_id_idx" ON "reorder_queue_items"("workspace_id");
DO $$ BEGIN ALTER TABLE "reorder_queue_items" ADD CONSTRAINT "reorder_queue_items_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "restaurant_tables" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "restaurant_tables_workspace_id_idx" ON "restaurant_tables"("workspace_id");
DO $$ BEGIN ALTER TABLE "restaurant_tables" ADD CONSTRAINT "restaurant_tables_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "saved_reports" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "saved_reports_workspace_id_idx" ON "saved_reports"("workspace_id");
DO $$ BEGIN ALTER TABLE "saved_reports" ADD CONSTRAINT "saved_reports_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "sop_acknowledgements" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "sop_acknowledgements_workspace_id_idx" ON "sop_acknowledgements"("workspace_id");
DO $$ BEGIN ALTER TABLE "sop_acknowledgements" ADD CONSTRAINT "sop_acknowledgements_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "sop_documents" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "sop_documents_workspace_id_idx" ON "sop_documents"("workspace_id");
DO $$ BEGIN ALTER TABLE "sop_documents" ADD CONSTRAINT "sop_documents_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "staff_availability" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "staff_availability_workspace_id_idx" ON "staff_availability"("workspace_id");
DO $$ BEGIN ALTER TABLE "staff_availability" ADD CONSTRAINT "staff_availability_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "staff_certifications" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "staff_certifications_workspace_id_idx" ON "staff_certifications"("workspace_id");
DO $$ BEGIN ALTER TABLE "staff_certifications" ADD CONSTRAINT "staff_certifications_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "staff_events" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "staff_events_workspace_id_idx" ON "staff_events"("workspace_id");
DO $$ BEGIN ALTER TABLE "staff_events" ADD CONSTRAINT "staff_events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "staff_members" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "staff_members_workspace_id_idx" ON "staff_members"("workspace_id");
DO $$ BEGIN ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "staff_roles" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "staff_roles_workspace_id_idx" ON "staff_roles"("workspace_id");
DO $$ BEGIN ALTER TABLE "staff_roles" ADD CONSTRAINT "staff_roles_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "staff_shifts" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "staff_shifts_workspace_id_idx" ON "staff_shifts"("workspace_id");
DO $$ BEGIN ALTER TABLE "staff_shifts" ADD CONSTRAINT "staff_shifts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "storefront_assets" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "storefront_assets_workspace_id_idx" ON "storefront_assets"("workspace_id");
DO $$ BEGIN ALTER TABLE "storefront_assets" ADD CONSTRAINT "storefront_assets_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "storefront_campaigns" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "storefront_campaigns_workspace_id_idx" ON "storefront_campaigns"("workspace_id");
DO $$ BEGIN ALTER TABLE "storefront_campaigns" ADD CONSTRAINT "storefront_campaigns_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "storefront_domains" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "storefront_domains_workspace_id_idx" ON "storefront_domains"("workspace_id");
DO $$ BEGIN ALTER TABLE "storefront_domains" ADD CONSTRAINT "storefront_domains_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "storefront_gift_cards" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "storefront_gift_cards_workspace_id_idx" ON "storefront_gift_cards"("workspace_id");
DO $$ BEGIN ALTER TABLE "storefront_gift_cards" ADD CONSTRAINT "storefront_gift_cards_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "storefront_inventory_items" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "storefront_inventory_items_workspace_id_idx" ON "storefront_inventory_items"("workspace_id");
DO $$ BEGIN ALTER TABLE "storefront_inventory_items" ADD CONSTRAINT "storefront_inventory_items_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "storefront_loyalty_programs" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "storefront_loyalty_programs_workspace_id_idx" ON "storefront_loyalty_programs"("workspace_id");
DO $$ BEGIN ALTER TABLE "storefront_loyalty_programs" ADD CONSTRAINT "storefront_loyalty_programs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "storefront_menu_schedules" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "storefront_menu_schedules_workspace_id_idx" ON "storefront_menu_schedules"("workspace_id");
DO $$ BEGIN ALTER TABLE "storefront_menu_schedules" ADD CONSTRAINT "storefront_menu_schedules_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "storefront_orders" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "storefront_orders_workspace_id_idx" ON "storefront_orders"("workspace_id");
DO $$ BEGIN ALTER TABLE "storefront_orders" ADD CONSTRAINT "storefront_orders_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "storefront_pages" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "storefront_pages_workspace_id_idx" ON "storefront_pages"("workspace_id");
DO $$ BEGIN ALTER TABLE "storefront_pages" ADD CONSTRAINT "storefront_pages_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "storefront_reservations" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "storefront_reservations_workspace_id_idx" ON "storefront_reservations"("workspace_id");
DO $$ BEGIN ALTER TABLE "storefront_reservations" ADD CONSTRAINT "storefront_reservations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "storefront_themes" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "storefront_themes_workspace_id_idx" ON "storefront_themes"("workspace_id");
DO $$ BEGIN ALTER TABLE "storefront_themes" ADD CONSTRAINT "storefront_themes_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "storefront_upsell_rules" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "storefront_upsell_rules_workspace_id_idx" ON "storefront_upsell_rules"("workspace_id");
DO $$ BEGIN ALTER TABLE "storefront_upsell_rules" ADD CONSTRAINT "storefront_upsell_rules_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "storefront_waitlist_entries" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "storefront_waitlist_entries_workspace_id_idx" ON "storefront_waitlist_entries"("workspace_id");
DO $$ BEGIN ALTER TABLE "storefront_waitlist_entries" ADD CONSTRAINT "storefront_waitlist_entries_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "supplier_invoices" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "supplier_invoices_workspace_id_idx" ON "supplier_invoices"("workspace_id");
DO $$ BEGIN ALTER TABLE "supplier_invoices" ADD CONSTRAINT "supplier_invoices_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "temperature_logs" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "temperature_logs_workspace_id_idx" ON "temperature_logs"("workspace_id");
DO $$ BEGIN ALTER TABLE "temperature_logs" ADD CONSTRAINT "temperature_logs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "template_applications" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "template_applications_workspace_id_idx" ON "template_applications"("workspace_id");
DO $$ BEGIN ALTER TABLE "template_applications" ADD CONSTRAINT "template_applications_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "template_application_events" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "template_application_events_workspace_id_idx" ON "template_application_events"("workspace_id");
DO $$ BEGIN ALTER TABLE "template_application_events" ADD CONSTRAINT "template_application_events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "time_entries_workspace_id_idx" ON "time_entries"("workspace_id");
DO $$ BEGIN ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "training_assignments" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "training_assignments_workspace_id_idx" ON "training_assignments"("workspace_id");
DO $$ BEGIN ALTER TABLE "training_assignments" ADD CONSTRAINT "training_assignments_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "training_certifications" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "training_certifications_workspace_id_idx" ON "training_certifications"("workspace_id");
DO $$ BEGIN ALTER TABLE "training_certifications" ADD CONSTRAINT "training_certifications_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "training_events" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "training_events_workspace_id_idx" ON "training_events"("workspace_id");
DO $$ BEGIN ALTER TABLE "training_events" ADD CONSTRAINT "training_events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "training_incident_drills" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "training_incident_drills_workspace_id_idx" ON "training_incident_drills"("workspace_id");
DO $$ BEGIN ALTER TABLE "training_incident_drills" ADD CONSTRAINT "training_incident_drills_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "training_programs" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "training_programs_workspace_id_idx" ON "training_programs"("workspace_id");
DO $$ BEGIN ALTER TABLE "training_programs" ADD CONSTRAINT "training_programs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "training_progress" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "training_progress_workspace_id_idx" ON "training_progress"("workspace_id");
DO $$ BEGIN ALTER TABLE "training_progress" ADD CONSTRAINT "training_progress_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "training_quiz_attempts" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "training_quiz_attempts_workspace_id_idx" ON "training_quiz_attempts"("workspace_id");
DO $$ BEGIN ALTER TABLE "training_quiz_attempts" ADD CONSTRAINT "training_quiz_attempts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "training_simulations" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "training_simulations_workspace_id_idx" ON "training_simulations"("workspace_id");
DO $$ BEGIN ALTER TABLE "training_simulations" ADD CONSTRAINT "training_simulations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "training_simulation_runs" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "training_simulation_runs_workspace_id_idx" ON "training_simulation_runs"("workspace_id");
DO $$ BEGIN ALTER TABLE "training_simulation_runs" ADD CONSTRAINT "training_simulation_runs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "trial_states" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "trial_states_workspace_id_idx" ON "trial_states"("workspace_id");
DO $$ BEGIN ALTER TABLE "trial_states" ADD CONSTRAINT "trial_states_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "usage_counters" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "usage_counters_workspace_id_idx" ON "usage_counters"("workspace_id");
DO $$ BEGIN ALTER TABLE "usage_counters" ADD CONSTRAINT "usage_counters_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "user_tour_states" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "user_tour_states_workspace_id_idx" ON "user_tour_states"("workspace_id");
DO $$ BEGIN ALTER TABLE "user_tour_states" ADD CONSTRAINT "user_tour_states_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "waste_events" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "waste_events_workspace_id_idx" ON "waste_events"("workspace_id");
DO $$ BEGIN ALTER TABLE "waste_events" ADD CONSTRAINT "waste_events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "webhook_processing_jobs" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "webhook_processing_jobs_workspace_id_idx" ON "webhook_processing_jobs"("workspace_id");
DO $$ BEGIN ALTER TABLE "webhook_processing_jobs" ADD CONSTRAINT "webhook_processing_jobs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "workspace_product_categories" ADD COLUMN IF NOT EXISTS "workspace_id" UUID;
CREATE INDEX IF NOT EXISTS "workspace_product_categories_workspace_id_idx" ON "workspace_product_categories"("workspace_id");
DO $$ BEGIN ALTER TABLE "workspace_product_categories" ADD CONSTRAINT "workspace_product_categories_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
