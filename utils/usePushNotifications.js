import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function usePushNotifications(token) {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [pushEnabled, setPushEnabled] = useState(false);
  const API_BASE = Constants.expoConfig?.extra?.API_BASE;

  const registerPushToken = async () => {
    try {
      // get Expo Push Token
      const { data } = await Notifications.getExpoPushTokenAsync();
      setExpoPushToken(data);

      // send Expo Push Token to the database
      await fetch(`${API_BASE}/push-token/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ expo_push_token: data }),
      });
      await AsyncStorage.setItem("expoPushToken", data);
      await AsyncStorage.setItem("pushEnabled", "true");
      setPushEnabled(true);
      console.log("Push token registerd:", data);
    } catch (err) {
      console.error("Failed to register push token:", err);
    }
  };

  const unregisterPushToken = async () => {
    try {
      if (!expoPushToken) return;
      // get Expo Push Token
      await fetch(`${API_BASE}/push-token/unregister`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ expo_push_token: expoPushToken }),
      });
      setExpoPushToken(null);
      await AsyncStorage.setItem("pushEnabled", "false");
      setPushEnabled(false);
      console.log("Push token unregistered");
    } catch (err) {
      console.error("Failed to unregister push token:", err);
    }
  };

  useEffect(() => {
    if (token) {
      registerPushToken();
    }
  }, [token]);

  return { expoPushToken, pushEnabled, registerPushToken, unregisterPushToken };
}
