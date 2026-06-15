export type GlobalSearchEntityKind =
  | "order"
  | "product"
  | "customer"
  | "task"
  | "support_ticket"
  | "brand"
  | "location"
  | "route"
  | "integration";

export type GlobalSearchHit = {
  kind: GlobalSearchEntityKind;
  id: string;
  title: string;
  subtitle: string | null;
  href: string;
};

export type GlobalSearchResponse = {
  hits: GlobalSearchHit[];
  truncated: boolean;
};
