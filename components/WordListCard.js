import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { playSound } from "../utils/soundUtils";
import AntDesign from "@expo/vector-icons/AntDesign";
import LANG_KEYS from "../constants/langKeys";
import { layout, colors } from "../constants/layout";

const WordListCard = ({ word, API_BASE }) => {
  return (
    <View style={styles.rowWrapper}>
      {word.word_url && (
        <Image
          source={{ uri: `${API_BASE}${word.word_url}` }}
          style={layout.image}
          resizeMode="cover"
        />
      )}
      <View style={{ flex: 1 }}>
        {LANG_KEYS.map(({ key }) => {
          const value = word[`value_${key}`];
          const soundFile = word[`sound_${key}`];
          return (
            <View
              key={key}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 3,
                marginLeft: 15,
              }}
            >
              <Text style={{ flex: 1, padding: 5 }}>{value}</Text>
              {soundFile && (
                <Pressable
                  onPress={() => playSound(soundFile, API_BASE)}
                  style={{ flex: 1, alignItems: "center" }}
                >
                  <AntDesign
                    name="play-circle"
                    size={24}
                    color={colors.darkorange}
                  />
                </Pressable>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rowWrapper: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingLeft: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
});

export default WordListCard;
