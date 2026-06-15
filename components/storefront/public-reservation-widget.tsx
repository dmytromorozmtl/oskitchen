"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AvailabilitySlot = {
  reservedAt: string;
  label: string;
  available: boolean;
  reason?: string;
};

function tomorrowIso(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function PublicReservationWidget({ storeSlug, storeName }: { storeSlug: string; storeName: string }) {
  const [date, setDate] = useState(tomorrowIso());
  const [partySize, setPartySize] = useState(2);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [pending, startTransition] = useTransition();

  const availableSlots = useMemo(() => slots.filter((s) => s.available), [slots]);

  useEffect(() => {
    let cancelled = false;
    setLoadingSlots(true);
    setSelectedSlot(null);
    void (async () => {
      try {
        const params = new URLSearchParams({
          storeSlug,
          date,
          partySize: String(partySize),
        });
        const res = await fetch(`/api/storefront/reservations?${params.toString()}`);
        const data = (await res.json()) as { slots?: AvailabilitySlot[]; error?: string };
        if (cancelled) return;
        if (!res.ok) {
          setSlots([]);
          setMessage(data.error ?? "Could not load availability.");
          return;
        }
        setSlots(data.slots ?? []);
        setMessage(null);
      } catch {
        if (!cancelled) {
          setSlots([]);
          setMessage("Could not load availability.");
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storeSlug, date, partySize]);

  function onSubmit(formData: FormData) {
    if (!selectedSlot) {
      setMessage("Choose an available time slot.");
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const res = await fetch("/api/storefront/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeSlug,
          guestName: String(formData.get("guestName") ?? ""),
          guestEmail: String(formData.get("guestEmail") ?? "") || undefined,
          guestPhone: String(formData.get("guestPhone") ?? "") || undefined,
          partySize,
          reservedAt: selectedSlot,
          notes: String(formData.get("notes") ?? "") || undefined,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setMessage(data.error ?? "Could not complete booking.");
        return;
      }
      setMessage("Reservation request received — the team will confirm shortly.");
      setSelectedSlot(null);
    });
  }

  return (
    <div className="space-y-6 rounded-2xl border border-border/80 bg-card p-6 shadow-sm" data-testid="public-reservation-widget">
      <div>
        <h2 className="text-xl font-semibold">Book a table at {storeName}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a date, choose an open time, and we will hold your table pending confirmation.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="reservation-date">Date</Label>
          <Input
            id="reservation-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reservation-party">Party size</Label>
          <Input
            id="reservation-party"
            type="number"
            min={1}
            max={12}
            value={partySize}
            onChange={(e) => setPartySize(Number(e.target.value) || 2)}
            required
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Available times</Label>
        {loadingSlots ? (
          <p className="text-sm text-muted-foreground">Loading availability…</p>
        ) : availableSlots.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open slots for this date.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {availableSlots.map((slot) => (
              <Button
                key={slot.reservedAt}
                type="button"
                size="sm"
                variant={selectedSlot === slot.reservedAt ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setSelectedSlot(slot.reservedAt)}
              >
                {slot.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      <form action={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="guestName">Name</Label>
            <Input id="guestName" name="guestName" required className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guestEmail">Email</Label>
            <Input id="guestEmail" name="guestEmail" type="email" className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guestPhone">Phone</Label>
            <Input id="guestPhone" name="guestPhone" className="rounded-xl" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Special requests</Label>
          <Input id="notes" name="notes" placeholder="Allergies, high chair, patio…" className="rounded-xl" />
        </div>
        <Button type="submit" disabled={pending || !selectedSlot} className="rounded-full">
          Request reservation
        </Button>
      </form>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
