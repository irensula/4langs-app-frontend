import { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, Image, StyleSheet, Animated, Easing } from "react-native";
import { playSound } from "../utils/soundUtils";
import { getSoundUrl, getImageUrl } from "../utils/apiClient";

import { layout, textStyles, colors } from '../constants/layout';
import AntDesign from "@expo/vector-icons/AntDesign";

const WordImageCard = ({ word }) => {
  const [showTranslation, setShowTranslation] = useState(false);

  const handlePress = () => {
    const sound = showTranslation
    ? word.translation_sound
    : word.study_sound;

    playSound(getSoundUrl(sound));
  };

  const handleShowTranslation = () => {
    animateWord();
    setShowTranslation(prev => !prev);
  };
  // show study (not transation on the next card)
  useEffect(() => {
    setShowTranslation(false);
  }, [word.content_id]);

  const scale = useRef(new Animated.Value(1)).current;
  const animateWord = () => {
    scale.setValue(0.9);

    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.4,
        duration: 120,
        easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable 
      onPress={handleShowTranslation}
      style={[
          styles.wordCard,
          {
            borderWidth: 3,
            backgroundColor: colors.darkorange,
          },
        ]}
    >
      <Image 
          source={{ uri: getImageUrl(word.image_path) }}
          style={[styles.largeImage, {marginBottom: 5, borderRadius: 10 }]}
          resizeMode='cover'
      /> 
        <Pressable 
          onPress={handlePress}
          style={{ flexDirection: "row", width: 200, justifyContent: "flex-start", columnGap: 15 }}
        >
          <AntDesign name={"play-circle"} size={24} color={colors.white} />
          <Animated.Text style={[
              textStyles.subtitle,
              {
                transform: [{ scale }],
              },
            ]}>
            {showTranslation ? word.translation : word.study}
          </Animated.Text>
        </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wordCard: {
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
    aspectRatio: 1/1,
    marginBottom: 5,
    borderRadius: 15,
    borderColor: colors.orange,
  },
  largeImage: {
    width: 200,
    height: 200,
  }
});

export default WordImageCard;