import { Pressable } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import { colors } from '../constants/layout';

const BackButton = ({ navigation }) => {
    return (
        <Pressable onPress={() => navigation.goBack()}>
            <Entypo name="chevron-left" size={32} color={colors.secondary} />
        </Pressable>
    )
}

export default BackButton;