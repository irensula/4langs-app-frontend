import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../utils/AuthContext";
import { ScrollView, View, Text } from "react-native";
import { layout, colors, textStyles } from "../constants/layout";
import Navbar from "../components/Navbar";
import CourseCard from "../components/CourseCard";
import { api } from "../utils/apiClient";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const HomeScreen = ({ route, navigation }) => {
  const { user, courses, token, authReady } = useContext(AuthContext);
  const [userCourses, setUserCourses] = useState([]);

  useEffect(() => {
    if (courses && courses.length === 0) {
        navigation.replace("ChooseLanguage");
    }
  }, [courses]);

  useEffect(() => {
    const fetchCourses = async () => { 

      if (!token || !user || !courses || !authReady) return;
      
      try {
        const data = await api.get(
            `/courses`, 
            token
        );
      
        if (!Array.isArray(data)) return;

        setUserCourses(data);

      } catch (error) {
        console.error("Error fetching courses:", error);
        setUserCourses([]);
      }
    };
    fetchCourses();
  }, [authReady, token, user, courses]);

  const handleSelectCourse = (course) => {
    navigation.navigate("Course", { course });
  };

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
          paddingTop: 15
        }}
      >
        <View style={{
            flexDirection: "row", 
            columnGap: 15, 
            flex: 1,
            justifyContent: "center",
            alignItems: "center", 
          }}>
          <Text style={[textStyles.title, { color: colors.violet }]}>
            My courses DEV
          </Text>
          <MaterialIcons 
            name="add" size={50} 
            color={colors.orange} 
            style={{ position: "absolute", right: 15, bottom: 5 }}
            onPress={() => navigation.navigate('ChooseLanguage')}
          />
        </View>
        
        {userCourses.map((course) => (
          <CourseCard 
            key={course.course} 
            course={course} 
            handleSelectCourse={() => handleSelectCourse(course)} 
          />
        ))}
        
      </ScrollView>
      {/* navbar */}
      <View style={layout.navbarWrapper}>
        <Navbar user={user} navigation={navigation} />
      </View>
    </View>
  );
};

export default HomeScreen;