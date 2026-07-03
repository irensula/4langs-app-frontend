import { useState, useEffect, useContext } from "react";
import { ScrollView, View, Pressable } from "react-native";

import { AuthContext } from "../utils/AuthContext";
import { api } from "../utils/apiClient";

import { layout, colors, spacing, textStyles } from "../constants/layout";

import Navbar from "../components/Navbar";

import CategoryCard from "../components/CategoryCard";
import Ionicons from '@expo/vector-icons/Ionicons';

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
        if (error.status === 404) {
            navigation.replace("Home");
            return;
        }
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, [authReady, token, user]);

  const handleSelectCategory = (category) => {
    navigation.navigate("Category", {
      name: category.name,
      courseId: courseId,
      categoryId: category.categoryId,
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
      <Pressable 
        onPress={() =>
            navigation.navigate("CourseSettings", { courseId })
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
        <Navbar user={user} navigation={navigation} />
      </View>
    
    </View>
  );
};

export default CourseScreen;