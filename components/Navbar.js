import { View, Image, Text, Pressable, StyleSheet } from "react-native";
import { useContext } from "react";
import { AuthContext } from "../utils/AuthContext";
import { NotificationContext } from "../context/NotificationContext";
import { getImageUrl } from "../utils/apiClient";
import { layout, colors } from "../constants/layout";
// icons
import AntDesign from "@expo/vector-icons/AntDesign";
import Fontisto from "@expo/vector-icons/Fontisto";
import Ionicons from "@expo/vector-icons/Ionicons";

const Navbar = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { notifications } = useContext(NotificationContext);

  return (
    <View style={styles.navbarContainer}>
      <View style={styles.iconsWrapper}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back-circle"
            size={35}
            color={colors.secondary}
          />
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Home")}>
          <Fontisto name="home" size={29} color={colors.secondary} />
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="settings" size={32} color={colors.secondary} />
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Notifications")}>
          <Ionicons name="notifications" size={32} color={colors.secondary} style={{ position: "relative" }} />
          {notifications.length > 0 && 
            <View  style={styles.numberWrap}>
              <Text style={styles.number}>{notifications.length}</Text>
            </View>
          }
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Progress")}>
          <AntDesign name="star" size={32} color={colors.secondary} />
        </Pressable>

        <Pressable onPress={() => navigation.navigate("User")}>
          <Image
            source={{ uri: getImageUrl(user?.avatar_path) }}
            style={layout.avatar}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbarContainer: {
    alignItems: "center",
    backgroundColor: "transparent",
  },
  iconsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderWidth: 2,
    borderColor: colors.secondary,
    borderRadius: 50,
    backgroundColor: colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 20,
    width: "100%"
  },
  iconWrapper: {
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.secondary,
    borderRadius: 100,
    backgroundColor: colors.primary,
    padding: 5,
  },
  numberWrap: { 
    height: 20,
    minWidth: 20,
    alignItems: "center",
    width: "auto",
    backgroundColor: colors.red,
    position: "absolute", 
    top: -5, 
    left: 20,
    borderRadius: 50
  },
  number: {
    color: colors.white,
    fontWeight: 700,
  }
});

export default Navbar;
