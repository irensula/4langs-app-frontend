import { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, Image, StyleSheet, Animated, Easing } from "react-native";
import { playSound } from "../utils/soundUtils";
import { getSoundUrl, getImageUrl } from "../utils/apiClient";

import { layout, textStyles, colors } from '../constants/layout';
import AntDesign from "@expo/vector-icons/AntDesign";

const StudyCard = ({ contentId, image, studyText, translationText, studySound, translationSound }) => {
  const [showTranslation, setShowTranslation] = useState(false);

  const handlePress = () => {
    animateText();

    const sound = showTranslation
    ? translationSound
    : studySound;

    playSound(getSoundUrl(sound));
  };

  const handleShowTranslation = () => {
    animateCard();
    setShowTranslation(prev => !prev);
  };

  // show study (not transation on the next card)
  useEffect(() => {
    setShowTranslation(false);
  }, [contentId]);

  const cardScale = useRef(new Animated.Value(1)).current;
  const animateCard = () => {
    cardScale.setValue(0.9);

    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 1.15,
        duration: 120,
        easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const textScale = useRef(new Animated.Value(1)).current;
  const animateText = () => {
    textScale.setValue(0.95);

    Animated.sequence([
      Animated.timing(textScale, {
        toValue: 1.08,
        duration: 120,
        easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        useNativeDriver: true,
      }),
      Animated.timing(textScale, {
        toValue: 1,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View style={[styles.wrapper, {
      backgroundColor: showTranslation
            ? colors.blue
            : colors.orange, 
          transform: [{ scale: cardScale }] }]}>
      <Pressable style={styles.studyCard} onPress={handleShowTranslation} >
        
        <Image 
            source={{ uri: getImageUrl(image) }}
            style={styles.largeImage}
            resizeMode='cover'
        /> 

        <Animated.View style={{ transform: [{ scale: textScale }] }}>
          <Pressable
            onPress={handlePress}
            style={styles.studyText}
          >
            <AntDesign
              name="play-circle"
              size={24}
              color={colors.white}
              style={{ paddingTop: 3 }}
            />

            <Text style={styles.cardSubtitle}>
              {showTranslation ? translationText : studyText}
            </Text>
          </Pressable>
        </Animated.View>
          
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 15,
  },
  studyCard: {
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
    height: "auto",
    marginBottom: 5,
    padding: 20
  },
  largeImage: {
    width: "100%",
    aspectRatio: 1/1,
    marginBottom: 5, 
    borderRadius: 10
  },
  studyText: {
    flexDirection: "row", 
    columnGap: 15,
    width: "100%", 
    marginTop: 10,
    alignContent: "flex-start"
  },
  cardSubtitle: {
    flexShrink: 1,
    color: colors.white,
    fontSize: 20,
    fontFamily: "ABeeZee"
  }
});

export default StudyCard;