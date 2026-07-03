import { useNavigation } from "@react-navigation/native";
import { Pressable } from 'react-native';

import { colors } from '../constants/layout';

import Ionicons from '@expo/vector-icons/Ionicons';

const BackButton = () => {
    const navigation = useNavigation();

    return (
        <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-circle" size={40} color={colors.secondary} />
        </Pressable>
    )
}

export default BackButton;