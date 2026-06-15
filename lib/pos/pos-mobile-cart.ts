export type PosMobileCartLine = {
  key: string;
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
};

export type PosMobileProduct = {
  id: string;
  title: string;
  price: number;
  category: string;
};

export function posMobileCartSubtotal(lines: readonly PosMobileCartLine[]): number {
  return Math.round(lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0) * 100) / 100;
}

export function posMobileProductCategories(products: readonly PosMobileProduct[]): string[] {
  const categories = new Set<string>();
  for (const product of products) {
    categories.add(product.category?.trim() || "Other");
  }
  return ["All", ...Array.from(categories).sort()];
}

export function filterPosMobileProducts(input: {
  products: readonly PosMobileProduct[];
  category: string;
  query: string;
}): PosMobileProduct[] {
  let list = input.products;
  if (input.category !== "All") {
    list = list.filter(
      (product) => (product.category?.trim() || "Other") === input.category,
    );
  }
  const q = input.query.trim().toLowerCase();
  if (!q) return [...list];
  return list.filter((product) => product.title.toLowerCase().includes(q));
}
