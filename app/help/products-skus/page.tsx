export default function HelpProductsSkusPage() {
  return (
    <article className="space-y-4 text-sm leading-relaxed text-muted-foreground">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Fixing unmatched products
      </h1>
      <p>
        When WooCommerce or Shopify sends SKUs your weekly menu does not recognize, KitchenOS keeps
        the external row linked but may skip automatic production mapping until you align titles or
        external product IDs.
      </p>
      <p>
        Workflow: confirm the active menu, reconcile external product imports, then re-run channel
        sync tools from each integration card.
      </p>
    </article>
  );
}
