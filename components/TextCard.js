import { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, Image, StyleSheet, Animated, Easing } from "react-native";
import { playSound, pauseSound, resumeSound } from "../utils/soundUtils";
import { getSoundUrl, getImageUrl } from "../utils/apiClient";

import { layout, textStyles, colors } from '../constants/layout';
import AntDesign from "@expo/vector-icons/AntDesign";

const TextCard = ({ 
        contentId, 
        image, 
        studyTitle, 
        studyText, 
        translationTitle, 
        translationText, 
        studySound, 
        translationSound,
        handleComplete 
    }) => {
    
    const [showTranslation, setShowTranslation] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSound, setCurrentSound] = useState(null);
  
    const handlePress = async () => {
        const sound = showTranslation
            ? translationSound
            : studySound;

        const soundUrl = getSoundUrl(sound);

        if (currentSound !== soundUrl) {
            await playSound(soundUrl, {
                onEnd: !showTranslation ? handleComplete : undefined,
                onStatusUpdate: (status) => {
                    if (status.didJustFinish) {
                        setIsPlaying(false); 
                    }
                },
            });
            setCurrentSound(soundUrl);
            setIsPlaying(true);
            return;
        }

        if (isPlaying) {
            pauseSound();
            setIsPlaying(false);
        } else {
            resumeSound();
            setIsPlaying(true);
        }
    };
    // user taps text card
    useEffect(() => {
        resetCard();
    }, [contentId]);

    const resetCard = () => {
        animateCard();
        setShowTranslation(false);
        setCurrentSound(null);
        setIsPlaying(false);
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
            toValue: 1.1,
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

    return (
        <Animated.View style={[styles.wrapper, {
            backgroundColor: showTranslation
                ? colors.lightblue
                : colors.lightorange, 
            transform: [{ scale: cardScale }] }]}>
            <Pressable style={styles.studyCard} onPress={handleShowTranslation} >
                <Text style={[textStyles.subtitle, { 
                                textTransform: "uppercase", 
                                fontWeight: 800,
                                color: showTranslation
                                    ? colors.blue
                                    : colors.orange  
                                }
                            ]}>
                    {showTranslation ? translationTitle : studyTitle}
                </Text>

                <Image 
                    source={{ uri: getImageUrl(image) }}
                    style={styles.largeImage}
                    resizeMode='cover'
                /> 

                <View style={styles.textWrapper}>
                    <Text style={styles.text}>
                    {showTranslation ? translationText : studyText}
                    </Text>
                </View>

                <Pressable
                    style={layout.playButton}
                    onPress={handlePress}
                >
                    <AntDesign 
                        name={isPlaying ? "pause-circle" : "play-circle"} 
                        size={26} 
                        color={colors.white} 
                    />
                    <Text style={layout.playButtonText}> 
                        {isPlaying ? "Pause" : "Play"}
                    </Text>
                </Pressable>   
            </Pressable>
        </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: "center",
    alignItems: "center",
    height: "auto",
    marginBottom: 5,
    padding: 20,
    width: "100%"
  },
  studyCard: {
    width: "100%"
  },
  largeImage: {
    width: "100%",
    aspectRatio: 1/1,
    marginBottom: 5, 
    borderRadius: 10
  },
  textWrapper: {
    alignContent: "stretch",
    marginVertical: 15,
  },
  text: {
    fontSize: 18,
    lineHeight: 28
  }
});

export default TextCard;