import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../utils/AuthContext";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import Navbar from "../components/Navbar";
import ExerciseCard from '../components/ExerciseCard';
import { layout, colors, textStyles, spacing } from "../constants/layout";
import { useIsFocused } from "@react-navigation/native";
import CategoryTitle from "../components/CategoryTitle";
import { api } from "../utils/apiClient";

export default function CategoryScreen({ route, navigation }) {
  const { token } = useContext(AuthContext);
  const { categoryName, courseId, categoryId, unlocked } = route.params;
  const isFocused = useIsFocused();
  const [exercises, setExercises] = useState([]);
  
  useEffect(() => {
    const fetchExercises = async () => { 
    
      if (!token) return;
      
      try {
        const data = await api.get(
            `/courses/${courseId}/categories/${categoryId}/exercises`, 
            token
        );
      
        if (!Array.isArray(data)) return;

        setExercises(data);

      } catch (error) {
        console.error("Error fetching exercises:", error);
        setExercises([]);
      }
    };
    fetchExercises();
  }, [token]);

  const handleSelectExercise = (exercise) => {
    navigation.navigate(exercise.screen_name, {
      exerciseId: exercise.exercise_id,
      courseId,
      categoryId,
      categoryName
    });
  };

  return (
    <View style={layout.screen}>
      <ScrollView contentContainerStyle={layout.scrollContent}>
        <CategoryTitle
          courseId={courseId}
          categoryName={categoryName}
          isFocused={isFocused}
        />

        <View style={styles.categoriesWrap}>
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.exercise_id}
              exercise={exercise}
              onSelect={handleSelectExercise}
          />))}
        </View>
      </ScrollView>
      
        <View style={layout.navbarWrapper}>
          <Navbar navigation={navigation} />
        </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  categoriesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  category: {
    width: "48%",
    padding: 10,
    alignItems: "center",
    marginVertical: 10,
    height: 100,
    justifyContent: "center",
    backgroundColor: colors.orange,
    borderColor: colors.lightorange,
    borderRadius: 25,
    borderWidth: 2,
  },
  categoryTitle: {
    color: colors.white,
    fontFamily: "ABeeZee",
    fontSize: 16,
  },
});
