"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MarketplaceSearchBar({
  defaultCategory,
}: {
  defaultCategory?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(defaultCategory ?? "");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category.trim()) params.set("category", category.trim());
    router.push(`/dashboard/marketplace/catalog?${params.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:flex-row sm:items-center"
    >
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products, vendors, or SKUs"
          className="rounded-xl pl-9"
          aria-label="Search marketplace catalog"
        />
      </div>
      <Input
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        placeholder="Category slug (optional)"
        className="rounded-xl sm:w-56"
        aria-label="Filter by category"
      />
      <Button type="submit" className="rounded-full sm:shrink-0">
        Search catalog
      </Button>
    </form>
  );
}
