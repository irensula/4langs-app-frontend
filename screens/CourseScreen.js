import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../utils/AuthContext";
import { ScrollView, View } from "react-native";
import { layout, colors, spacing, textStyles } from "../constants/layout";
import Navbar from "../components/Navbar";
import Category from "../components/Category";
import { api } from "../utils/apiClient";

const CourseScreen = ({ route, navigation }) => {
  const { user, token, authReady } = useContext(AuthContext);
  const { courseId } = route.params;
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => { 

      if (!token || !user || !authReady) return;
      
      try {
        const data = await api.get(
            `/categories/${courseId}`, 
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
        <Category
          categories={categories}
          onSelect={handleSelectCategory}
        />
      </ScrollView>

      
      <View style={layout.navbarWrapper}>
        <Navbar user={user} navigation={navigation} />
      </View>
    
    </View>
  );
};

export default CourseScreen;