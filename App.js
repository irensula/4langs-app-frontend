import React, { useContext, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import StartScreen from './screens/StartScreen';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import UserScreen from "./screens/UserScreen";
import CategoryScreen from './screens/CategoryScreen';
import WordsListScreen from './screens/WordsListScreen';
import TextScreen from "./screens/TextScreen";
import MemoScreen from "./screens/MemoScreen";
import ProgressScreen from "./screens/ProgressScreen";
import ConnectScreen from "./screens/ConnectScreen";
import GapsScreen from "./screens/GapsScreen";
import { colors } from "./constants/layout";
import { AuthProvider, AuthContext } from './utils/AuthContext';
import { View, ActivityIndicator } from 'react-native';

const Stack = createNativeStackNavigator();

function LoadingIndicator() {
   
  return (
    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
      <ActivityIndicator size="large" color="#55962f" />
    </View>
  );
}

function AppContent() {

  const [fontsLoaded] = useFonts({
    LuckiestGuy: require('./assets/fonts/LuckiestGuy-Regular.ttf'),
    ABeeZee: require('./assets/fonts/ABeeZee-Regular.ttf'),
    Nunito: require('./assets/fonts/Nunito-VariableFont_wght.ttf'),
    NunitoBold: require('./assets/fonts/Nunito-Bold.ttf'),
  });

  const { user, loading } = useContext(AuthContext);

  if (!fontsLoaded) {
    return null;
  }
  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Start" component={StartScreen} />
      {!user && (
        <>
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      )}
      {user && (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="UserScreen" component={UserScreen} />
          <Stack.Screen name="ProgressScreen" component={ProgressScreen} />
          <Stack.Screen name="Category" component={CategoryScreen} />
          <Stack.Screen name="WordsListScreen" component={WordsListScreen} />
          <Stack.Screen name="TextScreen" component={TextScreen} />
          <Stack.Screen name="MemoScreen" component={MemoScreen} />
          <Stack.Screen name="ConnectScreen" component={ConnectScreen} />
          <Stack.Screen name="GapsScreen" component={GapsScreen} />
        </>
      )}
    </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }} edges={['top', 'bottom']}>
          <AppContent />
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}