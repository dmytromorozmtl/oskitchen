import { CollectionCatalogClient, type CollectionProductRow } from "@/components/storefront/collection-catalog-client";

const MOCK: CollectionProductRow[] = [
  {
    id: "1",
    title: "Sourdough loaf",
    description: "Naturally leavened, baked daily.",
    price: 8.5,
    sortOrder: 0,
    allergens: "vegan",
    productHref: "#",
  },
  {
    id: "2",
    title: "Almond croissant",
    description: "Butter layers, almond cream.",
    price: 4.25,
    sortOrder: 1,
    allergens: "gluten, nuts",
    productHref: "#",
  },
];

export default function VisualTestCollectionPreviewPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6" data-testid="visual-collection-preview">
      <div className="aspect-[21/9] rounded-2xl bg-gradient-to-br from-muted to-muted/40" data-testid="collection-hero" />
      <header>
        <h1 className="text-3xl font-semibold">Weekly specials</h1>
        <p className="mt-2 text-muted-foreground">Filter and sort collection merchandising controls.</p>
      </header>
      <CollectionCatalogClient products={MOCK} currency="USD" />
    </div>
  );
}
