import Constants from "expo-constants";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../utils/AuthContext";
import { ScrollView, View } from "react-native";
import { layout, colors, spacing, textStyles } from "../constants/layout";
import Navbar from "../components/Navbar";
import HouseIcons from "../components/HouseIcons";

const HomeScreen = ({ route, navigation }) => {
  const API_BASE = Constants.expoConfig.extra.API_BASE;
  const { user, token, loading } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  useEffect(() => {
  if (loading || !token || !user) return;

  fetch(`${API_BASE}/categories`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then(data => setCategories(data))
    .catch(err => console.error("Fetch error:", err));
}, [loading, token, user]);

  const handleSelectCategory = (category) => {
    navigation.navigate("Category", {
      name: category.name,
      categoryID: category.categoryID,
      user
    });
  };

  return (
    <View style={layout.screen}>
      <ScrollView
        contentContainerStyle={[
          layout.scrollContent,
          {
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <HouseIcons
          categories={categories}
          onSelect={handleSelectCategory}
        />
      </ScrollView>

      {user?.id && (
        <View style={layout.navbarWrapper}>
          <Navbar user={user} navigation={navigation} />
        </View>
      )}
    </View>
  );
};

export default HomeScreen;