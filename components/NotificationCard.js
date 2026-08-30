import { View, Text, Pressable } from "react-native";
import { layout, colors } from "../constants/layout";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const NotificationCard = ({ notification, removeNotification }) => {
    return (
        <View style={layout.notification}>
            <View>
                <Text style={{ fontWeight: "700" }}>{notification.title}</Text>
                <Text>{notification.body}</Text>
            </View>
            <Pressable onPress={() => removeNotification(notification.notification_id)}>
                <FontAwesome5 name="broom" size={24} color={colors.red} />
            </Pressable>
        </View>
    )
}

export default NotificationCard;