import type { ImportType } from "@prisma/client";

import type { ImportIssue } from "@/lib/import-center/import-types";

export type ValidatorResult = {
  normalized: Record<string, unknown> | null;
  errors: ImportIssue[];
  warnings: ImportIssue[];
};

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function looksLikeNumber(value: string): boolean {
  if (!value) return false;
  return Number.isFinite(Number(value.replace(/[$,]/g, "")));
}

function looksLikeDate(value: string): boolean {
  return value.length > 0 && !Number.isNaN(Date.parse(value));
}

function normalisePhone(value: string): string {
  return value.replace(/[^\d+]/g, "");
}

const FULFILLMENT_TYPES = new Set(["PICKUP", "DELIVERY", "SHIPPING", "DINE_IN", "CATERING"]);

const ALLERGEN_NAMES = new Set([
  "milk", "wheat", "gluten", "soy", "egg", "eggs", "peanut", "peanuts",
  "tree nut", "tree nuts", "nuts", "almond", "almonds", "cashew", "cashews",
  "walnut", "walnuts", "sesame", "fish", "shellfish", "shrimp", "crab",
  "lobster", "sulphite", "sulphites", "sulfite", "sulfites", "mustard",
]);

function validProducts(row: Record<string, string>): ValidatorResult {
  const errors: ImportIssue[] = [];
  const warnings: ImportIssue[] = [];
  const title = (row.title ?? "").trim();
  const price = (row.price ?? "").trim();
  const preparedDate = (row.prepared_date ?? "").trim();
  if (!title) errors.push({ code: "TITLE_REQUIRED", message: "title is required" });
  if (!price) errors.push({ code: "PRICE_REQUIRED", message: "price is required" });
  else if (!looksLikeNumber(price)) errors.push({ code: "PRICE_INVALID", message: "price must be numeric" });
  if (!preparedDate) errors.push({ code: "PREPARED_DATE_REQUIRED", message: "prepared_date is required" });
  else if (!looksLikeDate(preparedDate)) errors.push({ code: "PREPARED_DATE_INVALID", message: "prepared_date must be a valid date" });
  if (row.pickup_date && !looksLikeDate(row.pickup_date)) {
    warnings.push({ code: "PICKUP_DATE_INVALID", message: "pickup_date is not a valid date — will default to prepared_date" });
  }
  if (errors.length) return { normalized: null, errors, warnings };
  return {
    normalized: {
      title,
      sku: row.sku?.trim() || null,
      price: price.replace(/[$,]/g, ""),
      preparedDate,
      pickupDate: row.pickup_date?.trim() || null,
      description: row.description?.trim() || null,
      allergens: row.allergens?.trim() || null,
    },
    errors,
    warnings,
  };
}

function validCustomers(row: Record<string, string>): ValidatorResult {
  const errors: ImportIssue[] = [];
  const warnings: ImportIssue[] = [];
  const email = (row.email ?? "").trim().toLowerCase();
  if (!email) errors.push({ code: "EMAIL_REQUIRED", message: "email is required" });
  else if (!looksLikeEmail(email)) errors.push({ code: "EMAIL_INVALID", message: "email is not a valid email address" });
  if (errors.length) return { normalized: null, errors, warnings };
  return {
    normalized: {
      email,
      name: row.name?.trim() || null,
      phone: row.phone ? normalisePhone(row.phone) : null,
      notes: row.notes?.trim() || null,
    },
    errors,
    warnings,
  };
}

function validOrders(row: Record<string, string>): ValidatorResult {
  const errors: ImportIssue[] = [];
  const warnings: ImportIssue[] = [];
  const orderNumber = (row.order_number ?? "").trim();
  const customerEmail = (row.customer_email ?? "").trim().toLowerCase();
  const fulfillmentDate = (row.fulfillment_date ?? "").trim();
  if (!orderNumber) errors.push({ code: "ORDER_NUMBER_REQUIRED", message: "order_number is required" });
  if (!customerEmail) errors.push({ code: "CUSTOMER_EMAIL_REQUIRED", message: "customer_email is required" });
  else if (!looksLikeEmail(customerEmail)) errors.push({ code: "CUSTOMER_EMAIL_INVALID", message: "customer_email is invalid" });
  if (!fulfillmentDate) errors.push({ code: "FULFILLMENT_DATE_REQUIRED", message: "fulfillment_date is required" });
  else if (!looksLikeDate(fulfillmentDate)) errors.push({ code: "FULFILLMENT_DATE_INVALID", message: "fulfillment_date is invalid" });
  if (row.total && !looksLikeNumber(row.total)) errors.push({ code: "TOTAL_INVALID", message: "total must be numeric" });
  const fulfillmentType = (row.fulfillment_type ?? "").trim().toUpperCase();
  if (fulfillmentType && !FULFILLMENT_TYPES.has(fulfillmentType)) {
    warnings.push({ code: "FULFILLMENT_TYPE_UNKNOWN", message: `fulfillment_type '${fulfillmentType}' is not recognised` });
  }
  if (errors.length) return { normalized: null, errors, warnings };
  return {
    normalized: {
      orderNumber,
      customerEmail,
      customerName: row.customer_name?.trim() || null,
      total: row.total?.replace(/[$,]/g, "") || "0",
      fulfillmentType: fulfillmentType || "PICKUP",
      fulfillmentDate,
      externalItems: row.external_items?.trim() || null,
    },
    errors,
    warnings,
  };
}

function validIngredients(row: Record<string, string>): ValidatorResult {
  const errors: ImportIssue[] = [];
  const warnings: ImportIssue[] = [];
  const name = (row.name ?? "").trim();
  const unit = (row.unit ?? "").trim();
  const cost = (row.cost_per_unit ?? "").trim();
  if (!name) errors.push({ code: "NAME_REQUIRED", message: "name is required" });
  if (!unit) errors.push({ code: "UNIT_REQUIRED", message: "unit is required" });
  if (!cost) errors.push({ code: "COST_REQUIRED", message: "cost_per_unit is required" });
  else if (!looksLikeNumber(cost)) errors.push({ code: "COST_INVALID", message: "cost_per_unit must be numeric" });
  if (row.current_stock && !looksLikeNumber(row.current_stock)) errors.push({ code: "STOCK_INVALID", message: "current_stock must be numeric" });
  if (row.par_level && !looksLikeNumber(row.par_level)) errors.push({ code: "PAR_INVALID", message: "par_level must be numeric" });
  if (errors.length) return { normalized: null, errors, warnings };
  return {
    normalized: {
      name,
      unit,
      costPerUnit: cost.replace(/[$,]/g, ""),
      currentStock: row.current_stock?.replace(/[$,]/g, "") || "0",
      parLevel: row.par_level?.replace(/[$,]/g, "") || "0",
      supplier: row.supplier?.trim() || null,
    },
    errors,
    warnings,
  };
}

function validRecipes(row: Record<string, string>): ValidatorResult {
  const errors: ImportIssue[] = [];
  const warnings: ImportIssue[] = [];
  const recipeName = (row.recipe_name ?? "").trim();
  const productTitle = (row.product_title ?? "").trim();
  if (!recipeName) errors.push({ code: "RECIPE_NAME_REQUIRED", message: "recipe_name is required" });
  if (!productTitle) errors.push({ code: "PRODUCT_TITLE_REQUIRED", message: "product_title is required" });
  if (row.quantity && !looksLikeNumber(row.quantity)) errors.push({ code: "QUANTITY_INVALID", message: "quantity must be numeric" });
  if (row.yield_quantity && !looksLikeNumber(row.yield_quantity)) errors.push({ code: "YIELD_INVALID", message: "yield_quantity must be numeric" });
  if (errors.length) return { normalized: null, errors, warnings };
  return {
    normalized: {
      recipeName,
      productTitle,
      yieldQuantity: row.yield_quantity || null,
      yieldUnit: row.yield_unit || null,
      ingredientName: row.ingredient_name || null,
      quantity: row.quantity || null,
      unit: row.unit || null,
    },
    errors,
    warnings,
  };
}

function validStaff(row: Record<string, string>): ValidatorResult {
  const errors: ImportIssue[] = [];
  const warnings: ImportIssue[] = [];
  const name = (row.name ?? "").trim();
  if (!name) errors.push({ code: "NAME_REQUIRED", message: "name is required" });
  if (row.email && !looksLikeEmail(row.email)) errors.push({ code: "EMAIL_INVALID", message: "email is invalid" });
  if (errors.length) return { normalized: null, errors, warnings };
  return {
    normalized: {
      name,
      email: row.email?.trim().toLowerCase() || null,
      role: row.role?.trim() || "staff",
    },
    errors,
    warnings,
  };
}

function validSuppliers(row: Record<string, string>): ValidatorResult {
  const errors: ImportIssue[] = [];
  const warnings: ImportIssue[] = [];
  const name = (row.supplier_name ?? row.name ?? "").trim();
  if (!name) errors.push({ code: "NAME_REQUIRED", message: "supplier name is required" });
  if (row.email && !looksLikeEmail(row.email)) errors.push({ code: "EMAIL_INVALID", message: "email is invalid" });
  if (errors.length) return { normalized: null, errors, warnings };
  return {
    normalized: {
      name,
      email: row.email?.trim().toLowerCase() || null,
      phone: row.phone ? normalisePhone(row.phone) : null,
    },
    errors,
    warnings,
  };
}

function validBrands(row: Record<string, string>): ValidatorResult {
  const errors: ImportIssue[] = [];
  const warnings: ImportIssue[] = [];
  const name = (row.name ?? "").trim();
  if (!name) errors.push({ code: "NAME_REQUIRED", message: "name is required" });
  if (errors.length) return { normalized: null, errors, warnings };
  return {
    normalized: {
      name,
      slug: row.slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      conceptKind: row.concept_kind?.trim().toUpperCase() || "OTHER",
    },
    errors,
    warnings,
  };
}

function validLocations(row: Record<string, string>): ValidatorResult {
  const errors: ImportIssue[] = [];
  const warnings: ImportIssue[] = [];
  const name = (row.name ?? "").trim();
  if (!name) errors.push({ code: "NAME_REQUIRED", message: "name is required" });
  if (errors.length) return { normalized: null, errors, warnings };
  return {
    normalized: {
      name,
      timezone: row.timezone?.trim() || "UTC",
      slug: row.slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    },
    errors,
    warnings,
  };
}

function validNutrition(row: Record<string, string>): ValidatorResult {
  const errors: ImportIssue[] = [];
  const warnings: ImportIssue[] = [];
  const productId = (row.product_id ?? "").trim();
  if (!productId) errors.push({ code: "PRODUCT_ID_REQUIRED", message: "product_id is required" });
  if (row.calories && !looksLikeNumber(row.calories)) errors.push({ code: "CALORIES_INVALID", message: "calories must be numeric" });
  if (row.protein && !looksLikeNumber(row.protein)) errors.push({ code: "PROTEIN_INVALID", message: "protein must be numeric" });
  const allergens = (row.allergens ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  for (const allergen of allergens) {
    if (!ALLERGEN_NAMES.has(allergen)) {
      warnings.push({ code: "ALLERGEN_UNKNOWN", message: `allergen "${allergen}" is not in the recognised set` });
    }
  }
  if (errors.length) return { normalized: null, errors, warnings };
  return {
    normalized: {
      productId,
      calories: row.calories || null,
      protein: row.protein || null,
      allergens,
    },
    errors,
    warnings,
  };
}

function validProductMappings(row: Record<string, string>): ValidatorResult {
  const errors: ImportIssue[] = [];
  const provider = (row.provider ?? "").trim().toUpperCase();
  const externalId = (row.external_product_id ?? "").trim();
  const externalTitle = (row.external_title ?? "").trim();
  if (!provider) errors.push({ code: "PROVIDER_REQUIRED", message: "provider is required" });
  if (!externalId) errors.push({ code: "EXTERNAL_ID_REQUIRED", message: "external_product_id is required" });
  if (!externalTitle) errors.push({ code: "EXTERNAL_TITLE_REQUIRED", message: "external_title is required" });
  if (errors.length) return { normalized: null, errors, warnings: [] };
  return {
    normalized: { provider, externalProductId: externalId, externalTitle, externalSku: row.external_sku?.trim() || null },
    errors,
    warnings: [],
  };
}

function validMenuAssignments(row: Record<string, string>): ValidatorResult {
  const errors: ImportIssue[] = [];
  const productId = (row.product_id ?? "").trim();
  const menuId = (row.menu_id ?? "").trim();
  if (!productId) errors.push({ code: "PRODUCT_ID_REQUIRED", message: "product_id is required" });
  if (!menuId) errors.push({ code: "MENU_ID_REQUIRED", message: "menu_id is required" });
  if (row.sort_order && !looksLikeNumber(row.sort_order)) errors.push({ code: "SORT_ORDER_INVALID", message: "sort_order must be numeric" });
  if (errors.length) return { normalized: null, errors, warnings: [] };
  const visibleRaw = (row.visible ?? "").trim().toLowerCase();
  return {
    normalized: {
      productId,
      menuId,
      visible: ["1", "yes", "true", "y"].includes(visibleRaw),
      sortOrder: row.sort_order ? Number(row.sort_order) : 0,
    },
    errors,
    warnings: [],
  };
}

function validPurchaseItems(row: Record<string, string>): ValidatorResult {
  const errors: ImportIssue[] = [];
  const ingredientId = (row.ingredient_id ?? "").trim();
  const supplierId = (row.supplier_id ?? "").trim();
  if (!ingredientId) errors.push({ code: "INGREDIENT_ID_REQUIRED", message: "ingredient_id is required" });
  if (!supplierId) errors.push({ code: "SUPPLIER_ID_REQUIRED", message: "supplier_id is required" });
  if (row.pack_size && !looksLikeNumber(row.pack_size)) errors.push({ code: "PACK_SIZE_INVALID", message: "pack_size must be numeric" });
  if (row.pack_price && !looksLikeNumber(row.pack_price)) errors.push({ code: "PACK_PRICE_INVALID", message: "pack_price must be numeric" });
  if (errors.length) return { normalized: null, errors, warnings: [] };
  return {
    normalized: {
      ingredientId,
      supplierId,
      packSize: row.pack_size || null,
      packUnit: row.pack_unit || null,
      packPrice: row.pack_price?.replace(/[$,]/g, "") || null,
    },
    errors,
    warnings: [],
  };
}

const VALIDATORS: Record<ImportType, (row: Record<string, string>) => ValidatorResult> = {
  PRODUCTS: validProducts,
  CUSTOMERS: validCustomers,
  ORDERS: validOrders,
  INGREDIENTS: validIngredients,
  RECIPES: validRecipes,
  STAFF: validStaff,
  SUPPLIERS: validSuppliers,
  BRANDS: validBrands,
  LOCATIONS: validLocations,
  NUTRITION_ALLERGENS: validNutrition,
  PRODUCT_MAPPINGS: validProductMappings,
  MENU_ASSIGNMENTS: validMenuAssignments,
  PURCHASE_ITEMS: validPurchaseItems,
};

export function validateRow(type: ImportType, row: Record<string, string>): ValidatorResult {
  return VALIDATORS[type](row);
}
