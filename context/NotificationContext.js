// IN-APP NOTIFICATION STATE

import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { AuthContext } from '../utils/AuthContext';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../utils/apiClient";

export const NotificationContext = createContext({
  notifications: [], 
  addNotification: () => {}, 
  removeNotification: () => {}, 
  clearNotifications: () => {},
});

export const NotificationProvider = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  const userId = user?.user_id;
  const notificationsKey = userId ? `notifications_${userId}` : null;
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);

  // loading notifications on startup
  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setNotificationsLoaded(false);
      return;
    }

    const loadNotifications = async () => {
      try {
        const saved = await AsyncStorage.getItem(notificationsKey);
        setNotifications(saved ? JSON.parse(saved) : []);
      } catch (err) {
        console.error("Failed to load notifications:", err);
        setNotifications([]);
      } finally {
        setNotificationsLoaded(true);
      }
    };
    loadNotifications();
  }, [userId]);

  // saving notifications after changes
  useEffect(() => {
    if (!userId || !notificationsLoaded) return;
    try {
      AsyncStorage.setItem(notificationsKey, JSON.stringify(notifications));
    } catch (err) {
      console.error("Failed to save notifications:", err)
    }
  }, [notifications, userId, notificationsKey, notificationsLoaded]);

  // add notification
  const addNotification = useCallback((notification) => {
    setNotifications((prev) => {
      const exists = prev.some(
        (item) => item.notification_id === notification.notification_id);
        if (exists) {
          return prev;
        }
        return [
          {...notification, read: false},
          ...prev,
        ]    
    });
  }, []);

  const removeNotification = useCallback(async (notification_id) => {
    if (!userId || !token) return;

    try {
        await api.patch(
            `/notifications/${notification_id}/hide`,
            {},
            token
        );

        setNotifications((prev) =>
            prev.filter(
                (notification) =>
                    notification.notification_id !== notification_id
            )
        );
    } catch (error) {
        console.error("Failed to hide notification:", error);
    }
}, [userId, token]);

  const clearNotifications = useCallback(async () => {
      if (!userId || !token) return;

      try {
          await api.patch(
              "/notifications/hide-all",
              {},
              token
          );

          setNotifications([]);
      } catch (error) {
          console.error("Failed to hide all notifications:", error);
      }
  }, [userId, token]);

  const markNotificationsAsRead = useCallback(async (notificationList) => {
      if (!userId || !token || !notificationList?.length) return;

      try {
          const unreadNotifications = notificationList.filter(
              (notification) => !notification.read
          );
          await Promise.all(
              unreadNotifications.map((notification) =>
                  api.patch(
                      `/notifications/${notification.notification_id}/read`,
                      {},
                      token
                  )
              )
          );

          setNotifications((prev) =>
              prev.map((notification) => ({
                  ...notification,
                  read: true,
              }))
          );
      } catch (error) {
          console.error("Failed to mark notifications as read:", error);
      }
  }, [userId, token]);

  const fetchNotifications = useCallback(async () => {
      if (!userId || !token) return;

      try {
          const data = await api.get("/notifications", token);

          if (Array.isArray(data)) {
              setNotifications(data);
              return data;
          }
          return [];
      } catch (error) {
          console.error("Failed to fetch notifications:", error);
          return [];
      }
  }, [userId, token]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification, // remove notification from the notifications list
        clearNotifications,
        markNotificationsAsRead,
        fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
