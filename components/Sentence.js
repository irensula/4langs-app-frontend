import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import ImageCard from './ImageCard';
import AntDesign from '@expo/vector-icons/AntDesign';
import { layout, colors, spacing, textStyles } from '../constants/layout';
import { playUISound } from "../utils/soundUtils";

const Sentence = ({ 
        contentId,
        image,
        studyText,
        translationText,
        studySound,
        translationSound 
    }) => {
        
    const correctAnswer = sentence?.answer?.trim().toLowerCase() || '';
    const fullSentence = sentence?.sentence || "";
    
    const parts = fullSentence.split('{{answer}}');

    // const isCorrect = value && value.trim().toLowerCase() === correctAnswer;

    // const playedRef = useRef(false);
    // useEffect(() => {
    //     if (isCorrect && !playedRef.current) {
    //         playedRef.current = true;
    //         playUISound("correct");
    //     }

    //     if (!isCorrect) {
    //         playedRef.current = false;
    //     }
    // }, [isCorrect]);

    return (
        <View style={{flexDirection: 'row', alignItems: 'center' }}>
            <ImageCard source={image} />
        <View style={styles.sentence}>
            <Text style={styles.text}>{parts[0]}</Text>

            <TextInput 
                // value={value}
                onChangeText={onChange}
                style={styles.input}
            />

            <Text style={styles.text}>{parts[1]}</Text>

        </View>
        
            <AntDesign name="check-circle" size={24} color={colors.primary} />    
        </View>
    )
}

const styles = StyleSheet.create({
    sentence: {
        flex: 1, 
        flexWrap: 'wrap', 
        flexDirection: 'row', 
        flexShrink: 1, 
    },
    text: {
        marginBottom: 10, 
        fontFamily: 'ABeeZee'
    },
    input: {
        borderBottomWidth: 1,
        paddingHorizontal: 5,
        width: 80,
        marginHorizontal: 4,
        borderBottomColor: colors.violet,
        borderBottomWidth: 2,
        marginBottom: 10,
        fontFamily: 'ABeeZee'
    }
})

export default Sentence;