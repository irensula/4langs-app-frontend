import { View, Image, Pressable } from 'react-native';
import { layout } from '../constants/layout';

const ImageCard = ({ image, API_BASE, selected, onPress, matched }) => {
    return (
        <Pressable onPress={onPress} style={({ pressed }) => [
                { opacity: pressed ? 0.7 : 1 },
                { opacity: matched ? 0.3 : 1 },
            ]}>

            <View>
                <Image 
                    source={{ uri: `${API_BASE}${image.word_url}` }}
                    style={[layout.image, {marginBottom: 5, borderWidth: selected ? 3 : 2 }]}
                    resizeMode='cover'
                /> 
            </View>      
        </Pressable>
    )
}

export default ImageCard;