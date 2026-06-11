import { PushSubscribeButton } from "@/components/dashboard/push-subscribe-button";
import { P2SettingsPage } from "@/lib/dashboard/p2-settings-page";
import { isWebPushConfigured } from "@/services/notifications/push-service";

export default function PushNotificationsSettingsPage() {
  return (
    <div className="space-y-6">
      <P2SettingsPage
        title="Web Push (PWA)"
        description="Browser push via service worker and VAPID keys."
        configured={isWebPushConfigured()}
        envKeys={["VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY", "VAPID_SUBJECT"]}
      />
      <PushSubscribeButton />
    </div>
  );
}
