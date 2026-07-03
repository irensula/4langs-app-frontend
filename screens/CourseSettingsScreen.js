import { useEffect, useState, useContext } from "react";
import { ScrollView, View, Text, Pressable, Alert, StyleSheet } from "react-native";

import { AuthContext } from "../utils/AuthContext";
import { api } from "../utils/apiClient";

import Navbar from "../components/Navbar"; 
import MessageModal from "../components/MessageModal";

import { layout, textStyles, colors } from "../constants/layout";

const CourseSettingsScreen = ({ route, navigation }) => {
    const { courseId } = route.params;
    const { token, refreshSession } = useContext(AuthContext); 
    
    const [modalVisible, setModalVisible] = useState(false);
    const [modal, setModal] = useState({
        visible: false,
        type: "message",
        title: "",
        message: "",
    });

    const handleDelete = async () => {
        try {
            if (!token) {
                setModalMessage('Käyttäjän on oltava valtuutettu');
                setModalVisible(true);
                return;
            }
            
            const response = await api.delete(
                `/courses/${courseId}`, 
                token
            );

            setModal({
                visible: true,
                type: "message",
                title: "",
                message: "You deleted the course!",
            });
                    
            setTimeout(async () => {
                await refreshSession();

                setModal(prev => ({
                    ...prev,
                    visible: false,
                }));

                navigation.reset({
                    index: 0,
                    routes: [{ name: "Home" }],
                });
            }, 3000); 

        } catch (err) {
            console.error(err);
            setModalType("message");
            setModalMessage('Network error');
            setModalVisible(true);
        }
    }

    const confirmDelete = () => {
        setModal({
            visible: true,
            type: "confirm",
            title: "Delete course",
            message: "Are you sure you want to delete this course?",
        });
    };

    return (
        <View
            style={[
                layout.screen,
                { paddingHorizontal: 10, backgroundColor: colors.primary },
            ]}
        >
            <MessageModal
                visible={modal.visible}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
                onClose={() =>
                    setModal(prev => ({
                        ...prev,
                        visible: false,
                    }))
            }
            />

            <ScrollView
                contentContainerStyle={{
                backgroundColor: colors.primary,
                paddingBottom: 80,
                }}
            >
                <View style={layout.container}>
                    <View style={[layout.formContainer, layout.shadowStyle]}>
                        <Text style={[textStyles.title, { color: colors.secondary, fontSize: 30 }]}>
                            Course Settings
                        </Text>

                        <View style={styles.menuItem}>
                            <Text style={styles.menuText}>              
                                Delete course
                            </Text>
                            <Pressable 
                                style={styles.deleteButton}
                                onPress={confirmDelete}
                            >
                                <Text style={[styles.menuText, { color: colors.white }]}>              
                                    Delete
                                </Text>
                            </Pressable>
                        </View>   
                    </View>
                    
                </View>
            </ScrollView>
            
            <View style={layout.navbarWrapper}>
                <Navbar navigation={navigation} />
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: "center"
  },

  menuText: {
    fontSize: 16,
    fontWeight: "500",
  },

  deleteButton: {
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: colors.red
  }
});

export default CourseSettingsScreen;