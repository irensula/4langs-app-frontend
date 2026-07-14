import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Image } from 'react-native';
import { getImageUrl } from "../utils/apiClient";
import { layout, colors, textStyles } from '../constants/layout';

const Sentence = ({ 
        contentId,
        image,
        studyText,
        translationText,
        studySound,
        translationSound,
        answer,
        value,
        checked,
        isCorrect,
        onChange
    }) => {
    // split sentence into two parts around the gap
    const parts = studyText.split('{{answer}}');  
    // input colors after checking answer
    const inputBackground = !checked
        ? colors.lightviolet
        : isCorrect
            ? colors.lime
            : colors.lightred;

    const inputBorder = !checked
        ? colors.violet
        : isCorrect
            ? colors.secondary
            : colors.red;

    return (
        <View style={{ alignItems: 'center' }}>
            <Image source={{ uri: getImageUrl(image) }} style={styles.image} />
            
            <View style={styles.sentence}>
                <Text style={styles.text}>{parts[0]}</Text>

                <TextInput 
                    value={value}
                    onChangeText={(text) => onChange(text)} // Update user's answer
                    style={[styles.input, 
                        {
                            backgroundColor: inputBackground,
                            borderBottomColor: inputBorder,
                        }]}
                />

                <Text style={styles.text}>{parts[1]}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    image: {
        width: "100%",
        aspectRatio: 1/1,
        borderWidth: 3,
        borderRadius: 15,
        borderColor: colors.secondary,
        marginVertical: 5
    },
    sentence: {
        flex: 1, 
        flexWrap: 'wrap', 
        flexDirection: 'row', 
        flexShrink: 1, 
        paddingTop: 10,
        alignItems: "center",
        justifyContent: "center"
    },
    text: {
        fontFamily: 'ABeeZee',
        fontSize: 18
    },
    
    input: {
        minWidth: 80,
        width: "auto",
        height: 40,
        paddingHorizontal: 5,
        marginHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomWidth: 2,
        textAlign: "center",
        fontFamily: 'ABeeZee'
    }
})

export default Sentence;