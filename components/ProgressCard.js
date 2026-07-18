import Stars from "../components/Stars";
import { View, Text, Image, StyleSheet } from "react-native";
import { getImageUrl } from "../utils/apiClient";
import { textStyles, colors, layout } from "../constants/layout";

const ProgressCard = ({
  studyName,
  studyFlag,
  translationName,
  translationFlag,
  progressPercent, 
  categoriesDone, 
  categoriesTotal, 
  exercisesDone, 
  exercisesTotal, 
  pointsGot, 
  pointsMax, 
  currentCategory
}) => {
  return (
    <View style={[layout.cardWrapper, layout.shadowStyle]}>
      <View style={{ flexDirection: "row", columnGap: 15, alignItems: "center", marginVertical: 5 }}>
          <Image 
              source={{ uri: getImageUrl(studyFlag) }}
              style={layout.flagImage}
          />
          <Text style={[textStyles.default, { fontSize: 28, lineHeight: 31 }]}>{studyName}</Text>
      </View>
      <View style={{ flexDirection: "row", columnGap: 15, alignItems: "center", marginVertical: 5 }}>
          <Image 
              source={{ uri: getImageUrl(translationFlag) }}
              style={layout.flagImage}
          />
          <Text style={[textStyles.default, { fontSize: 28, lineHeight: 31 }]}>{translationName}</Text>
      </View>

      <Text style={styles.percents}>{progressPercent}%</Text>
      
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingVertical: 15,
          alignItems: "center",
        }}
      >
        <View style={styles.progressWrapper}>
          <Text style={styles.progressLabel}>Categories</Text>
          <Text style={styles.tasks}>
            {categoriesDone} / {categoriesTotal}
          </Text>
        </View>
        
        <View style={styles.progressWrapper}>
          <Text style={styles.progressLabel}>Points</Text>
          <Text style={styles.tasks}>
            {pointsGot} / {pointsMax}
          </Text>
        </View>
        
        <View style={styles.progressWrapper}>
          <Text style={styles.progressLabel}>Exercises</Text>
          <Text style={styles.tasks}>
            {exercisesDone} / {exercisesTotal}
          </Text>
        </View>
      </View>
      
        <Text style={{ fontSize: 14, color: colors.darkblue }}>Current category</Text>
        <Text style={{ fontSize: 25, color: colors.darkblue, fontFamily: "ABeeZee" }}>{currentCategory}</Text>
      {/* <Stars value={value} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  percents: {
    fontSize: 60,
    fontWeight: 800,
    color: colors.violet,
    alignSelf: "center"
  },
  progressWrapper: {
    flex: 1, 
    backgroundColor: colors.orange,
    padding: 12,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: colors.lightorange
  },
  progressLabel: {
    color: colors.white,
    fontSize: 14,
    marginBottom: 5
  },
  tasks: {
    fontSize: 18,
    color: colors.white
  },
});

export default ProgressCard;
