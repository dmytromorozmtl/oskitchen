import { submitAdvisoryBoardApplicationFormAction } from "@/actions/scale";
import { FormShell } from "@/components/marketing/public-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const metadata = { title: "Customer Advisory Board" };

export default function AdvisoryBoardPage() {
  return (
    <FormShell title="Customer Advisory Board" description="Apply to join a small operator group shaping KitchenOS. This is a feedback program, not a paid customer claim.">
      <form action={submitAdvisoryBoardApplicationFormAction} className="grid gap-4">
        <input name="company_hp" className="hidden" tabIndex={-1} />
        <Input name="fullName" placeholder="Full name" required />
        <Input name="email" type="email" placeholder="Email" required />
        <Input name="businessName" placeholder="Business name" required />
        <Input name="businessType" placeholder="Business type" />
        <Input name="website" placeholder="Website" />
        <Input name="weeklyOrderVolume" placeholder="Weekly order volume" />
        <Textarea name="whyInterested" placeholder="Why do you want to join?" />
        <Button type="submit">Apply</Button>
      </form>
    </FormShell>
  );
}
