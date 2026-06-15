import type {
  StaffEmploymentType,
  StaffRoleType,
  StaffStatus,
} from "@prisma/client";

export const STAFF_ROLE_TYPES: StaffRoleType[] = [
  "OWNER",
  "MANAGER",
  "KITCHEN_LEAD",
  "PREP_COOK",
  "LINE_COOK",
  "PACKER",
  "DRIVER",
  "CUSTOMER_SERVICE",
  "CATERING_COORDINATOR",
  "PURCHASING",
  "INVENTORY",
  "ACCOUNTING",
  "MARKETING",
  "VIEWER",
  "CUSTOM",
];

export const STAFF_STATUSES: StaffStatus[] = [
  "ACTIVE",
  "INVITED",
  "TRAINING",
  "PAUSED",
  "INACTIVE",
  "ARCHIVED",
];

export const STAFF_EMPLOYMENT_TYPES: StaffEmploymentType[] = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACTOR",
  "TEMPORARY",
  "SEASONAL",
  "VOLUNTEER",
  "CUSTOM",
];

export const STAFF_ROLE_LABEL: Record<StaffRoleType, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  KITCHEN_LEAD: "Kitchen lead",
  PREP_COOK: "Prep cook",
  LINE_COOK: "Line cook",
  PACKER: "Packer",
  DRIVER: "Driver",
  CUSTOMER_SERVICE: "Customer service",
  CATERING_COORDINATOR: "Catering coordinator",
  PURCHASING: "Purchasing",
  INVENTORY: "Inventory",
  ACCOUNTING: "Accounting",
  MARKETING: "Marketing",
  VIEWER: "Viewer",
  CUSTOM: "Custom",
};

export const STAFF_STATUS_LABEL: Record<StaffStatus, string> = {
  ACTIVE: "Active",
  INVITED: "Invited",
  TRAINING: "Training",
  PAUSED: "Paused",
  INACTIVE: "Inactive",
  ARCHIVED: "Archived",
};

export const STAFF_EMPLOYMENT_LABEL: Record<StaffEmploymentType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACTOR: "Contractor",
  TEMPORARY: "Temporary",
  SEASONAL: "Seasonal",
  VOLUNTEER: "Volunteer",
  CUSTOM: "Custom",
};
