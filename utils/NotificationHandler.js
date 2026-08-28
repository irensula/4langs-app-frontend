// GLOBAL NOTIFICATIONS LISTENER

import { useEffect, useRef, useContext } from "react";
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
  const { addNotification, pushEnabled } = useContext(NotificationContext);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    if (!pushEnabled) return;

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notif) => {
        try {
          const body = notif?.request?.content?.body ?? "(no body)";
          const data = notif?.request?.content?.data ?? {};

          addNotification({
            body,
            notification_id: data?.notification_id ?? Date.now(),
          });
        } catch (err) {
          console.error("Notification processing failed:", err);
        }
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((resp) => {
        const data = resp.notification.request.content.data;
        if (data?.messages) {
          // add real messages to context
          data.messages.forEach((msg) => addNotification({ body: msg }));
        }
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [pushEnabled]);

  return null;
}

// import { Platform } from "react-native";
// import * as Device from "expo-device";
// import Constants from "expo-constants";

// async function register() {
//   let token;

//   if (Device.isDevice) {
//     if (Platform.OS === "android") {
//       await Notifications.setNotificationChannelAsync("default", {
//         name: "default",
//         importance: Notifications.AndroidImportance.MAX,
//         vibrationPattern: [0, 250, 250, 250],
//         lightColor: "#FF231F7C",
//       });
//     }

//     const { status: existingStatus } =
//       await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }

//     if (finalStatus !== "granted") {
//       console.log("Permission not granted!");
//       return;
//     }

//     const projectId =
//       Constants?.expoConfig?.extra?.eas?.projectId ??
//       Constants?.easConfig?.projectId;
//     const pushTokenData = await Notifications.getExpoPushTokenAsync({
//       projectId,
//     });
//     token = pushTokenData.data;
//     setExpoPushToken(token);
//     console.log("Push Token:", token);
//   } else {
//     console.log("Must use physical device for push notifications");
//   }
// }

// register();