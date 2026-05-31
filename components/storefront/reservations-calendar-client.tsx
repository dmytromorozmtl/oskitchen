"use client";

import { useMemo, useState, useTransition } from "react";

import {
  addWaitlistEntryAction,
  createReservationAction,
  getReservationAvailabilityAction,
  rescheduleReservationAction,
  updateReservationStatusAction,
  updateWaitlistStatusAction,
} from "@/actions/storefront-reservations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ReservationRow = {
  id: string;
  guestName: string;
  guestEmail: string | null;
  partySize: number;
  reservedAt: string;
  durationMinutes: number;
  status: string;
  notes: string | null;
};

export type WaitlistRow = {
  id: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  quotedMinutes: number;
  status: string;
  createdAt: string;
};

const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "SEATED", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;

type AvailabilitySlot = {
  reservedAt: string;
  label: string;
  available: boolean;
  reason?: string;
};

export function ReservationsCalendarClient(props: {
  reservations: ReservationRow[];
  waitlist: WaitlistRow[];
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [availabilityDate, setAvailabilityDate] = useState("");
  const [availabilityParty, setAvailabilityParty] = useState(2);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [pending, startTransition] = useTransition();

  const grouped = useMemo(() => {
    const map = new Map<string, ReservationRow[]>();
    for (const r of props.reservations) {
      const day = r.reservedAt.slice(0, 10);
      const list = map.get(day) ?? [];
      list.push(r);
      map.set(day, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [props.reservations]);

  function loadAvailability(date: string, partySize: number) {
    if (!date) return;
    startTransition(async () => {
      const res = await getReservationAvailabilityAction({ date, partySize });
      if (res.ok) {
        setAvailabilitySlots(res.availability.slots);
      } else {
        setAvailabilitySlots([]);
        setMessage(res.error);
      }
    });
  }

  function onCreate(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const date = String(formData.get("date") ?? "");
      const time = String(formData.get("time") ?? "18:00");
      const reservedAt = new Date(`${date}T${time}:00`).toISOString();
      const res = await createReservationAction({
        guestName: String(formData.get("guestName") ?? ""),
        guestEmail: String(formData.get("guestEmail") ?? "") || undefined,
        guestPhone: String(formData.get("guestPhone") ?? "") || undefined,
        partySize: Number(formData.get("partySize") ?? 2),
        reservedAt,
        notes: String(formData.get("notes") ?? "") || undefined,
      });
      setMessage(res.ok ? "Reservation created." : res.error);
    });
  }

  function onWaitlist(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const res = await addWaitlistEntryAction({
        customerName: String(formData.get("customerName") ?? ""),
        customerPhone: String(formData.get("customerPhone") ?? ""),
        partySize: Number(formData.get("waitPartySize") ?? 2),
      });
      setMessage(res.ok ? "Added to waitlist." : res.error);
    });
  }

  return (
    <div className="space-y-8">
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New reservation</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={onCreate} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="guestName">Guest name</Label>
                  <Input id="guestName" name="guestName" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="partySize">Party size</Label>
                  <Input
                    id="partySize"
                    name="partySize"
                    type="number"
                    min={1}
                    defaultValue={2}
                    required
                    onChange={(e) => {
                      const next = Number(e.target.value) || 2;
                      setAvailabilityParty(next);
                      if (availabilityDate) loadAvailability(availabilityDate, next);
                    }}
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    required
                    onChange={(e) => {
                      setAvailabilityDate(e.target.value);
                      loadAvailability(e.target.value, availabilityParty);
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" name="time" type="time" defaultValue="18:00" required />
                </div>
              </div>
              {availabilityDate ? (
                <div className="space-y-2 rounded-xl border p-3">
                  <p className="text-xs font-medium text-muted-foreground">Availability preview</p>
                  <div className="flex flex-wrap gap-2">
                    {availabilitySlots.length === 0 ? (
                      <span className="text-xs text-muted-foreground">No slots for this date.</span>
                    ) : (
                      availabilitySlots.map((slot) => (
                        <span
                          key={slot.reservedAt}
                          className={`rounded-full px-2 py-1 text-xs ${
                            slot.available
                              ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
                              : "bg-muted text-muted-foreground line-through"
                          }`}
                        >
                          {slot.label}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="guestEmail">Email</Label>
                  <Input id="guestEmail" name="guestEmail" type="email" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="guestPhone">Phone</Label>
                  <Input id="guestPhone" name="guestPhone" />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" name="notes" />
              </div>
              <Button type="submit" disabled={pending} className="rounded-full">
                Book table
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Waitlist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={onWaitlist} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="customerName">Name</Label>
                <Input id="customerName" name="customerName" required />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input id="customerPhone" name="customerPhone" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="waitPartySize">Party</Label>
                  <Input id="waitPartySize" name="waitPartySize" type="number" min={1} defaultValue={2} />
                </div>
              </div>
              <Button type="submit" disabled={pending} variant="secondary" className="rounded-full">
                Add to waitlist
              </Button>
            </form>
            <ul className="space-y-2">
              {props.waitlist.map((w) => (
                <li key={w.id} className="flex items-center justify-between rounded-xl border p-3 text-sm">
                  <span>
                    {w.customerName} · {w.partySize} · ~{w.quotedMinutes}m
                  </span>
                  <select
                    className="rounded-md border bg-background px-2 py-1 text-xs"
                    defaultValue={w.status}
                    onChange={(e) => {
                      startTransition(async () => {
                        await updateWaitlistStatusAction({
                          entryId: w.id,
                          status: e.target.value as "WAITING" | "NOTIFIED" | "SEATED" | "CANCELLED",
                        });
                      });
                    }}
                  >
                    <option value="WAITING">Waiting</option>
                    <option value="NOTIFIED">Notified</option>
                    <option value="SEATED">Seated</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Calendar</h2>
        {grouped.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reservations yet.</p>
        ) : (
          grouped.map(([day, rows]) => (
            <Card key={day}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{day}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {rows.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{r.guestName}</p>
                      <p className="text-muted-foreground">
                        {new Date(r.reservedAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        · Party {r.partySize} · {r.durationMinutes}m · {r.status}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <select
                        className="rounded-md border bg-background px-2 py-1 text-xs"
                        defaultValue={r.status}
                        onChange={(e) => {
                          startTransition(async () => {
                            const res = await updateReservationStatusAction({
                              reservationId: r.id,
                              status: e.target.value as (typeof STATUS_OPTIONS)[number],
                            });
                            if (!res.ok) setMessage(res.error);
                          });
                        }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <Input
                        type="datetime-local"
                        className="h-8 w-44 text-xs"
                        defaultValue={r.reservedAt.slice(0, 16)}
                        onBlur={(e) => {
                          if (!e.target.value) return;
                          startTransition(async () => {
                            const res = await rescheduleReservationAction({
                              reservationId: r.id,
                              reservedAt: new Date(e.target.value).toISOString(),
                            });
                            if (!res.ok) setMessage(res.error);
                          });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

