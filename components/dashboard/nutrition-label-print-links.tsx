import Link from "next/link";

export function NutritionLabelPrintLinks({
  productId,
  productTitle,
}: {
  productId: string;
  productTitle: string;
}) {
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <span className="text-muted-foreground">{productTitle}:</span>
      <Link
        href={`/api/export/nutrition-label?productId=${productId}&format=FDA`}
        className="text-primary underline"
      >
        Print FDA
      </Link>
      <Link
        href={`/api/export/nutrition-label?productId=${productId}&format=EU`}
        className="text-primary underline"
      >
        Print EU
      </Link>
    </div>
  );
}
