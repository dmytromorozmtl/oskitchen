/** RFC 7643/7644 SCIM schema URNs for KitchenOS service provider. */

export const SCIM_CONTENT_TYPE = "application/scim+json";

export const SCIM_USER_SCHEMA =
  "urn:ietf:params:scim:schemas:core:2.0:User" as const;

export const SCIM_GROUP_SCHEMA =
  "urn:ietf:params:scim:schemas:core:2.0:Group" as const;

export const SCIM_LIST_RESPONSE_SCHEMA =
  "urn:ietf:params:scim:api:messages:2.0:ListResponse" as const;

export const SCIM_ERROR_SCHEMA =
  "urn:ietf:params:scim:api:messages:2.0:Error" as const;

export const SCIM_PATCH_OP_SCHEMA =
  "urn:ietf:params:scim:api:messages:2.0:PatchOp" as const;

export const SCIM_WORKSPACE_USER_EXTENSION =
  "urn:kitchenos:params:scim:schemas:extension:workspace:2.0:User" as const;

export const SCIM_SERVICE_PROVIDER_CONFIG_SCHEMA =
  "urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig" as const;

export const SCIM_SCHEMA_DEFINITION_SCHEMA =
  "urn:ietf:params:scim:schemas:core:2.0:Schema" as const;

export const SCIM_RESOURCE_TYPE_SCHEMA =
  "urn:ietf:params:scim:schemas:core:2.0:ResourceType" as const;

/** Roles assignable via SCIM — OWNER is never auto-assigned. */
export const SCIM_ASSIGNABLE_ROLES = ["ADMIN", "STAFF", "PARTNER"] as const;

export type ScimAssignableRole = (typeof SCIM_ASSIGNABLE_ROLES)[number];

export const SCIM_RATE_LIMIT_PER_MINUTE = 60;
