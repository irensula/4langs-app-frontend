import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, textStyles, layout } from '../constants/layout';

const WordGap = ({ answer }) => {
    return (
        <View style={styles.wordWrapper}>
            <Text style={styles.text}>{answer}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    wordWrapper: {
        borderWidth: 2, 
        backgroundColor: colors.orange,
        borderColor: colors.lightorange,  
        borderRadius: 50,
        paddingVertical: 7,
        paddingHorizontal: 10,
        marginVertical: 10,
        width: 'auto',
        alignContent: 'space-between'
    }, 
    text: {
        color: colors.white,
        fontFamily: 'ABeeZee',
        fontSize: 14,
    }
})

export default WordGap;