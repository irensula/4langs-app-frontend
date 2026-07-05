import { useState, useEffect, useContext } from "react";
import { ScrollView, View, Pressable } from "react-native";

import { AuthContext } from "../utils/AuthContext";
import { api } from "../utils/apiClient";

import { layout, colors, spacing, textStyles } from "../constants/layout";

import Navbar from "../components/Navbar";

import CategoryCard from "../components/CategoryCard";
import Ionicons from '@expo/vector-icons/Ionicons';

const CourseScreen = ({ route, navigation }) => {
  const { token } = useContext(AuthContext);
  const { course } = route.params;
  const courseId = course.course;
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => { 

      if (!token) return;
      
      try {
        const data = await api.get(
            `/categories/${courseId}`, 
            token
        );
      
        if (!Array.isArray(data)) return;

        setCategories(data);

      } catch (error) {
        if (error.status === 404) {
            navigation.replace("Home");
            return;
        }
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, [token]);

  const handleSelectCategory = (category) => {
    navigation.navigate("Category", {
      categoryName: category.name,
      courseId: courseId,
      categoryId: category.categoryId
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
      <Pressable 
        onPress={() =>
            navigation.navigate("CourseSettings", { course })
        } 
        style={{
            flexDirection: "row",
            width: "100%",
            justifyContent: "flex-end",
            alignItems: "flex-start",
            paddingHorizontal: 25 
          }}>
          <Ionicons name="settings" size={35} color={colors.orange} />
        </Pressable>
        
        <CategoryCard
          categories={categories}
          onSelect={handleSelectCategory}
        />
      </ScrollView>

      
      <View style={layout.navbarWrapper}>
        <Navbar navigation={navigation} />
      </View>
    
    </View>
  );
};

export default CourseScreen;