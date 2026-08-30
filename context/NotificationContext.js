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

export const NotificationContext = createContext({
  notifications: [], 
  addNotification: () => {}, 
  removeNotification: () => {}, 
  clearNotifications: () => {},
});

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
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
    setNotifications((prev) => [notification, ...prev]);    
  }, []);

  const removeNotification = useCallback((notification_id) => {
    setNotifications((prev) => prev.filter((notification) => notification.notification_id !== notification_id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification, // remove notification from the notifications list
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
