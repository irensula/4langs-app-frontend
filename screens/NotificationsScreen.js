import { useCallback, useContext, useEffect } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { NotificationContext } from "../context/NotificationContext";
import NotificationCard from "../components/NotificationCard";
import Navbar from "../components/Navbar";
import { layout, textStyles, colors } from "../constants/layout";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const NotificationsScreen = ({ navigation }) => {
    const {notifications, removeNotification, clearNotifications, markNotificationsAsRead} = useContext(NotificationContext);

    useEffect(() => {
        markNotificationsAsRead();
    }, [markNotificationsAsRead]);

    return (
        <View
            style={[
                layout.screen,
                { paddingHorizontal: 10, backgroundColor: colors.primary },
            ]}
        >
            <ScrollView
                contentContainerStyle={{
                backgroundColor: colors.primary,
                paddingBottom: 80,
                 flexGrow: 1
                }}>
                <View style={layout.container}>
                    <Text style={[textStyles.title]}>
                        Notifications
                    </Text>

                    {notifications.length > 0 ? (
                        <Pressable 
                            onPress={clearNotifications}
                            style={layout.deleteButton}
                        >
                            <FontAwesome5 name="broom" size={15} color={colors.white} />
                            <Text style={{ color: colors.white, textAlign: "right", fontSize: 16 }}>
                                Clear all
                            </Text>
                        </Pressable>
                    ) : (
                    <View style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        <Text style={{ color: colors.white, fontSize: 14 }}>There is no notifications yet</Text>
                    </View>)}

                    <View>
                        {notifications.map((notification) => (
                            <NotificationCard 
                                key={notification.notification_id}
                                notification={notification}
                                removeNotification={removeNotification}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>
            {/* NAVBAR */}
            <View style={layout.navbarWrapper}>
                <Navbar navigation={navigation} />
            </View>
    </View>
    )
};

export default NotificationsScreen;