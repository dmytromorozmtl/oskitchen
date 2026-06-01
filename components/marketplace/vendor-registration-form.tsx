"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { submitMarketplaceVendorRegistrationAction } from "@/actions/marketplace/vendor-registration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VENDOR_TYPE_OPTIONS } from "@/lib/marketplace/vendor-registration-types";
import type { VendorType } from "@prisma/client";

type DocumentDraft = { fileName: string; fileUrl: string };

export function VendorRegistrationForm() {
  const [pending, startTransition] = useTransition();
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [type, setType] = useState<VendorType>("DISTRIBUTOR");
  const [documents, setDocuments] = useState<DocumentDraft[]>([
    { fileName: "", fileUrl: "" },
  ]);

  if (vendorId) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
        <p className="font-medium text-emerald-900 dark:text-emerald-100">Application submitted</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Your vendor profile is pending verification. Platform ops typically reviews within 2–3 business
          days.
        </p>
        <Button asChild className="mt-4 rounded-full">
          <Link href="/vendor/register/status">View verification status</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      className="space-y-6 rounded-2xl border border-border/80 bg-card/80 p-6 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(async () => {
          const result = await submitMarketplaceVendorRegistrationAction({
            companyName: String(data.get("companyName") ?? ""),
            legalName: String(data.get("legalName") ?? ""),
            type,
            country: String(data.get("country") ?? ""),
            contactEmail: String(data.get("contactEmail") ?? ""),
            contactPhone: String(data.get("contactPhone") ?? "") || null,
            website: String(data.get("website") ?? "") || null,
            documents: documents
              .filter((doc) => doc.fileName.trim())
              .map((doc) => ({
                fileName: doc.fileName.trim(),
                fileUrl: doc.fileUrl.trim() || null,
              })),
          });
          if (result.ok) {
            setVendorId(result.vendorId);
            toast.success("Vendor application submitted");
          } else {
            toast.error(result.error);
          }
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="companyName">Company name</Label>
          <Input id="companyName" name="companyName" required placeholder="FreshPack Supply Co." />
        </div>
        <div>
          <Label htmlFor="legalName">Legal name</Label>
          <Input id="legalName" name="legalName" required placeholder="FreshPack Supply LLC" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Vendor type</Label>
          <Select value={type} onValueChange={(value) => setType(value as VendorType)}>
            <SelectTrigger className="rounded-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VENDOR_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" required placeholder="United States" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="contactEmail">Contact email</Label>
          <Input id="contactEmail" name="contactEmail" type="email" required />
        </div>
        <div>
          <Label htmlFor="contactPhone">Contact phone</Label>
          <Input id="contactPhone" name="contactPhone" type="tel" placeholder="+1 …" />
        </div>
      </div>

      <div>
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" type="url" placeholder="https://…" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Compliance documents</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setDocuments((prev) => [...prev, { fileName: "", fileUrl: "" }])}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add document
          </Button>
        </div>
        {documents.map((doc, index) => (
          <div key={index} className="grid gap-2 rounded-xl border border-border/70 p-3 sm:grid-cols-[1fr_1fr_auto]">
            <Input
              placeholder="File name (W-9, insurance.pdf)"
              value={doc.fileName}
              onChange={(event) =>
                setDocuments((prev) =>
                  prev.map((entry, i) =>
                    i === index ? { ...entry, fileName: event.target.value } : entry,
                  ),
                )
              }
            />
            <Input
              placeholder="Document URL"
              value={doc.fileUrl}
              onChange={(event) =>
                setDocuments((prev) =>
                  prev.map((entry, i) =>
                    i === index ? { ...entry, fileUrl: event.target.value } : entry,
                  ),
                )
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={documents.length === 1}
              onClick={() => setDocuments((prev) => prev.filter((_, i) => i !== index))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <p className="text-xs text-muted-foreground">
          Upload files to your storage and paste secure URLs, or attach links from your document vault.
        </p>
      </div>

      <Button type="submit" disabled={pending} className="rounded-full">
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : (
          "Submit for verification"
        )}
      </Button>
    </form>
  );
}
