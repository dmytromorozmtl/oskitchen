/**
 * Phase 12 (20260524150000) + Phase 13 (20260524160000): nullable workspaceId — backfill before NOT NULL.
 */
export const PHASE_12_WORKSPACE_MIGRATION_PRIORITY = [
  "CateringQuote",
  "ApiKey",
  "BillingCustomer",
  "AutomationRule",
  "CashCount",
  "BankTransaction",
  "CompanyAccount",
  "CommissaryTransfer",
  "AnalyticsEvent",
  "ChannelCredentialAudit",
] as const;

export const PHASE_13_WORKSPACE_MIGRATION_PRIORITY = [
  "BillingEvent",
  "UsageEvent",
  "AppFeedback",
  "Ingredient",
  "NotificationLog",
  "CopilotConversation",
  "Recipe",
  "PushSubscription",
  "NotificationRule",
  "Supplier",
] as const;

export const PHASE_14_WORKSPACE_MIGRATION_PRIORITY = [
  "ActivationState",
  "AdvisoryBoardApplication",
  "AllergenProfile",
  "AnalyticsAlert",
  "AnalyticsSavedView",
  "AnalyticsSnapshot",
  "CancellationFeedback",
  "CateringQuoteTemplate",
  "ChannelFeeRule",
  "ChannelImportRollback",
] as const;

export const PHASE_15_WORKSPACE_MIGRATION_PRIORITY = [
  "KitchenSettings",
  "ChannelSetupProgress",
  "ChannelRetryAttempt",
  "CostingRun",
  "InventoryStock",
  "GiftCard",
  "CustomerSegment",
  "DeliveryRoute",
  "ForecastRun",
  "CopilotSettings",
] as const;

export const PHASE_16_WORKSPACE_MIGRATION_PRIORITY = [
  "CopilotActionDraft",
  "CopilotAuditEvent",
  "CopilotInsight",
  "CostSnapshot",
  "CustomerFeedback",
  "CustomerFollowUp",
  "CustomerHealthSnapshot",
  "CustomerMergeCandidate",
  "CustomerMergeEvent",
  "CustomerSubscription",
] as const;

export const PHASE_17_WORKSPACE_MIGRATION_PRIORITY = [
  "DataTemplate",
  "DeliveryDispatch",
  "DeliveryProof",
  "DeliverySlot",
  "DeliveryZone",
  "DoorDashDelivery",
  "DriverProfile",
  "EntitlementOverride",
  "ExecutiveInsight",
  "ExecutiveSnapshot",
] as const;

export const PHASE_18_WORKSPACE_MIGRATION_PRIORITY = [
  "FoodSafetyAudit",
  "FoodSafetyChecklist",
  "FoodSafetyCorrectiveAction",
  "Franchise",
  "GoLiveProject",
  "GoLiveTestRun",
  "GrubhubDelivery",
  "HolidayPackage",
  "HolidayPackageOrder",
  "ImplementationProject",
] as const;

export const PHASE_19_WORKSPACE_MIGRATION_PRIORITY = [
  "ImportMappingTemplate",
  "IngredientDeclaration",
  "IngredientDemandLine",
  "IngredientDemandRun",
  "IngredientLot",
  "IngredientSubstitution",
  "InventoryCount",
  "InvoiceRecord",
  "IotSensorDevice",
  "KitchenModulePreference",
] as const;

export const PHASE_20_WORKSPACE_MIGRATION_PRIORITY = [
  "KitchenTask",
  "KitchenTaskTemplate",
  "LabelTemplate",
  "LabelVerificationEvent",
  "LaborRate",
  "LifecycleEmail",
  "LifecycleEvent",
  "Location",
  "LocationAssignmentEvent",
  "LoyaltyAccount",
] as const;

export const PHASE_21_WORKSPACE_MIGRATION_PRIORITY = [
  "LoyaltyProgram",
  "MarginRule",
  "MealPlan",
  "MealPlanTemplate",
  "MenuChannelPublish",
  "MenuRotationRule",
  "MenuTemplate",
  "NotificationEvent",
  "NotificationPreference",
  "NotificationTemplate",
] as const;

export const PHASE_22_WORKSPACE_MIGRATION_PRIORITY = [
  "NutritionProfile",
  "OnboardingCall",
  "OperationsAudit",
  "OperationsChecklist",
  "OrderChannel",
  "OrganizationMember",
  "PackagingItem",
  "PackingBatch",
  "PackingEvent",
  "PackingScanEvent",
] as const;

/** Phases 23–29 — final 70 user-scoped models (see migration 20260524300000). */
export const PHASES_23_29_WORKSPACE_MIGRATION_PRIORITY = [
  "PackingTask",
  "PackingVerificationSession",
  "PackingWave",
  "PartnerMember",
  "PickupWindow",
  "PlatformUserRole",
  "Playbook",
  "PlaybookEvent",
  "PlaybookRun",
  "PnlSnapshot",
  "POSAuditEvent",
  "POSHeldOrder",
  "PosInventoryImpactEvent",
  "PosTab",
  "PriceScenario",
  "PrintedLabel",
  "ProductionBatch",
  "ProductionPlanTask",
  "ProductionStagePreset",
  "ProductionStation",
  "ProductionTemplate",
  "ProductionWorkItem",
  "ProductMappingEvent",
  "ProductMappingImportBatch",
  "PurchaseOrder",
  "ReferralCode",
  "ReorderQueueItem",
  "RestaurantTable",
  "SavedReport",
  "SOPAcknowledgement",
  "SOPDocument",
  "StaffAvailability",
  "StaffCertification",
  "StaffEvent",
  "StaffMember",
  "StaffRole",
  "StaffShift",
  "StorefrontAsset",
  "StorefrontCampaign",
  "StorefrontDomain",
  "StorefrontGiftCard",
  "StorefrontInventoryItem",
  "StorefrontLoyaltyProgram",
  "StorefrontMenuSchedule",
  "StorefrontOrder",
  "StorefrontPage",
  "StorefrontReservation",
  "StorefrontTheme",
  "StorefrontUpsellRule",
  "StorefrontWaitlistEntry",
  "SupplierInvoice",
  "TemperatureLog",
  "TemplateApplication",
  "TemplateApplicationEvent",
  "TimeEntry",
  "TrainingAssignment",
  "TrainingCertification",
  "TrainingEvent",
  "TrainingIncidentDrill",
  "TrainingProgram",
  "TrainingProgress",
  "TrainingQuizAttempt",
  "TrainingSimulation",
  "TrainingSimulationRun",
  "TrialState",
  "UsageCounter",
  "UserTourState",
  "WasteEvent",
  "WebhookProcessingJob",
  "WorkspaceProductCategory",
] as const;

/** @deprecated Use PHASE_12–14 lists */
export const PILOT_WORKSPACE_MIGRATION_PRIORITY = PHASE_12_WORKSPACE_MIGRATION_PRIORITY;

export type PilotWorkspaceMigrationModel =
  | (typeof PHASE_12_WORKSPACE_MIGRATION_PRIORITY)[number]
  | (typeof PHASE_13_WORKSPACE_MIGRATION_PRIORITY)[number]
  | (typeof PHASE_14_WORKSPACE_MIGRATION_PRIORITY)[number]
  | (typeof PHASE_15_WORKSPACE_MIGRATION_PRIORITY)[number]
  | (typeof PHASE_16_WORKSPACE_MIGRATION_PRIORITY)[number]
  | (typeof PHASE_17_WORKSPACE_MIGRATION_PRIORITY)[number]
  | (typeof PHASE_18_WORKSPACE_MIGRATION_PRIORITY)[number]
  | (typeof PHASE_19_WORKSPACE_MIGRATION_PRIORITY)[number]
  | (typeof PHASE_20_WORKSPACE_MIGRATION_PRIORITY)[number]
  | (typeof PHASE_21_WORKSPACE_MIGRATION_PRIORITY)[number]
  | (typeof PHASE_22_WORKSPACE_MIGRATION_PRIORITY)[number]
  | (typeof PHASES_23_29_WORKSPACE_MIGRATION_PRIORITY)[number];
