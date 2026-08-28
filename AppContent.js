import { useContext, useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from 'expo-font';
import { View, ActivityIndicator } from 'react-native';

import { colors } from "./constants/layout";
import { AuthContext } from './utils/AuthContext';
import { useUpdate } from "./utils/UpdateContext";
import { NotificationContext } from "./context/NotificationContext";

import { navigationRef } from "./utils/navigationRef";
import { setApiHandlers } from "./utils/apiClient";

// push notifications
import { usePushNotifications } from "./hooks/usePushNotifications";

// screens
import StartScreen from './screens/StartScreen';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import ChooseLanguageScreen from './screens/ChooseLanguageScreen';
import HomeScreen from './screens/HomeScreen';
import CourseScreen from './screens/CourseScreen';
import UserScreen from "./screens/UserScreen";
import CategoryScreen from './screens/CategoryScreen';
import WordsListScreen from './screens/WordsListScreen';
import WordCardScreen from './screens/WordCardScreen';
import SentenceCardScreen from './screens/SentenceCardScreen';
import TextScreen from "./screens/TextScreen";
import MemoScreen from "./screens/MemoScreen";
import ProgressScreen from "./screens/ProgressScreen";
import MatchScreen from "./screens/MatchScreen";
import GapsScreen from "./screens/GapsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import CourseSettingsScreen from "./screens/CourseSettingsScreen";

// components
import UpdateModal from './components/UpdateModal';
import MessageModal from './components/MessageModal';

const Stack = createNativeStackNavigator();

function LoadingIndicator() {
   
  return (
    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
      <ActivityIndicator size="large" color={colors.secondary} />
    </View>
  );
}

export default function AppContent() {
  // authentication
  const { user, token, authReady, logout } = useContext(AuthContext);
  
  // push notifications
    const { setPushEnabled: setContextPushEnabled, setExpoPushToken: setContextExpoPushToken } = useContext(NotificationContext);

  const { registerPushToken, pushEnabled, expoPushToken } = usePushNotifications(token, user?.user_id);
  const [pushPermissionAsked, setPushPermissionAsked] = useState(null);

  useEffect(() => {
    if (logout) setApiHandlers(logout);
  }, [logout]);

  useEffect(() => {
    setContextPushEnabled(pushEnabled);
  }, [pushEnabled]);

  useEffect(() => {
    if (expoPushToken) setContextExpoPushToken(expoPushToken);
  }, [expoPushToken]);


  // Load information whether we already asked user
  useEffect(() => {
    if (!authReady || !user) return;

    const loadPushPermissionState = async () => {
      try {
        const key = `pushPermissionAsked_${user.user_id}`;
        const value = await AsyncStorage.getItem(key);

        setPushPermissionAsked(value == "true");

        console.log("Push permission state:", user.user_id, value);
      } catch (err) {
        console.error("Failed to load push permission state: ", err);
        
        setPushPermissionAsked(false);
      }
    };

    loadPushPermissionState();
  }, [authReady, user]);

  // if user wants to get push notifications
  const enablePushNotifications = async () => {
    try {
      await registerPushToken();
      await AsyncStorage.setItem(`pushPermissionAsked_${user.user_id}`, "true");
      setPushPermissionAsked(true);
    } catch (err) {
      console.error("Failed to enable push notifications: ", err);
    }
  }

  // if user doesn't want to get push notifications
  const skipPushNotifications = async () => {
    try {
      await AsyncStorage.setItem(`pushPermissionAsked_${user.user_id}`, "true");
      setPushPermissionAsked(true);
    } catch (err) {
      console.error("Failed to save push notification choice: ", err);
    }
  }

  // check app for updates
  const { checkForUpdate, updateInfo, openStore } = useUpdate();
  // fonts
  const [fontsLoaded] = useFonts({
    LuckiestGuy: require('./assets/fonts/LuckiestGuy-Regular.ttf'),
    ABeeZee: require('./assets/fonts/ABeeZee-Regular.ttf'),
    Nunito: require('./assets/fonts/Nunito-VariableFont_wght.ttf'),
    NunitoBold: require('./assets/fonts/Nunito-Bold.ttf'),
  });

  const [showUpdateModal, setShowUpdateModal] = useState(false);

  

  // check if there is upadte
  useEffect(() => {
      checkForUpdate();
  }, []);
  // show update modal
  useEffect(() => {
      if (updateInfo?.hasUpdate) {
          setShowUpdateModal(true);
      }
  }, [updateInfo]);

  if (!fontsLoaded || !authReady) {
    return <LoadingIndicator />;
  }

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Start" component={StartScreen} />
          
          {!user ? (
            <>
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
            </>        
          ) : (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="ChooseLanguage" component={ChooseLanguageScreen} />
              <Stack.Screen name="Course" component={CourseScreen} /> 
              <Stack.Screen name="Category" component={CategoryScreen} />
              <Stack.Screen name="WordsList" component={WordsListScreen} />
              <Stack.Screen name="WordCard" component={WordCardScreen} />
              <Stack.Screen name="SentenceCard" component={SentenceCardScreen} />
              <Stack.Screen name="Text" component={TextScreen} />
              <Stack.Screen name="MemoGame" component={MemoScreen} />
              <Stack.Screen name="MatchGame" component={MatchScreen} />
              <Stack.Screen name="GapsTask" component={GapsScreen} />
              <Stack.Screen name="User" component={UserScreen} />
              <Stack.Screen name="Progress" component={ProgressScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="CourseSettings" component={CourseSettingsScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>

      <UpdateModal
        visible={showUpdateModal}
        forceUpdate={updateInfo?.forceUpdate}
        title={
            updateInfo?.forceUpdate
                ? "Update required"
                : "Update available"
        }
        message={updateInfo?.message}
        confirmText="Update"
        cancelText="Later"
        onConfirm={openStore}
        onClose={() => setShowUpdateModal(false)}
      />

      {/* Ask only once after registration and login */}
      <MessageModal 
        visible={!!user && pushPermissionAsked !== null && pushPermissionAsked === false}
        type={"confirm"}
        title={"Push notifications"}
        message={"Would you like to receive notifications about new topics and your learning plan?"}
        confirmText={"Yes"}
        cancelText={"Later"}
        onConfirm={enablePushNotifications}
        onClose={skipPushNotifications}
        autoClose={false}
      />
    </>
  );
}