import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { colors } from "./constants/layout";

// context
import { AuthProvider } from './utils/AuthContext';
import { UpdateProvider } from "./utils/UpdateContext";
import { NotificationProvider } from "./context/NotificationContext";

import NotificationHandler from "./utils/NotificationHandler";
import AppContent from "./AppContent";

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <UpdateProvider>
          <SafeAreaProvider style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }} edges={['top', 'bottom']}>
              <NotificationHandler />
              <AppContent />
            </SafeAreaView>
          </SafeAreaProvider>
        </UpdateProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}