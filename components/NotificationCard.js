import { View, Text, Pressable } from "react-native";
import { layout, colors } from "../constants/layout";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const NotificationCard = ({ notification, removeNotification }) => {
    return (
        <View style={layout.notification}>
            <View style={layout.notificationText}>
                <Text style={layout.notificationTitle}>{notification.title}</Text>
                <Text style={layout.notificationBody}>{notification.body}</Text>
            </View>
            <Pressable onPress={() => removeNotification(notification.notification_id)}>
                <FontAwesome5 style={layout.notificationIcon} name="broom" size={24} color={colors.red} />
            </Pressable>
        </View>
    )
}

export default NotificationCard;