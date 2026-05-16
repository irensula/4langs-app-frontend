import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import ImageCard from './ImageCard';
import AntDesign from '@expo/vector-icons/AntDesign';
import { layout, colors, spacing, textStyles } from '../constants/layout';

const Sentence = ({ 
        sentence, 
        selectedLanguage, 
        API_BASE, 
        index, 
        value,
        onChange, 
    }) => {
        
    const correctAnswer = sentence?.[`answer_${selectedLanguage}`]?.trim().toLowerCase() || '';
    const fullSentence = sentence?.[`sentence_${selectedLanguage}`] || "";
    
    const parts = fullSentence.split('{{answer}}');

    const isCorrect = value && value.trim().toLowerCase() === correctAnswer;

    return (
        <View style={{flexDirection: 'row', alignItems: 'center' }}>
            <ImageCard 
                API_BASE={API_BASE}
                image={{ word_url: sentence.word_url }} 
            />
        <View style={styles.sentence}>
            <Text style={styles.text}>{parts[0]}</Text>

            <TextInput 
                value={value}
                onChangeText={onChange}
                style={styles.input}
            />

            <Text style={styles.text}>{parts[1]}</Text>

        </View>
        {isCorrect && 
                <AntDesign name="check-circle" size={24} color={colors.primary} />    
            }
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