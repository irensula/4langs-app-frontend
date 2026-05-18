import Constants from "expo-constants";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../utils/AuthContext";
import { ScrollView, View } from "react-native";
import { layout, colors, spacing, textStyles } from "../constants/layout";
import Navbar from "../components/Navbar";
import HouseIcons from "../components/HouseIcons";

const HomeScreen = ({ route, navigation }) => {
  const API_BASE = Constants.expoConfig.extra.API_BASE;
  const { user, token, loading, logout } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
  if (loading) return;
  if (!token || !user) {
    navigation.reset({
      index: 0,
      routes: [{ name: "Start" }],
    });
    return;
  }
  
  const fetchCategories = async () => { 
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        headers: { 
          Authorization: `Bearer ${token}`, 
      },
    });
    if (res.status === 401) {
      setCategories([]);
      await logout();

      navigation.reset({
        index: 0,
        routes: [{ name: "Start" }],
      });
      
      return;
    }
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setCategories([]);
    }
  };
    fetchCategories();
  }, [loading, token, user, logout, navigation]);

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