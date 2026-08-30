// DEVICE (EXPO PUSH TOKEN) REGISTRATION 

import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../utils/apiClient";

export function usePushNotifications(token, userId) {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [pushEnabled, setPushEnabled] = useState(false);
  
  const pushEnabledKey = userId ? `pushEnabled_${userId}` : null;
  const expoPushTokenKey = userId ? `expoPushToken_${userId}` : null;

  // Load saved push settings for current user (push enabled, expo push token)
  useEffect(() => {
    if (!userId) {
      setPushEnabled(false);
      setExpoPushToken(null);
      return;
    }

    const loadPushSettings = async () => {
      try {
        const [savedPushEnabled, savedExpoPushToken] = 
          await Promise.all([
            AsyncStorage.getItem(pushEnabledKey),
            AsyncStorage.getItem(expoPushTokenKey)
          ]);

        setPushEnabled(savedPushEnabled === "true");
        setExpoPushToken(savedExpoPushToken);

        console.log("Saved push state:", savedPushEnabled);
        console.log("Saved Expo token:", savedExpoPushToken);
      } catch (err) {
        console.error("Failed to load push settings:", err);
      }
    };

    loadPushSettings();
  }, [userId]);

  // Register device (push token) for push notifications
  const registerPushToken = async () => {
    if (!userId || !token) return;

    try {
      // get Expo Push Token
      const { data: expoToken } = await Notifications.getExpoPushTokenAsync();

      // send Expo Push Token to the database
      await api.post(
        `/push-token/register`, 
        { expo_push_token: expoToken },
        token
        );

      setExpoPushToken(expoToken);

      await AsyncStorage.setItem(expoPushTokenKey, expoToken);
      await AsyncStorage.setItem(pushEnabledKey, "true");
      
      setExpoPushToken(expoToken);
      setPushEnabled(true);
      
      console.log("Push token registerd:", expoToken);
    
    } catch (err) {
      console.error("Failed to register push token:", err);
    }
  };

  // Unregister device (push token) from push notifications
  const unregisterPushToken = async () => {
    if (!userId || !token) return;

    try {
      // Use state token or saved token
      const tokenToRemove = expoPushToken || await AsyncStorage.getItem(expoPushTokenKey);

      if (!tokenToRemove) {
        console.warn("No push token to unregister");
        return;
      }

      // unregister Expo Push Token
      await api.post(
        `/push-token/unregister`, 
        { expo_push_token: tokenToRemove },
        token
      );

      await AsyncStorage.setItem(pushEnabledKey, "false");
      await AsyncStorage.removeItem(expoPushTokenKey);

      setExpoPushToken(null);
      setPushEnabled(false);
      
      console.log("Push token unregistered");
    } catch (err) {
      console.error("Failed to unregister push token:", err);
    }
  };

  return { expoPushToken, pushEnabled, registerPushToken, unregisterPushToken };
}
