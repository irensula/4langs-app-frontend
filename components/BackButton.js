import { useNavigation } from "@react-navigation/native";
import { Pressable } from 'react-native';

import { colors } from '../constants/layout';

import Entypo from '@expo/vector-icons/Entypo';

const BackButton = () => {
    const navigation = useNavigation();

    return (
        <Pressable onPress={() => navigation.goBack()}>
            <Entypo name="chevron-left" size={32} color={colors.secondary} />
        </Pressable>
    )
}

export default BackButton;