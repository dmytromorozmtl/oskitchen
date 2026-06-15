"use client";

import { getActionError } from "@/lib/action-result";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createHolidayPackageAction } from "@/actions/marketing/holiday-packages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function HolidayPackageForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createHolidayPackageAction(fd);
      if (!result.ok) {
        toast.error(getActionError(result) ?? "Something went wrong");
        return;
      }
      toast.success("Holiday package created");
      e.currentTarget.reset();
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg space-y-4 rounded-xl border border-border/80 bg-card p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold tracking-tight">Create holiday package</h3>
      <div className="space-y-2">
        <Label htmlFor="hp-name">Package name</Label>
        <Input
          id="hp-name"
          name="name"
          required
          placeholder="Christmas family bundle"
          className="rounded-xl"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hp-price">Price</Label>
          <Input
            id="hp-price"
            name="price"
            type="number"
            min={0}
            step="0.01"
            required
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hp-max">Max orders</Label>
          <Input
            id="hp-max"
            name="maxOrders"
            type="number"
            min={1}
            required
            defaultValue={50}
            className="rounded-xl"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hp-start">Start date</Label>
          <Input id="hp-start" name="startDate" type="date" required className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hp-end">End date</Label>
          <Input id="hp-end" name="endDate" type="date" required className="rounded-xl" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="hp-desc">Description</Label>
        <Textarea
          id="hp-desc"
          name="description"
          rows={3}
          placeholder="What's included in this bundle…"
          className="rounded-xl"
        />
      </div>
      <Button type="submit" disabled={pending} className="w-full rounded-xl">
        {pending ? "Creating…" : "Create package"}
      </Button>
    </form>
  );
}
