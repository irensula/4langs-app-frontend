import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { NotificationContext } from "../context/NotificationContext";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useTheme } from "@react-navigation/native";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ModalScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { notifications, markAllAsRead, removeNotification } =
    useContext(NotificationContext);
  const { user, token } = useContext(AuthContext);

  // Mark all notifications as read when the list opens
  useEffect(() => {
    markAllAsRead(user.userID, token);
  }, [notifications]);

  return (
    <View style={styles.overlay}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => navigation.goBack()}
      >
        <View style={styles.modalContainer}>
          <View style={styles.iconWrapper}>
            <AntDesign
              onPress={() => navigation.goBack()}
              name="close-circle"
              size={30}
              color={colors.white}
            />
          </View>
          <View style={styles.modalContent}>
            <Pressable onPress={() => {}}>
              <FlatList
                data={notifications}
                keyExtractor={(item, index) =>
                  (item.notificationID ?? index).toString()
                }
                renderItem={({ item }) => (
                  <View
                    style={[styles.item, { backgroundColor: colors.green }]}
                  >
                    <AntDesign
                      name="close-circle"
                      size={30}
                      color={colors.white}
                      onPress={() => removeNotification(item.notificationID)}
                    />
                    <Text style={[styles.text, { color: colors.white }]}>
                      {item.body}
                    </Text>
                  </View>
                )}
              ></FlatList>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", 
    alignItems: "center", 
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 20, 
    justifyContent: "center", 
  },
  modalContent: {
    
  },
  iconWrapper: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: "10%",
    borderRadius: 8,
    width: "100%",
    elevation: 5,
    flexDirection: "row",
    marginBottom: 10,
  },
  text: {
    fontWeight: "500",
    fontSize: 18,
    marginLeft: 20,
  },
});
