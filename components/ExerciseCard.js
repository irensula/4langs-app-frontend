import { Text, View, Pressable, StyleSheet } from "react-native";
import Svg, { Rect, Polygon, Path, G } from "react-native-svg";
import AntDesign from '@expo/vector-icons/AntDesign';
import { layout, colors, textStyles, spacing } from "../constants/layout";

const ExerciseCard = ({ exercise, onSelect }) => {
  //   {
  //   "exercise_id": 1,
  //   "name": "MemoGame",
  //   "max_score": 5,
  //   "score": 5,
  //   "isCompleted": true
  // },
  
  return (
    <View style={{ width: "90%" }}>   
          <Pressable 
            style={styles.exercise}
            onPress={() => onSelect(exercise)}
          >
            <Text style={textStyles.subtitle}>
              {exercise.name}
            </Text>
            
            {exercise.isCompleted === true && (
              <AntDesign name="star" size={35} color={colors.yellow} />)}
          </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  exercise: {
    padding: 10,
    backgroundColor: colors.violet,
    marginBottom: 5,
    borderColor: colors.lightviolet,
    borderWidth: 2,
    borderRadius: 25,
    alignItems: "center",
  },
});

export default ExerciseCard;