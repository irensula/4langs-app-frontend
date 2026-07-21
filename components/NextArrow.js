import { Pressable, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, textStyles } from '../constants/layout';

const NextArrow = ({ handleNext }) => {
    return (
            <Pressable 
                onPress={handleNext}
                style={styles.iconWrap}    
            >
                <Text style={textStyles.formButtonText}>Next</Text>
                <Ionicons name="arrow-forward-circle" size={35} color={colors.white} />
            </Pressable>
    )
}

const styles = StyleSheet.create({
    iconWrap: {
        flexDirection: "row",
        columnGap: 10,
        backgroundColor: colors.secondary,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "flex-end",
        marginVertical: 15,
        marginRight: 15,
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 50
    }
})

export default NextArrow;