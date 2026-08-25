import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../utils/apiClient";

export function usePushNotifications(token) {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [pushEnabled, setPushEnabled] = useState(false);
  
  const registerPushToken = async () => {
    try {
      // get Expo Push Token
      const { data } = await Notifications.getExpoPushTokenAsync();
      setExpoPushToken(data);

      // send Expo Push Token to the database
      await api.post(
        `/push-token/register`, 
        { expo_push_token: data },
        token
        );

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
      await api.post(
        `/push-token/unregister`, 
        { expo_push_token: expoPushToken },
        token
      );

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
