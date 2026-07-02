import { View, Pressable, Text, Image } from 'react-native';
import { layout, colors, textStyles } from "../constants/layout";
import { getImageUrl } from "../utils/apiClient";

const CourseCard = ({ course, handleSelectCourse }) => {
    return (
        <Pressable
            onPress={handleSelectCourse} 
            style={[layout.cardWrapper, layout.shadowStyle]}>
            <View style={{ flexDirection: "row", columnGap: 15, alignItems: "center", marginVertical: 5 }}>
                <Image 
                    source={{ uri: getImageUrl(course.flag_path) }}
                    style={layout.flagImage}
                />
                <Text style={[textStyles.default, { fontSize: 25 }]}>{course.studyLanguage}</Text>
            </View>
            <View style={{ flexDirection: "row", columnGap: 15, alignItems: "center", marginVertical: 5 }}>
                <Image 
                    source={{ uri: getImageUrl(course.flag_path) }}
                    style={layout.flagImage}
                />
                <Text style={[textStyles.default, { fontSize: 25 }]}>{course.translationLanguage}</Text>
            </View>
            <View style={{flexDirection: "row" }}>
                <Text>Completed categories: </Text>
                <Text>{course.completedCategories} / </Text>
                <Text>{course.totalCategories}</Text>
            </View>
            
            <Text>Completed: {course.percent}/100 %</Text>
        </Pressable>
    )
}

export default CourseCard;
// "course": 34,
//     "studyLanguage": "Ukrainian",
//     "translationLanguage": "Finnish",
//     "currentCategory": "Family",
//     "totalScore": 0,
//     "totalCategories": 5,
//     "completedCategories": 0,
//     "percent": 0