import { View, Pressable, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../constants/layout';

const NextArrow = ({ handleNext }) => {
    return (
        <View>
            <Pressable 
                onPress={handleNext}
                style={styles.iconWrap}    
            >
                <Text style={styles.icon}>
                    <Ionicons name="arrow-forward-circle" size={42} color={colors.secondary} />
                </Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    iconWrap: {
        alignItems: 'flex-end',
        marginBottom: 10,
        marginRight: 10,
    }
})

export default NextArrow;