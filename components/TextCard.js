import { View, Text, Image } from 'react-native';
import { layout, textStyles, spacing, colors } from '../constants/layout';
import { getImageUrl } from "../utils/apiClient";

const TextCard = ({ texts, selectedLanguage  }) => {
    const textMap = {
        ru: texts.text_ru,
        fi: texts.text_fi,
        en: texts.text_en,
        ua: texts.text_ua,
    }
    return (
        <View>
            <Image 
                source={{ uri: getImageUrl(texts.text_image) }}
                style={{ width: '100%', aspectRatio: 16/15, marginVertical: 15 }}
                resizeMode='cover'
            />
            <Text style={[textStyles.default, { lineHeight: 30 }]}>{textMap[selectedLanguage]}</Text>
        </View>
    )
}

export default TextCard;