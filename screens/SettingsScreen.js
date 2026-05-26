import { useEffect, useState, useContext } from "react";
import { ScrollView, View, Text, Pressable, Linking, StyleSheet } from "react-native";
import { AuthContext } from "../utils/AuthContext";
import Navbar from "../components/Navbar";
import { layout, textStyles, spacing, colors } from "../constants/layout";
import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from "expo-constants";

const SettingsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  const openPolicy = () => {
    Linking.openURL(
      "https://irensula.github.io/privacy_policy/"
    );
  };

  return (
    <View
      style={[
        layout.screen,
        { paddingHorizontal: 10, backgroundColor: colors.primary },
      ]}
    >
      <ScrollView
        contentContainerStyle={{
          backgroundColor: colors.primary,
          paddingBottom: 80,
        }}
      >
        <View style={layout.container}>
          <View style={[layout.formContainer, layout.shadowStyle]}>
            <Text style={[textStyles.title, { color: colors.secondary }]}>
              Tiedot
            </Text>     
            
              <View style={styles.menuItem}>
                <Text style={styles.menuText}>              
                  App version
                </Text>
                <Text style={styles.menuText}>
                  {Constants.expoConfig?.version || "1.0.0"}
                </Text>
              </View>

              <View style={styles.menuItem}>
                <Text style={styles.menuText}>              
                  Developed by
                </Text>
                <Text style={styles.menuText}>              
                  Iryna Sula
                </Text>
              </View>

              <Pressable style={styles.menuItem} onPress={() => Linking.openURL(
                      "mailto:irensula19@gmail.com")}>
                <Text style={styles.menuText}>              
                  Contact
                </Text>
                <Text style={styles.link}>irensula19@gmail.com</Text>
              </Pressable>

              <Pressable style={styles.menuItem} onPress={openPolicy}>
                <Text style={styles.menuText}>Privacy Policy</Text>
                <Ionicons name="document-text-outline" size={24} color={colors.secondary} />
              </Pressable>
          </View>
        </View>
      </ScrollView>

      {user && (
        <View style={layout.navbarWrapper}>
          <Navbar user={user} navigation={navigation} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  menuText: {
    fontSize: 16,
    fontWeight: "500",
  },

  link: {
    color: colors.secondary,
    textDecorationLine: "underline",
    marginBottom: 8,
  },
});

export default SettingsScreen;