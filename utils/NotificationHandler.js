// GLOBAL NOTIFICATIONS LISTENER

import { useEffect, useContext } from "react";
import * as Notifications from "expo-notifications";
import { NotificationContext } from "../context/NotificationContext";

// push notification settings
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  }),
});

export default function NotificationHandler() {
  const { addNotification } = useContext(NotificationContext);

  useEffect(() => {

    // Notification was delivered to the device and the application received the event
    const notificationListener =
      Notifications.addNotificationReceivedListener((notification) => {
        try {
          const title = notification?.request?.content?.title ?? "(no title)";
          const body = notification?.request?.content?.body ?? "(no body)";
          const data = notification?.request?.content?.data ?? {};

          addNotification({
            title,
            body,
            notification_id: data?.notification_id ?? Date.now(),
          });
        } catch (err) {
          console.error("Notification processing failed:", err);
        }
      });

    // user interacted with the notification
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response?.notification?.request?.content?.data ?? {};
        
        console.log("Notification pressed:", data);
      });

    // cleanup: when the component is unmounted, the listeners are removed.
    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [addNotification]);

  return null;
}