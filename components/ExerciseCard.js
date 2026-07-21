import { Text, View, Pressable, StyleSheet } from "react-native";
import Svg, { Rect, Polygon, Path, G } from "react-native-svg";
import AntDesign from '@expo/vector-icons/AntDesign';
import { layout, colors, textStyles, spacing } from "../constants/layout";

const ExerciseCard = ({ exercise, onSelect }) => {  
  return (   
      <Pressable 
        style={styles.exercise}
        onPress={() => onSelect(exercise)}
      >
        <Text style={[textStyles.subtitle, { fontSize: 18 }]}>
          {exercise.name}
        </Text>
        
        {exercise.isCompleted === true && (
          <AntDesign name="star" size={35} color={colors.yellow} />)}
      </Pressable>
  );
};

const styles = StyleSheet.create({
  exercise: {
    justifyContent: "center",
    minHeight: 110,
    padding: 10,
    backgroundColor: colors.orange,
    marginBottom: 5,
    borderColor: colors.lightorange,
    borderWidth: 2,
    borderRadius: 25,
    alignItems: "center",
    width: "47%"
  },
});

export default ExerciseCard;