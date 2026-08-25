import React, { useContext, useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';

import { colors } from "./constants/layout";
import { AuthProvider, AuthContext } from './utils/AuthContext';
import { UpdateProvider, useUpdate } from "./utils/UpdateContext";
import { NotificationProvider } from "./context/NotificationContext";
import { navigationRef } from "./utils/navigationRef";
import { setApiHandlers } from "./utils/apiClient";

// push notifications
import NotificationHandler from "./utils/NotificationHandler";
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

const Stack = createNativeStackNavigator();

function LoadingIndicator() {
   
  return (
    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
      <ActivityIndicator size="large" color="#55962f" />
    </View>
  );
}

function AppContent() {
  // authentication
  const { user, token, authReady, logout } = useContext(AuthContext);

  usePushNotifications(token);
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

  useEffect(() => {
    if (logout) setApiHandlers(logout);
  }, [logout]);

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
    </>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <UpdateProvider>
          <SafeAreaProvider style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }} edges={['top', 'bottom']}>
              <NotificationHandler />
              <AppContent />
            </SafeAreaView>
          </SafeAreaProvider>
        </UpdateProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}