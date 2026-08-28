import { useEffect, useState, useContext, useRef } from "react";
import { ScrollView, View, Text, Pressable, Linking, Animated, StyleSheet } from "react-native";

import { AuthContext } from "../utils/AuthContext";
import { api } from "../utils/apiClient";
import { usePushNotifications } from "../hooks/usePushNotifications";

import Navbar from "../components/Navbar";
import MessageModal from "../components/MessageModal";
import LanguageDropdown from "../components/LanguageDropdown";

import { layout, textStyles, colors } from "../constants/layout";

import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from "expo-constants";

const SettingsScreen = ({ navigation }) => {
  const { token, user, refreshSession } = useContext(AuthContext);

  const [languages, setLanguages] = useState([]);
  const [uiLanguage, setUILanguage] = useState(user.ui_language_id);
  const { pushEnabled, registerPushToken, unregisterPushToken } =
    usePushNotifications(token, user.user_id);
  const [toggleOn, setToggleOn] = useState(pushEnabled);
  const offset = useRef(new Animated.Value(pushEnabled ? 30 : 0)).current;

  const [modal, setModal] = useState({
      visible: false,
      type: "message",
      title: "",
      message: "",
  });

  const openPolicy = () => {
    Linking.openURL(
      "https://study-languages.up.railway.app/privacy-policy"
    );
  };

  // get translation languages
    useEffect(() => {
        const fetchLanguages = async () => {
        
            if (!token) return;

            try {
                const data = await api.get(
                    `/languages`,
                    token
                );

                if (!Array.isArray(data)) return;
                
                setLanguages(data);

            } catch (error) {
                console.error("Error fetching languages:", error);
            }
        };
        
        fetchLanguages();
    }, [token]);

  const availableLanguages = languages
        .map(lang => ({
            ...lang,
            disabled: lang.language_id === user.ui_language_id,
    }));

  // change translation language
  const handleChangeUILanguage = async (selectedLanguage) => {
      if (!selectedLanguage.language_id || !token ) return;

      try {
          // close confirm
          setModal(prev => ({
          ...prev,
              visible: false,
          }));
          await api.put(
              `/users/${user.user_id}/settings`,
              { ui_language_id: selectedLanguage.language_id },
              token
          );
          setUILanguage(selectedLanguage.language_id);
          await refreshSession();

          setModal({
              visible: true,
              type: "message",
              title: "",
              message: "Application language updated!",
              confirmText: "OK",
          });            
          
      } catch (error) {
          setModal({
              visible: true,
              type: "message",
              message:
                  error.response?.error ??
                  "Failed to change application language",
              confirmText: "OK",
          });
      }
  }
  // confirm changing translation language
  const confirmChangeUILanguage = (selectedLanguage) => {
    console.log("confirmChangeUILanguage", selectedLanguage);
      setModal({
          visible: true,
          type: "confirm",
          title: "Change application language",
          message: `Change application language to ${selectedLanguage.name}?`,
          confirmText: "Change",
          cancelText: "Cancel",
          onConfirm: () => handleChangeUILanguage(selectedLanguage),
      });
  };

  // PUSH NOTIFICATIONS
  useEffect(() => {
    setToggleOn(pushEnabled);
    Animated.timing(offset, {
      toValue: pushEnabled ? 30 : 0,
      duration: 0,
      useNativeDriver: false,
    }).start();
  }, [pushEnabled]);

  const toggle = async () => {
    const newToggleState = !toggleOn;
    setToggleOn(newToggleState);

    setModal({
              visible: true,
              type: "message",
              title: "",
              message: newToggleState
                ? "Push-notifications are on"
                : "Push-notifications are off",
              confirmText: "OK",
          });    

    Animated.timing(offset, {
      toValue: newToggleState ? 30 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    if (newToggleState) {
      await registerPushToken();
    } else {
      await unregisterPushToken();
    }
  };

  return (
    <View
      style={[
        layout.screen,
        { paddingHorizontal: 10, backgroundColor: colors.primary },
      ]}
    >
      <MessageModal
          visible={modal.visible}
          type={modal.type}
          title={modal.title}
          message={modal.message}
          confirmText={modal.confirmText}
          cancelText={modal.cancelText}
          onConfirm={modal.onConfirm}
          onClose={() =>
              setModal(prev => ({
                  ...prev,
                  visible: false,
              }))
          }
      />

      <ScrollView
        contentContainerStyle={{
          backgroundColor: colors.primary,
          paddingBottom: 80,
        }}
      >
        <View style={layout.container}>
          <Text style={textStyles.title}>Settings</Text>
          <View style={[layout.formContainer, layout.shadowStyle]}>     
            
              <View style={layout.menuItem}>
                <Text style={layout.menuText}>App version</Text>
                <Text style={layout.menuText}>{Constants.expoConfig?.version || "1.0.0"}</Text>
              </View>

              <View style={layout.menuItem}>
                <Text style={layout.menuText}>Developed by</Text>
                <Text style={layout.menuText}>Iryna Sula</Text>
              </View>

              <Pressable style={layout.menuItem} onPress={() => Linking.openURL("mailto:irensula19@gmail.com")}>
                <Text style={layout.menuText}>Contact</Text>
                <Text style={styles.link}>irensula19@gmail.com</Text>
              </Pressable>

              <Pressable style={layout.menuItem} onPress={openPolicy}>
                <Text style={layout.menuText}>Privacy Policy</Text>
                <Ionicons name="document-text-outline" size={24} color={colors.secondary} />
              </Pressable>

              <View style={layout.settingsItem}>
                  <Text style={layout.menuText}>Change application language</Text>

                  <LanguageDropdown 
                      data={availableLanguages}
                      value={uiLanguage}
                      onSelect={confirmChangeUILanguage}
                      disableItem={(item) => item.disabled}
                      placeholder = "Change application language"
                  />
              </View>

               <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 5
                  }}
                >
                  <Text style={layout.menuText}>Push-notifications</Text>
                  <Pressable
                    style={{
                      width: 70,
                      height: 40,
                      backgroundColor: toggleOn ? colors.secondary : colors.lightgrey,
                      borderRadius: 50,
                      flexDirection: "row",
                      padding: 5,
                    }}
                    onPress={toggle}
                  >
                    <Animated.View
                      style={{
                        height: 30,
                        width: 30,
                        borderRadius: 20,
                        backgroundColor: colors.white,
                        marginLeft: offset,
                      }}
                    />
                  </Pressable>
                </View>
            </View>
        </View>
      </ScrollView>

      <View style={layout.navbarWrapper}>
        <Navbar navigation={navigation} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  link: {
    color: colors.secondary,
    textDecorationLine: "underline",
    marginBottom: 8,
  },
});

export default SettingsScreen;