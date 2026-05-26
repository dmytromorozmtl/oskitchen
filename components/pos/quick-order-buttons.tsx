"use client";

import { useState } from "react";

import { posTouchButtonClass } from "@/lib/pos/touch-targets";

export type QuickOrderItem = {
  id: string;
  name: string;
  price: number;
  icon: string;
  category: string;
};

const DEFAULT_QUICK_ITEMS: QuickOrderItem[] = [
  { id: "espresso", name: "Espresso", price: 3, icon: "☕", category: "cafe" },
  { id: "latte", name: "Latte", price: 4.5, icon: "☕", category: "cafe" },
  { id: "cappuccino", name: "Cappuccino", price: 4.5, icon: "☕", category: "cafe" },
  { id: "americano", name: "Americano", price: 3.5, icon: "☕", category: "cafe" },
  { id: "tea", name: "Tea", price: 2.5, icon: "🫖", category: "cafe" },
  { id: "croissant", name: "Croissant", price: 4, icon: "🥐", category: "cafe" },
  { id: "muffin", name: "Muffin", price: 3.5, icon: "🧁", category: "cafe" },
  { id: "beer-draft", name: "Draft Beer", price: 6, icon: "🍺", category: "bar" },
  { id: "beer-bottle", name: "Bottle Beer", price: 7, icon: "🍺", category: "bar" },
  { id: "wine-glass", name: "Wine Glass", price: 9, icon: "🍷", category: "bar" },
  { id: "wine-bottle", name: "Wine Bottle", price: 35, icon: "🍷", category: "bar" },
  { id: "cocktail", name: "Cocktail", price: 12, icon: "🍸", category: "bar" },
  { id: "shot", name: "Shot", price: 8, icon: "🥃", category: "bar" },
  { id: "water", name: "Water", price: 0, icon: "💧", category: "bar" },
  { id: "burger", name: "Burger", price: 12, icon: "🍔", category: "fast-food" },
  { id: "fries", name: "Fries", price: 5, icon: "🍟", category: "fast-food" },
  { id: "pizza-slice", name: "Pizza Slice", price: 6, icon: "🍕", category: "fast-food" },
  { id: "soda", name: "Soda", price: 2.5, icon: "🥤", category: "fast-food" },
];

const categoryMap: Record<string, string[]> = {
  RESTAURANT: ["fast-food"],
  CAFE: ["cafe"],
  BAR: ["bar"],
  GHOST_KITCHEN: ["fast-food"],
  CLOUD_KITCHEN: ["fast-food"],
  OTHER: ["fast-food"],
};

export function QuickOrderButtons({
  businessType,
  onItemClick,
}: {
  businessType: string;
  onItemClick: (item: QuickOrderItem) => void;
}) {
  const [addedId, setAddedId] = useState<string | null>(null);
  const allowed = categoryMap[businessType] ?? ["fast-food"];
  const items = DEFAULT_QUICK_ITEMS.filter((item) => allowed.includes(item.category));

  function handleClick(item: QuickOrderItem) {
    onItemClick(item);
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1200);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Quick order</h3>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleClick(item)}
            className={`flex ${posTouchButtonClass} flex-col items-center justify-center rounded-xl border p-3 text-center transition-all hover:bg-muted active:scale-95 ${
              addedId === item.id
                ? "bg-emerald-100 border-emerald-300 scale-105"
                : "bg-card hover:shadow-sm"
            }`}
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-[11px] font-medium leading-tight">{item.name}</span>
            <span className="text-[11px] text-muted-foreground">
              {item.price === 0 ? "Free" : `$${item.price.toFixed(2)}`}
            </span>
            {addedId === item.id ? (
              <span className="text-[10px] text-emerald-600 font-medium mt-0.5">Added ✓</span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
