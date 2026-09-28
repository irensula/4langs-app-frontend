// DEVICE (EXPO PUSH TOKEN) REGISTRATION 

import { useEffect, useState, useCallback } from "react";
import { AppState, Alert, Linking } from 'react-native';
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../utils/apiClient";

export function usePushNotifications(token, userId) {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [systemAllowed, setSystemAllowed] = useState(true);

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
  }, [ userId, pushEnabledKey, expoPushTokenKey ]);

  // Check system notification permission
 const checkPermission = useCallback(async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();

      const allowed = status === "granted";

      setSystemAllowed(allowed);

      console.log( "System notification permission:", status );

      return allowed;
    } catch (error) {
      console.error("Failed to check notification permission:", error);
      return false;
    }
  }, []);
  
  // Check permission on startup and 
  // when user returns from Android settings
  useEffect(() => {
    checkPermission();

    const subscription = AppState.addEventListener(
      "change",
      (state) => {
        if (state === "active") {
          checkPermission();
        }}
    );

    return () => subscription.remove();
  }, [checkPermission]);

  // Register device (push token) for push notifications
  const registerPushToken = async () => {
    if (!userId || !token) return;

    try {
      let allowed = await checkPermission(); 
      // Ask user for permission if necessary 
      if (!allowed) { 
        const { status, canAskAgain } = await Notifications.requestPermissionsAsync(); 
        allowed = status === "granted"; 
        setSystemAllowed(allowed); 
        
        if (!allowed) { 
          if (!canAskAgain) { 
            Alert.alert( 
              "Notifications are disabled", 
              "Please enable notifications in your phone settings.", 
              [ 
                { text: "Cancel", }, 
                { text: "Open settings", onPress: () => Linking.openSettings(), }, 
              ]); 
            } 
            return false; 
          }}

      // get Expo Push Token
      const { data: expoToken } = await Notifications.getExpoPushTokenAsync();

      // send Expo Push Token to the database
      await api.post(
        "/push-token/register", 
        { expo_push_token: expoToken },
        token
        );

      await AsyncStorage.setItem(expoPushTokenKey, expoToken);
      await AsyncStorage.setItem(pushEnabledKey, "true");
      
      setExpoPushToken(expoToken);
      setPushEnabled(true);
      
      console.log("Push token registerd:", expoToken);
      return true;
    
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
        "/push-token/unregister", 
        { expo_push_token: tokenToRemove },
        token
      );

      await AsyncStorage.setItem(pushEnabledKey, "false");
      await AsyncStorage.removeItem(expoPushTokenKey);

      setExpoPushToken(null);
      setPushEnabled(false);
      
      console.log("Push token unregistered");
      return true;
    } catch (err) {
      console.error("Failed to unregister push token:", err);
    }
  };

  return { 
    expoPushToken, 
    pushEnabled,
    systemAllowed,
    checkPermission,
    registerPushToken, 
    unregisterPushToken
  };
}
