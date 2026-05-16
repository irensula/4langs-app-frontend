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
  const [userCategory, setUserCategory] = useState(0);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  useEffect(() => {
    if (loading || !token || !user) return;
    console.log("API_BASE:", API_BASE);

    fetch(`${API_BASE}/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (Array.isArray(data?.categories)) {
          setCategories(data.categories);
        } else {
          console.warn("Invalid categories format:", data);
          setCategories([]);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setMessage("Could not load categories");
        setMessageType("error");
      });

    fetch(`${API_BASE}/users/${user.id}/category`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserCategory(data?.categoryID || 0);
      })
      .catch((err) => console.error("User fetch error:", err));
  }, [loading, token, user]);

  const handleLevelComplete = async () => {
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}/category`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const text = await res.text();

        let updatedUser;

        try {
          updatedUser = JSON.parse(text);
        } catch (e) {
          console.warn("Server returned non-JSON:", text);
          return;
        }

        setUserCategory(Number(updatedUser?.categoryID) || 0);
      
      } catch (err) {
        console.error("Failed to unlock next category: ", err);
      }
    };

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
          user={user}
          categories={categories}
          onSelect={handleSelectCategory}
          userCategory={userCategory}
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
