import { prisma } from "@/lib/prisma";
import type { reviewsSectionSchema } from "@/lib/storefront/section-schemas/builder-sections";
import type { z } from "zod";

type Content = z.infer<typeof reviewsSectionSchema>;

export async function ReviewsSection({
  storefrontId,
  content,
}: {
  storefrontId: string;
  content: Content;
}) {
  const minRating = content.minRating ?? 4;
  const maxItems = content.maxItems ?? 6;

  const reviews = await prisma.storefrontReview.findMany({
    where: {
      storefrontId,
      published: true,
      rating: { gte: minRating },
    },
    orderBy: { createdAt: "desc" },
    take: maxItems,
    select: { rating: true, title: true, body: true, createdAt: true },
  });

  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Published reviews from guests will appear here once you enable them in the admin.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">{content.heading?.trim() || "Reviews"}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {reviews.map((r, i) => (
          <article
            key={i}
            className="sf-card rounded-2xl p-5 dark:bg-gray-900/80"
          >
            <div className="flex gap-0.5 text-amber-500" aria-label={`${r.rating} stars`}>
              {Array.from({ length: 5 }).map((_, j) => (
                <span key={j} className={j < r.rating ? "opacity-100" : "opacity-25"}>
                  ★
                </span>
              ))}
            </div>
            {r.title ? <p className="mt-3 font-medium">{r.title}</p> : null}
            {r.body ? <p className="mt-2 text-sm text-muted-foreground">{r.body}</p> : null}
          </article>
        ))}
      </div>
    </div>
  );
}
