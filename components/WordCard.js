import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "../constants/layout";
import { playSound } from "../utils/soundUtils";

const WordCard = ({
  word,
  selected,
  onPress,
  matched,
  API_BASE,
  selectedLanguage,
}) => {
  const soundFile = word[`sound_${selectedLanguage}`];

  const handlePress = () => {
    onPress(word);
    playSound(soundFile, API_BASE);
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
        <Text>{word.value}</Text>
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
