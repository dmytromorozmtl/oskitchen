-- RUN ONLY AFTER: npm run workspace:post-backfill:verify
-- Sets workspace_id NOT NULL on all user-scoped tables.

BEGIN;

-- ActivationState
ALTER TABLE "activation_states" ALTER COLUMN "workspace_id" SET NOT NULL;

-- AdvisoryBoardApplication
ALTER TABLE "advisory_board_applications" ALTER COLUMN "workspace_id" SET NOT NULL;

-- AllergenProfile
ALTER TABLE "allergen_profiles" ALTER COLUMN "workspace_id" SET NOT NULL;

-- AnalyticsAlert
ALTER TABLE "analytics_alerts" ALTER COLUMN "workspace_id" SET NOT NULL;

-- AnalyticsEvent
ALTER TABLE "analytics_events" ALTER COLUMN "workspace_id" SET NOT NULL;

-- AnalyticsSavedView
ALTER TABLE "analytics_saved_views" ALTER COLUMN "workspace_id" SET NOT NULL;

-- AnalyticsSnapshot
ALTER TABLE "analytics_snapshots" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ApiKey
ALTER TABLE "api_keys" ALTER COLUMN "workspace_id" SET NOT NULL;

-- AppFeedback
ALTER TABLE "app_feedback" ALTER COLUMN "workspace_id" SET NOT NULL;

-- AuditExport
ALTER TABLE "audit_exports" ALTER COLUMN "workspace_id" SET NOT NULL;

-- AuditLog
ALTER TABLE "audit_logs" ALTER COLUMN "workspace_id" SET NOT NULL;

-- AuditRetentionPolicy
ALTER TABLE "audit_retention_policies" ALTER COLUMN "workspace_id" SET NOT NULL;

-- AutomationRule
ALTER TABLE "automation_rules" ALTER COLUMN "workspace_id" SET NOT NULL;

-- BankTransaction
ALTER TABLE "bank_transactions" ALTER COLUMN "workspace_id" SET NOT NULL;

-- BillingCustomer
ALTER TABLE "billing_customers" ALTER COLUMN "workspace_id" SET NOT NULL;

-- BillingEvent
ALTER TABLE "billing_events" ALTER COLUMN "workspace_id" SET NOT NULL;

-- Brand
ALTER TABLE "brands" ALTER COLUMN "workspace_id" SET NOT NULL;

-- CancellationFeedback
ALTER TABLE "cancellation_feedback" ALTER COLUMN "workspace_id" SET NOT NULL;

-- CashCount
ALTER TABLE "cash_counts" ALTER COLUMN "workspace_id" SET NOT NULL;

-- CateringQuote
ALTER TABLE "catering_quotes" ALTER COLUMN "workspace_id" SET NOT NULL;

-- CateringQuoteTemplate
ALTER TABLE "catering_quote_templates" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ChannelConflict
ALTER TABLE "channel_conflicts" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ChannelCredentialAudit
ALTER TABLE "channel_credential_audits" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ChannelFeeRule
ALTER TABLE "channel_fee_rules" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ChannelImportBatch
ALTER TABLE "channel_import_batches" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ChannelImportRollback
ALTER TABLE "channel_import_rollbacks" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ChannelRetryAttempt
ALTER TABLE "channel_retry_attempts" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ChannelRule
ALTER TABLE "channel_rules" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ChannelSetupProgress
ALTER TABLE "channel_setup_progress" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ChannelSyncJob
ALTER TABLE "channel_sync_jobs" ALTER COLUMN "workspace_id" SET NOT NULL;

-- CommissaryTransfer
ALTER TABLE "commissary_transfers" ALTER COLUMN "workspace_id" SET NOT NULL;

-- CompanyAccount
ALTER TABLE "company_accounts" ALTER COLUMN "workspace_id" SET NOT NULL;

-- CopilotActionDraft
ALTER TABLE "copilot_action_drafts" ALTER COLUMN "workspace_id" SET NOT NULL;

-- CopilotAuditEvent
ALTER TABLE "copilot_audit_events" ALTER COLUMN "workspace_id" SET NOT NULL;

-- CopilotConversation
ALTER TABLE "copilot_conversations" ALTER COLUMN "workspace_id" SET NOT NULL;

-- CopilotInsight
ALTER TABLE "copilot_insights" ALTER COLUMN "workspace_id" SET NOT NULL;

-- CopilotSettings
ALTER TABLE "copilot_settings" ALTER COLUMN "workspace_id" SET NOT NULL;

-- CostingRun
ALTER TABLE "costing_runs" ALTER COLUMN "workspace_id" SET NOT NULL;

-- CostSnapshot
ALTER TABLE "cost_snapshots" ALTER COLUMN "workspace_id" SET NOT NULL;

-- CustomerFeedback
ALTER TABLE "customer_feedback" ALTER COLUMN "workspace_id" SET NOT NULL;

-- CustomerFollowUp
ALTER TABLE "customer_follow_ups" ALTER COLUMN "workspace_id" SET NOT NULL;

-- CustomerHealthSnapshot
ALTER TABLE "customer_health_snapshots" ALTER COLUMN "workspace_id" SET NOT NULL;

-- CustomerMergeCandidate
ALTER TABLE "customer_merge_candidates" ALTER COLUMN "workspace_id" SET NOT NULL;

-- CustomerMergeEvent
ALTER TABLE "customer_merge_events" ALTER COLUMN "workspace_id" SET NOT NULL;

-- CustomerSegment
ALTER TABLE "customer_segments" ALTER COLUMN "workspace_id" SET NOT NULL;

-- CustomerSubscription
ALTER TABLE "customer_subscriptions" ALTER COLUMN "workspace_id" SET NOT NULL;

-- DataTemplate
ALTER TABLE "data_templates" ALTER COLUMN "workspace_id" SET NOT NULL;

-- DeliveryDispatch
ALTER TABLE "delivery_dispatches" ALTER COLUMN "workspace_id" SET NOT NULL;

-- DeliveryProof
ALTER TABLE "delivery_proofs" ALTER COLUMN "workspace_id" SET NOT NULL;

-- DeliveryRoute
ALTER TABLE "delivery_routes" ALTER COLUMN "workspace_id" SET NOT NULL;

-- DeliverySlot
ALTER TABLE "delivery_slots" ALTER COLUMN "workspace_id" SET NOT NULL;

-- DeliveryZone
ALTER TABLE "delivery_zones" ALTER COLUMN "workspace_id" SET NOT NULL;

-- DoorDashDelivery
ALTER TABLE "doordash_deliveries" ALTER COLUMN "workspace_id" SET NOT NULL;

-- DriverProfile
ALTER TABLE "driver_profiles" ALTER COLUMN "workspace_id" SET NOT NULL;

-- EntitlementOverride
ALTER TABLE "entitlement_overrides" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ErrorRecoveryItem
ALTER TABLE "error_recovery_items" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ExecutiveInsight
ALTER TABLE "executive_insights" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ExecutiveSnapshot
ALTER TABLE "executive_snapshots" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ExportJob
ALTER TABLE "export_jobs" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ExternalOrder
ALTER TABLE "external_orders" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ExternalProduct
ALTER TABLE "external_products" ALTER COLUMN "workspace_id" SET NOT NULL;

-- FoodSafetyAudit
ALTER TABLE "food_safety_audits" ALTER COLUMN "workspace_id" SET NOT NULL;

-- FoodSafetyChecklist
ALTER TABLE "food_safety_checklists" ALTER COLUMN "workspace_id" SET NOT NULL;

-- FoodSafetyCorrectiveAction
ALTER TABLE "food_safety_corrective_actions" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ForecastRun
ALTER TABLE "forecast_runs" ALTER COLUMN "workspace_id" SET NOT NULL;

-- Franchise
ALTER TABLE "franchises" ALTER COLUMN "workspace_id" SET NOT NULL;

-- GiftCard
ALTER TABLE "gift_cards" ALTER COLUMN "workspace_id" SET NOT NULL;

-- GoLiveProject
ALTER TABLE "go_live_projects" ALTER COLUMN "workspace_id" SET NOT NULL;

-- GoLiveTestRun
ALTER TABLE "go_live_test_runs" ALTER COLUMN "workspace_id" SET NOT NULL;

-- GrubhubDelivery
ALTER TABLE "grubhub_deliveries" ALTER COLUMN "workspace_id" SET NOT NULL;

-- HolidayPackage
ALTER TABLE "holiday_packages" ALTER COLUMN "workspace_id" SET NOT NULL;

-- HolidayPackageOrder
ALTER TABLE "holiday_package_orders" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ImplementationProject
ALTER TABLE "implementation_projects" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ImportJob
ALTER TABLE "import_jobs" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ImportMappingTemplate
ALTER TABLE "import_mapping_templates" ALTER COLUMN "workspace_id" SET NOT NULL;

-- Ingredient
ALTER TABLE "ingredients" ALTER COLUMN "workspace_id" SET NOT NULL;

-- IngredientDeclaration
ALTER TABLE "ingredient_declarations" ALTER COLUMN "workspace_id" SET NOT NULL;

-- IngredientDemandLine
ALTER TABLE "ingredient_demand_lines" ALTER COLUMN "workspace_id" SET NOT NULL;

-- IngredientDemandRun
ALTER TABLE "ingredient_demand_runs" ALTER COLUMN "workspace_id" SET NOT NULL;

-- IngredientLot
ALTER TABLE "ingredient_lots" ALTER COLUMN "workspace_id" SET NOT NULL;

-- IngredientSubstitution
ALTER TABLE "ingredient_substitutions" ALTER COLUMN "workspace_id" SET NOT NULL;

-- IntegrationConnection
ALTER TABLE "integration_connections" ALTER COLUMN "workspace_id" SET NOT NULL;

-- InventoryCount
ALTER TABLE "inventory_counts" ALTER COLUMN "workspace_id" SET NOT NULL;

-- InventoryStock
ALTER TABLE "inventory_stock" ALTER COLUMN "workspace_id" SET NOT NULL;

-- InvoiceRecord
ALTER TABLE "invoice_records" ALTER COLUMN "workspace_id" SET NOT NULL;

-- IotSensorDevice
ALTER TABLE "iot_sensor_devices" ALTER COLUMN "workspace_id" SET NOT NULL;

-- KitchenCustomer
ALTER TABLE "kitchen_customers" ALTER COLUMN "workspace_id" SET NOT NULL;

-- KitchenModulePreference
ALTER TABLE "kitchen_module_preferences" ALTER COLUMN "workspace_id" SET NOT NULL;

-- KitchenSettings
ALTER TABLE "kitchen_settings" ALTER COLUMN "workspace_id" SET NOT NULL;

-- KitchenTask
ALTER TABLE "kitchen_tasks" ALTER COLUMN "workspace_id" SET NOT NULL;

-- KitchenTaskTemplate
ALTER TABLE "kitchen_task_templates" ALTER COLUMN "workspace_id" SET NOT NULL;

-- LabelTemplate
ALTER TABLE "label_templates" ALTER COLUMN "workspace_id" SET NOT NULL;

-- LabelVerificationEvent
ALTER TABLE "label_verification_events" ALTER COLUMN "workspace_id" SET NOT NULL;

-- LaborRate
ALTER TABLE "labor_rates" ALTER COLUMN "workspace_id" SET NOT NULL;

-- LifecycleEmail
ALTER TABLE "lifecycle_emails" ALTER COLUMN "workspace_id" SET NOT NULL;

-- LifecycleEvent
ALTER TABLE "lifecycle_events" ALTER COLUMN "workspace_id" SET NOT NULL;

-- Location
ALTER TABLE "locations" ALTER COLUMN "workspace_id" SET NOT NULL;

-- LocationAssignmentEvent
ALTER TABLE "location_assignment_events" ALTER COLUMN "workspace_id" SET NOT NULL;

-- LoyaltyAccount
ALTER TABLE "loyalty_accounts" ALTER COLUMN "workspace_id" SET NOT NULL;

-- LoyaltyProgram
ALTER TABLE "loyalty_programs" ALTER COLUMN "workspace_id" SET NOT NULL;

-- MarginRule
ALTER TABLE "margin_rules" ALTER COLUMN "workspace_id" SET NOT NULL;

-- MealPlan
ALTER TABLE "meal_plans" ALTER COLUMN "workspace_id" SET NOT NULL;

-- MealPlanTemplate
ALTER TABLE "meal_plan_templates" ALTER COLUMN "workspace_id" SET NOT NULL;

-- Menu
ALTER TABLE "menus" ALTER COLUMN "workspace_id" SET NOT NULL;

-- MenuChannelPublish
ALTER TABLE "menu_channel_publishes" ALTER COLUMN "workspace_id" SET NOT NULL;

-- MenuRotationRule
ALTER TABLE "menu_rotation_rules" ALTER COLUMN "workspace_id" SET NOT NULL;

-- MenuTemplate
ALTER TABLE "menu_templates" ALTER COLUMN "workspace_id" SET NOT NULL;

-- NotificationEvent
ALTER TABLE "notification_events" ALTER COLUMN "workspace_id" SET NOT NULL;

-- NotificationLog
ALTER TABLE "notification_logs" ALTER COLUMN "workspace_id" SET NOT NULL;

-- NotificationPreference
ALTER TABLE "notification_preferences" ALTER COLUMN "workspace_id" SET NOT NULL;

-- NotificationRule
ALTER TABLE "notification_rules" ALTER COLUMN "workspace_id" SET NOT NULL;

-- NotificationTemplate
ALTER TABLE "notification_templates" ALTER COLUMN "workspace_id" SET NOT NULL;

-- NutritionProfile
ALTER TABLE "nutrition_profiles" ALTER COLUMN "workspace_id" SET NOT NULL;

-- OnboardingCall
ALTER TABLE "onboarding_calls" ALTER COLUMN "workspace_id" SET NOT NULL;

-- OperationsAudit
ALTER TABLE "operations_audits" ALTER COLUMN "workspace_id" SET NOT NULL;

-- OperationsChecklist
ALTER TABLE "operations_checklists" ALTER COLUMN "workspace_id" SET NOT NULL;

-- Order
ALTER TABLE "orders" ALTER COLUMN "workspace_id" SET NOT NULL;

-- OrderChannel
ALTER TABLE "order_channels" ALTER COLUMN "workspace_id" SET NOT NULL;

-- OrganizationMember
ALTER TABLE "organization_members" ALTER COLUMN "workspace_id" SET NOT NULL;

-- PackagingItem
ALTER TABLE "packaging_items" ALTER COLUMN "workspace_id" SET NOT NULL;

-- PackingBatch
ALTER TABLE "packing_batches" ALTER COLUMN "workspace_id" SET NOT NULL;

-- PackingEvent
ALTER TABLE "packing_events" ALTER COLUMN "workspace_id" SET NOT NULL;

-- PackingScanEvent
ALTER TABLE "packing_scan_events" ALTER COLUMN "workspace_id" SET NOT NULL;

-- PackingTask
ALTER TABLE "packing_tasks" ALTER COLUMN "workspace_id" SET NOT NULL;

-- PackingVerificationSession
ALTER TABLE "packing_verification_sessions" ALTER COLUMN "workspace_id" SET NOT NULL;

-- PackingWave
ALTER TABLE "packing_waves" ALTER COLUMN "workspace_id" SET NOT NULL;

-- PartnerClient
ALTER TABLE "partner_clients" ALTER COLUMN "workspace_id" SET NOT NULL;

-- PartnerManagedTicket
ALTER TABLE "partner_support_tickets" ALTER COLUMN "workspace_id" SET NOT NULL;

-- PartnerMember
ALTER TABLE "partner_members" ALTER COLUMN "workspace_id" SET NOT NULL;

-- PartnerRevenue
ALTER TABLE "partner_revenue" ALTER COLUMN "workspace_id" SET NOT NULL;

-- PickupWindow
ALTER TABLE "pickup_windows" ALTER COLUMN "workspace_id" SET NOT NULL;

-- PlatformUserRole
ALTER TABLE "platform_user_roles" ALTER COLUMN "workspace_id" SET NOT NULL;

-- Playbook
ALTER TABLE "playbooks" ALTER COLUMN "workspace_id" SET NOT NULL;

-- PlaybookEvent
ALTER TABLE "playbook_events" ALTER COLUMN "workspace_id" SET NOT NULL;

-- PlaybookRun
ALTER TABLE "playbook_runs" ALTER COLUMN "workspace_id" SET NOT NULL;

-- PnlSnapshot
ALTER TABLE "pnl_snapshots" ALTER COLUMN "workspace_id" SET NOT NULL;

-- POSAuditEvent
ALTER TABLE "pos_audit_events" ALTER COLUMN "workspace_id" SET NOT NULL;

-- POSCart
ALTER TABLE "pos_carts" ALTER COLUMN "workspace_id" SET NOT NULL;

-- POSHeldOrder
ALTER TABLE "pos_held_orders" ALTER COLUMN "workspace_id" SET NOT NULL;

-- PosInventoryImpactEvent
ALTER TABLE "pos_inventory_impact_events" ALTER COLUMN "workspace_id" SET NOT NULL;

-- POSRegister
ALTER TABLE "pos_registers" ALTER COLUMN "workspace_id" SET NOT NULL;

-- POSShift
ALTER TABLE "pos_shifts" ALTER COLUMN "workspace_id" SET NOT NULL;

-- PosTab
ALTER TABLE "pos_tabs" ALTER COLUMN "workspace_id" SET NOT NULL;

-- POSTerminal
ALTER TABLE "pos_terminals" ALTER COLUMN "workspace_id" SET NOT NULL;

-- POSTransaction
ALTER TABLE "pos_transactions" ALTER COLUMN "workspace_id" SET NOT NULL;

-- PriceScenario
ALTER TABLE "price_scenarios" ALTER COLUMN "workspace_id" SET NOT NULL;

-- PrintedLabel
ALTER TABLE "printed_labels" ALTER COLUMN "workspace_id" SET NOT NULL;

-- Product
ALTER TABLE "products" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ProductionBatch
ALTER TABLE "production_batches" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ProductionPlanTask
ALTER TABLE "production_plan_tasks" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ProductionStagePreset
ALTER TABLE "production_stage_presets" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ProductionStation
ALTER TABLE "production_stations" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ProductionTemplate
ALTER TABLE "production_templates" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ProductionWorkItem
ALTER TABLE "production_work_items" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ProductMapping
ALTER TABLE "product_mappings" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ProductMappingAlias
ALTER TABLE "product_mapping_aliases" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ProductMappingEvent
ALTER TABLE "product_mapping_events" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ProductMappingImportBatch
ALTER TABLE "product_mapping_import_batches" ALTER COLUMN "workspace_id" SET NOT NULL;

-- PurchaseOrder
ALTER TABLE "purchase_orders" ALTER COLUMN "workspace_id" SET NOT NULL;

-- PushSubscription
ALTER TABLE "push_subscriptions" ALTER COLUMN "workspace_id" SET NOT NULL;

-- Recipe
ALTER TABLE "recipes" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ReferralCode
ALTER TABLE "referral_codes" ALTER COLUMN "workspace_id" SET NOT NULL;

-- ReorderQueueItem
ALTER TABLE "reorder_queue_items" ALTER COLUMN "workspace_id" SET NOT NULL;

-- RestaurantTable
ALTER TABLE "restaurant_tables" ALTER COLUMN "workspace_id" SET NOT NULL;

-- SavedReport
ALTER TABLE "saved_reports" ALTER COLUMN "workspace_id" SET NOT NULL;

-- SOPAcknowledgement
ALTER TABLE "sop_acknowledgements" ALTER COLUMN "workspace_id" SET NOT NULL;

-- SOPDocument
ALTER TABLE "sop_documents" ALTER COLUMN "workspace_id" SET NOT NULL;

-- StaffAvailability
ALTER TABLE "staff_availability" ALTER COLUMN "workspace_id" SET NOT NULL;

-- StaffCertification
ALTER TABLE "staff_certifications" ALTER COLUMN "workspace_id" SET NOT NULL;

-- StaffEvent
ALTER TABLE "staff_events" ALTER COLUMN "workspace_id" SET NOT NULL;

-- StaffMember
ALTER TABLE "staff_members" ALTER COLUMN "workspace_id" SET NOT NULL;

-- StaffRole
ALTER TABLE "staff_roles" ALTER COLUMN "workspace_id" SET NOT NULL;

-- StaffShift
ALTER TABLE "staff_shifts" ALTER COLUMN "workspace_id" SET NOT NULL;

-- StorefrontAsset
ALTER TABLE "storefront_assets" ALTER COLUMN "workspace_id" SET NOT NULL;

-- StorefrontCampaign
ALTER TABLE "storefront_campaigns" ALTER COLUMN "workspace_id" SET NOT NULL;

-- StorefrontDomain
ALTER TABLE "storefront_domains" ALTER COLUMN "workspace_id" SET NOT NULL;

-- StorefrontGiftCard
ALTER TABLE "storefront_gift_cards" ALTER COLUMN "workspace_id" SET NOT NULL;

-- StorefrontInventoryItem
ALTER TABLE "storefront_inventory_items" ALTER COLUMN "workspace_id" SET NOT NULL;

-- StorefrontLoyaltyProgram
ALTER TABLE "storefront_loyalty_programs" ALTER COLUMN "workspace_id" SET NOT NULL;

-- StorefrontMenuSchedule
ALTER TABLE "storefront_menu_schedules" ALTER COLUMN "workspace_id" SET NOT NULL;

-- StorefrontOrder
ALTER TABLE "storefront_orders" ALTER COLUMN "workspace_id" SET NOT NULL;

-- StorefrontPage
ALTER TABLE "storefront_pages" ALTER COLUMN "workspace_id" SET NOT NULL;

-- StorefrontReservation
ALTER TABLE "storefront_reservations" ALTER COLUMN "workspace_id" SET NOT NULL;

-- StorefrontSettings
ALTER TABLE "storefront_settings" ALTER COLUMN "workspace_id" SET NOT NULL;

-- StorefrontTeamInvite
ALTER TABLE "storefront_team_invites" ALTER COLUMN "workspace_id" SET NOT NULL;

-- StorefrontTeamInviteEvent
ALTER TABLE "storefront_team_invite_events" ALTER COLUMN "workspace_id" SET NOT NULL;

-- StorefrontTheme
ALTER TABLE "storefront_themes" ALTER COLUMN "workspace_id" SET NOT NULL;

-- StorefrontUpsellRule
ALTER TABLE "storefront_upsell_rules" ALTER COLUMN "workspace_id" SET NOT NULL;

-- StorefrontWaitlistEntry
ALTER TABLE "storefront_waitlist_entries" ALTER COLUMN "workspace_id" SET NOT NULL;

-- Subscription
ALTER TABLE "subscriptions" ALTER COLUMN "workspace_id" SET NOT NULL;

-- Supplier
ALTER TABLE "suppliers" ALTER COLUMN "workspace_id" SET NOT NULL;

-- SupplierInvoice
ALTER TABLE "supplier_invoices" ALTER COLUMN "workspace_id" SET NOT NULL;

-- SupportMacro
ALTER TABLE "support_macros" ALTER COLUMN "workspace_id" SET NOT NULL;

-- SupportSavedView
ALTER TABLE "support_saved_views" ALTER COLUMN "workspace_id" SET NOT NULL;

-- SupportSlaPolicy
ALTER TABLE "support_sla_policies" ALTER COLUMN "workspace_id" SET NOT NULL;

-- SupportTicket
ALTER TABLE "support_tickets" ALTER COLUMN "workspace_id" SET NOT NULL;

-- TemperatureLog
ALTER TABLE "temperature_logs" ALTER COLUMN "workspace_id" SET NOT NULL;

-- TemplateApplication
ALTER TABLE "template_applications" ALTER COLUMN "workspace_id" SET NOT NULL;

-- TemplateApplicationEvent
ALTER TABLE "template_application_events" ALTER COLUMN "workspace_id" SET NOT NULL;

-- TimeEntry
ALTER TABLE "time_entries" ALTER COLUMN "workspace_id" SET NOT NULL;

-- TrainingAssignment
ALTER TABLE "training_assignments" ALTER COLUMN "workspace_id" SET NOT NULL;

-- TrainingCertification
ALTER TABLE "training_certifications" ALTER COLUMN "workspace_id" SET NOT NULL;

-- TrainingEvent
ALTER TABLE "training_events" ALTER COLUMN "workspace_id" SET NOT NULL;

-- TrainingIncidentDrill
ALTER TABLE "training_incident_drills" ALTER COLUMN "workspace_id" SET NOT NULL;

-- TrainingProgram
ALTER TABLE "training_programs" ALTER COLUMN "workspace_id" SET NOT NULL;

-- TrainingProgress
ALTER TABLE "training_progress" ALTER COLUMN "workspace_id" SET NOT NULL;

-- TrainingQuizAttempt
ALTER TABLE "training_quiz_attempts" ALTER COLUMN "workspace_id" SET NOT NULL;

-- TrainingSimulation
ALTER TABLE "training_simulations" ALTER COLUMN "workspace_id" SET NOT NULL;

-- TrainingSimulationRun
ALTER TABLE "training_simulation_runs" ALTER COLUMN "workspace_id" SET NOT NULL;

-- TrialState
ALTER TABLE "trial_states" ALTER COLUMN "workspace_id" SET NOT NULL;

-- UsageCounter
ALTER TABLE "usage_counters" ALTER COLUMN "workspace_id" SET NOT NULL;

-- UsageEvent
ALTER TABLE "usage_events" ALTER COLUMN "workspace_id" SET NOT NULL;

-- UserTourState
ALTER TABLE "user_tour_states" ALTER COLUMN "workspace_id" SET NOT NULL;

-- WasteEvent
ALTER TABLE "waste_events" ALTER COLUMN "workspace_id" SET NOT NULL;

-- WebhookEvent
ALTER TABLE "webhook_events" ALTER COLUMN "workspace_id" SET NOT NULL;

-- WebhookProcessingJob
ALTER TABLE "webhook_processing_jobs" ALTER COLUMN "workspace_id" SET NOT NULL;

-- WorkspaceFeatureOverride
ALTER TABLE "workspace_feature_overrides" ALTER COLUMN "workspace_id" SET NOT NULL;

-- WorkspaceMember
ALTER TABLE "workspace_members" ALTER COLUMN "workspace_id" SET NOT NULL;

-- WorkspaceProductCategory
ALTER TABLE "workspace_product_categories" ALTER COLUMN "workspace_id" SET NOT NULL;

COMMIT;
