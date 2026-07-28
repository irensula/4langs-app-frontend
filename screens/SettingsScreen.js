import { useEffect, useState, useContext } from "react";
import { ScrollView, View, Text, Pressable, Linking, StyleSheet } from "react-native";

import { AuthContext } from "../utils/AuthContext";
import { api } from "../utils/apiClient";

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
              {
                  ui_language_id: selectedLanguage.language_id
              },
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