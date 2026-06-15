import { submitSupportTicketFormAction } from "@/actions/external";
import { FormShell } from "@/components/marketing/public-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const metadata = { title: "Contact support" };

export default function SupportContactPage() {
  return (
    <FormShell title="Contact support" description="Create a support ticket. If email sending is not configured, the ticket is still stored for review.">
      <form action={submitSupportTicketFormAction} className="grid gap-4">
        <input name="company_hp" className="hidden" tabIndex={-1} autoComplete="off" />
        <Input name="email" type="email" placeholder="Email" required />
        <Input name="subject" placeholder="Subject" required />
        <select name="category" className="rounded-md border bg-background px-3 py-2 text-sm">
          <option value="TECHNICAL">Technical</option>
          <option value="INTEGRATION">Integration</option>
          <option value="ONBOARDING">Onboarding</option>
          <option value="BILLING">Billing</option>
          <option value="BUG">Bug</option>
          <option value="OTHER">Other</option>
        </select>
        <Textarea name="message" placeholder="What happened? Include route, browser, and steps if relevant." required />
        <Button type="submit">Create ticket</Button>
      </form>
    </FormShell>
  );
}
