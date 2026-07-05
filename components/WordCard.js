import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "../constants/layout";
import { playSound } from "../utils/soundUtils";
import { getSoundUrl } from "../utils/apiClient";

const WordCard = ({
  word,
  selected,
  onPress,
  matched
}) => {
  const soundFile = word.study_sound;

  const handlePress = () => {
    onPress(word);
    playSound(getSoundUrl(soundFile));
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        { opacity: pressed ? 0.7 : 1 },
        { opacity: matched ? 0.3 : 1 },
      ]}
    >
      <View
        style={[
          styles.wordCard,
          {
            borderWidth: selected ? 3 : 2,
            backgroundColor: selected ? colors.lightgreen : "#fff",
          },
        ]}
      >
        <Text>{word.study}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wordCard: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: 75,
    marginBottom: 5,
    borderRadius: 15,
    borderColor: colors.secondary,
  },
});

export default WordCard;
