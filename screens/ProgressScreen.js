import { useEffect, useState, useContext } from "react";
import { ScrollView, View, Text } from "react-native";
import { AuthContext } from "../utils/AuthContext";
import ProgressCard from "../components/ProgressCard";
import Navbar from "../components/Navbar";
import { layout, textStyles, colors } from "../constants/layout";
import { api } from "../utils/apiClient";

const ProgressScreen = ({ navigation }) => {
  const { token } = useContext(AuthContext);
  const [userProgress, setUserProgress] = useState([]);

  useEffect(() => {
    const fetchProgress = async () => {
      
      if (!token) return;

      try {
        const data = await api.get(
          `/progress`, 
          token
        );

        if (!Array.isArray(data)) return;
        console.log("Data", data);
        setUserProgress(data);

      } catch (error) {
        console.error("Error fetching user progress:", error);
        setUserProgress([]);
      }
    };   

    fetchProgress();

  }, [token]);

  return (
    <View
      style={[
        layout.screen,
        { paddingHorizontal: 10, backgroundColor: colors.primary },
      ]}
    >
      <ScrollView
        contentContainerStyle={{
          backgroundColor: colors.primary,
          paddingBottom: 80,
        }}
      >
        <View style={layout.container}>
          <Text style={[textStyles.title]}>
              My progress
            </Text>
          <View>
            {userProgress.map((item) => (
              <ProgressCard
                key={item.courseId}
                studyName={item.languages.study_name}
                studyFlag={item.languages.study_flag}
                translationName={item.languages.translation_name}
                translationFlag={item.languages.translation_flag}
                progressPercent={item.progressPercent}
                categoriesDone={item.categories.done}
                categoriesTotal={item.categories.total}
                exercisesDone={item.exercises.done}
                exercisesTotal={item.exercises.total}
                pointsGot={item.points.got}
                pointsMax={item.points.max}
                currentCategory={item.currentCategory}
            />))}
          </View>
        </View>
      </ScrollView>
      {/* NAVBAR */}
      <View style={layout.navbarWrapper}>
        <Navbar navigation={navigation} />
      </View>
    </View>
  );
};

export default ProgressScreen;
