import { useEffect, useState, useContext } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { AuthContext } from "../utils/AuthContext";
import Navbar from "../components/Navbar";
import { layout, textStyles, spacing, colors } from "../constants/layout";

const ProgressScreen = ({ navigation }) => {
  const { user, token } = useContext(AuthContext);

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
          <View style={[layout.infoCard, layout.shadowStyle]}>
            <Text style={[textStyles.title, { color: colors.secondary }]}>
              Asetukset
            </Text>

            <Text>Privacy Policy</Text>
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

export default ProgressScreen;
