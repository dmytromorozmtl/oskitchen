"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { ONBOARDING_COUNTRIES, normalizeOnboardingCountryValue } from "@/lib/onboarding/onboarding-locale-options";
import { cn } from "@/lib/utils";

const inputClass =
  "flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CountrySelect({
  defaultValue = "",
  name = "country",
}: {
  defaultValue?: string;
  name?: string;
}) {
  const initial = normalizeOnboardingCountryValue(defaultValue) || "US";
  const [search, setSearch] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(initial);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedCountry = ONBOARDING_COUNTRIES.find((c) => c.code === selected);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ONBOARDING_COUNTRIES;
    return ONBOARDING_COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    );
  }, [search]);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(code: string) {
    setSelected(code);
    setSearch("");
    setIsOpen(false);
  }

  const displayValue = isOpen ? search : selectedCountry?.name ?? "";

  return (
    <div ref={containerRef} className="relative space-y-2">
      <Label htmlFor="country-search">Country</Label>
      <div className="relative">
        <input
          id="country-search"
          type="search"
          placeholder="Search countries…"
          className={inputClass}
          autoComplete="off"
          required={!selected}
          value={displayValue}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setSearch(selectedCountry?.name ?? "");
            setIsOpen(true);
          }}
        />
        <svg
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {isOpen ? (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border bg-popover shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">No countries found</div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                className={cn(
                  "w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                  c.code === selected && "bg-primary/10 font-medium text-primary",
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(c.code)}
              >
                {c.name}
                <span className="ml-2 text-xs text-muted-foreground">{c.code}</span>
              </button>
            ))
          )}
        </div>
      ) : null}

      <input type="hidden" name={name} value={selected} required />
    </div>
  );
}
