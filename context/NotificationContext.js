import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

export const NotificationContext = createContext({
  expoPushToken: "",
  setExpoPushToken: () => {},
  pushEnabled: false,
  setPushEnabled: () => {},
  notificationsEnabled: true,
  notifications: [],
  addNotification: () => {},
});

export const NotificationProvider = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [pushEnabled, setPushEnabled] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [popupNotifications, setPopupNotifications] = useState([]);
  const API_BASE = Constants.expoConfig?.extra?.API_BASE;

  const clearPopupNotifications = useCallback(() => {
    setPopupNotifications([]);
  }, []);

  // loading notifications on startup
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("notifications");
      if (saved) setNotifications(JSON.parse(saved));
    })();
  }, []);

  // saving notifications after changes
  useEffect(() => {
    AsyncStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  // add notification
  const addNotification = useCallback((notif) => {
    const notifWithId = { id: notif.notificationID ?? Date.now(), ...notif };

    // list of notifications
    setNotifications((prev) => [notifWithId, ...prev]);

    // notifications banner
    setPopupNotifications((prev) => [notifWithId, ...prev]);

    setTimeout(() => {
      setPopupNotifications((prev) =>
        prev.filter((n) => n.notificationID !== notif.notificationID)
      );
    }, 5000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.notificationID !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAllAsRead = useCallback(
    async (userId, token) => {
      const unread = notifications.filter((n) => !n.read);

      if (unread.length === 0) return;

      const notificationIds = unread.map((n) => n.id);

      // Update local state first
      setNotifications((prev) =>
        prev.map((n) =>
          notificationIds.includes(n.id) ? { ...n, read: true } : n
        )
      );

      // Then update server
      try {
        const res = await fetch(
          `${API_BASE}/notifications/${userId}/mark-read`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ notificationIds }),
          }
        );

        if (!res.ok) throw new Error(`HTTP error! ${res.status}`);
        const data = await res.json();
      } catch (err) {
        console.error("Failed to mark notifications as read:", err);
      }
    },
    [API_BASE, notifications]
  );

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        setExpoPushToken,
        pushEnabled,
        setPushEnabled,
        notificationsEnabled: pushEnabled,
        notifications,
        popupNotifications,
        addNotification,
        removeNotification, // remove notification from the notifications list
        clearNotifications,
        clearPopupNotifications, // close the push-notification when user taps on it
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
