import { P2SettingsPage } from "@/lib/dashboard/p2-settings-page";
import { isWhatsAppConfigured } from "@/services/notifications/whatsapp-service";

export default function WhatsAppSettingsPage() {
  return (
    <P2SettingsPage
      title="WhatsApp Business"
      description="WhatsApp Cloud API for order and delivery updates."
      configured={isWhatsAppConfigured()}
      envKeys={[
        "WHATSAPP_BUSINESS_ACCOUNT_ID",
        "WHATSAPP_ACCESS_TOKEN",
        "WHATSAPP_PHONE_NUMBER_ID",
      ]}
    />
  );
}
