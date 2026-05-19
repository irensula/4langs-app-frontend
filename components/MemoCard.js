import { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { playSound } from '../utils/soundUtils';
import { layout, colors, spacing, textStyles } from '../constants/layout';
import { getImageUrl, getSoundUrl } from "../utils/apiClient";

const MemoCard = ({ memoCards, index, isOpened, isMatched, onPress, selectedLanguage }) => {

    const wordMap = {
        en: memoCards.value_en,
        fi: memoCards.value_fi,
        ua: memoCards.value_ua,
        ru: memoCards.value_ru
    }
    const soundMap = {
        en: memoCards.sound_en,
        fi: memoCards.sound_fi,
        ua: memoCards.sound_ua,
        ru: memoCards.sound_ru
    };
    
    const displayedWord = wordMap[selectedLanguage];
    const soundFile = soundMap[selectedLanguage];  

    useEffect(() => {
        if (isOpened && !isMatched) {
            playSound(getSoundUrl(soundFile));
        }
    }, [isOpened]);

    return (
        <View>
            {isOpened || isMatched ? (
                <View style={styles.container}>
                    <Image 
                        source={{ uri: getImageUrl(memoCards.word_url) }}
                        style={styles.image}
                        resizeMode='cover'
                    />
                    <View style={styles.textWrapper}>
                        <Text style={styles.text}>{displayedWord}</Text>
                    </View>
                </View>
                ) : (
                    <Pressable onPress={(() => onPress(index))}>
                        <View style={styles.cover}></View>
                    </Pressable>
                )
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: { 
        width: 80, 
        height: 80, 
        margin: 2.5, 
        borderWidth: 2, 
        borderColor: colors.violet,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cover: { 
        width: 80, 
        height: 80, 
        backgroundColor: colors.violet, 
        margin: 2.5,
        borderRadius: 25,
        borderColor: colors.lightviolet,
        borderWidth: 2,
        position: 'relative',
    },
    image: { 
        width: '100%',
        height: '100%',  
        borderRadius: 25,
    },
    text: {
        textAlign: 'center',
        fontFamily: 'ABeeZee',
        fontSize: 12,
    },
    textWrapper: {
        position: 'absolute',
        top: 50,
        alignSelf: 'center',
        backgroundColor: colors.white,
        padding: 3,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: colors.violet,
    }
})

export default MemoCard;