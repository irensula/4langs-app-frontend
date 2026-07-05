import { View, Text, Image, Pressable, StyleSheet } from "react-native";

import { playSound } from "../utils/soundUtils";
import { getImageUrl, getSoundUrl } from "../utils/apiClient";

import { layout, colors } from "../constants/layout";

import AntDesign from "@expo/vector-icons/AntDesign";

const WordListCard = ({ word, playingPart }) => {
  return (
    <View style={styles.rowWrapper}>
        <Image
          source={{ uri: getImageUrl(word.image_path) }}
          style={layout.image}
          resizeMode="cover"
        />
      
        <View style={{ flex: 1 }}>
          <View style={[styles.row, playingPart === "study" && styles.playing ]}>
            <Text style={{ flex: 1, padding: 5 }}>{word.study}</Text>
            <Pressable
              onPress={() => playSound(getSoundUrl(word.study_sound))}
              style={{ flex: 1, alignItems: "center" }}
            >
              <AntDesign name="play-circle" size={24} color={colors.darkorange} />
            </Pressable>
          </View>
              
          <View style={[styles.row, playingPart === "translation" && styles.playing ]}>
            <Text style={{ flex: 1, padding: 5 }}>{word.translation}</Text>
            <Pressable
              onPress={() => playSound(getSoundUrl(word.translation_sound))}
              style={{ flex: 1, alignItems: "center" }}
            >
              <AntDesign name="play-circle" size={24} color={colors.darkorange} />
            </Pressable>
          </View>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 3,
    marginLeft: 15,
  },
  playing: {
    backgroundColor: colors.primary,
}
});

export default WordListCard;
