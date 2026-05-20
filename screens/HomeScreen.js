import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../utils/AuthContext";
import { ScrollView, View } from "react-native";
import { layout, colors, spacing, textStyles } from "../constants/layout";
import Navbar from "../components/Navbar";
import HouseIcons from "../components/HouseIcons";
import { api } from "../utils/apiClient";

const HomeScreen = ({ route, navigation }) => {
  const { user, token, authReady } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => { 

      if (!token || !user || !authReady) return;
      
      try {
        const data = await api.get(
            `/categories`, 
            token
        );
      
        if (!Array.isArray(data)) return;

        setCategories(data);

      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, [authReady, token, user]);

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