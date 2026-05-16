import { useContext } from "react";
import {
  View,
  Text,
  Pressable,
  BackHandler,
  Platform,
  StyleSheet,
} from "react-native";
import { AuthContext } from "../utils/AuthContext";
import { layout, textStyles, spacing, colors } from "../constants/layout";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const StartScreen = ({ navigation }) => {
  const { user, token } = useContext(AuthContext);

  const handleExit = () => {
    if (Platform.OS === "android") {
      BackHandler.exitApp();
    } else {
      alert("Please, close the app manually on iOS");
    }
  };

  return (
    <View style={layout.container}>
      <View>
        <Pressable onPress={handleExit}>
          <FontAwesome name="close" size={40} color={colors.secondary} />
        </Pressable>
      </View>

      <View style={layout.mainContainer}>
        <Text style={styles.bigTitle}>4langs</Text>
        <Text style={textStyles.mainTitle}>Tervetuloa!</Text>
        {user ? (
          <Pressable onPress={() => navigation.replace("Home")}>
            <View style={layout.button}>
              <Text style={textStyles.buttonText}>Let's go!</Text>
            </View>
          </Pressable>
        ) : (
          <>
            <View style={styles.buttonsWrap}>
              <Pressable onPress={() => navigation.navigate("Login")}>
                <View style={layout.button}>
                  <Text style={textStyles.buttonText}>Login</Text>
                </View>
              </Pressable>
              <Pressable onPress={() => navigation.navigate("Register")}>
                <View style={layout.button}>
                  <Text style={textStyles.buttonText}>Register</Text>
                </View>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  buttonsWrap: {
    flexDirection: "row",
    gap: 10,
  },
  bigTitle: {
    fontSize: 70,
    color: colors.white,
    fontFamily: "LuckiestGuy",
    marginBottom: 30,
    marginTop: 10,
    textAlign: "center",
    alignSelf: "center",
  }
});

export default StartScreen;
