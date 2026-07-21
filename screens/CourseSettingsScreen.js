import { useEffect, useState, useContext } from "react";
import { ScrollView, View, Text, Pressable, Image, StyleSheet } from "react-native";
import { Dropdown } from 'react-native-element-dropdown'

import { AuthContext } from "../utils/AuthContext";
import { api } from "../utils/apiClient";

import Navbar from "../components/Navbar"; 
import MessageModal from "../components/MessageModal";
import LanguageDropdown from "../components/LanguageDropdown";

import { layout, textStyles, colors } from "../constants/layout";

const CourseSettingsScreen = ({ route, navigation }) => {
    const { token, refreshSession } = useContext(AuthContext);

    const { course } = route.params;
    const courseId = course.course;

    const [translationLanguages, setTranslationLanguages] = useState([]);
    const [translationLanguage, setTranslationLanguage] = useState(course.translationLanguageId);

    const [modal, setModal] = useState({
        visible: false,
        type: "message",
        title: "",
        message: "",
    });

    // get translation languages
    useEffect(() => {
        const fetchLanguages = async () => {
        
            if (!token) return;

            try {
                const data = await api.get(
                    `/languages`,
                    token
                );

                if (!Array.isArray(data)) return;
                
                setTranslationLanguages(data);

            } catch (error) {
                console.error("Error fetching languages:", error);
            }
        };
        
        fetchLanguages();
    }, [token]);

    const availableLanguages = translationLanguages
        .filter(lang => lang.language_id !== course.studyLanguageId)
        .map(lang => ({
            ...lang,
            disabled: lang.language_id === translationLanguage,
    }));
    // change translation language
    const handleChangeTranslationLanguage = async (selectedLanguage) => {
        if (!selectedLanguage.language_id || !token ) return;

        try {
            // close confirm
            setModal(prev => ({
            ...prev,
                visible: false,
            }));
            await api.put(
                `/courses/${courseId}`,
                {
                    translation_language_id: selectedLanguage.language_id
                },
                token
            );
            setTranslationLanguage(selectedLanguage.language_id);
            await refreshSession();

            setModal({
                visible: true,
                type: "message",
                title: "",
                message: "Translation language updated!",
                confirmText: "OK",
            });            
            
        } catch (error) {
           setModal({
                visible: true,
                type: "message",
                message:
                    error.response?.error ??
                    "Failed to change translation language",
                confirmText: "OK",
            });
        }
    }
    // confirm changing translation language
    const confirmChangeTranslationLanguage = (selectedLanguage) => {
        setModal({
            visible: true,
            type: "confirm",
            title: "Change translation language",
            message: `Change translation language to ${selectedLanguage.name}?`,
            confirmText: "Change",
            cancelText: "Cancel",
            onConfirm: () => handleChangeTranslationLanguage(selectedLanguage),
        });
    };
    // delete course
    const handleDelete = async () => {
        try {
            if (!token) {
                setModal({
                    visible: true,
                    type: "message",
                    message: "User is not authorized",
                    confirmText: "OK",
                });
                return;
            }
            
            await api.delete(`/courses/${courseId}`, token);

            setModal({
                visible: true,
                type: "message",
                title: "",
                message: "You deleted the course!",
                confirmText: "OK",
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
            setModal({
                visible: true,
                type: "message",
                message: "Network error",
                confirmText: "OK",
            });
        }
    }
    // confirm deleting course
    const confirmDelete = () => {
        setModal({
            visible: true,
            type: "confirm",
            title: "Delete course",
            message: "Are you sure you want to delete this course?",
            confirmText: "Delete",
            cancelText: "Cancel",
            onConfirm: handleDelete,
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
                confirmText={modal.confirmText}
                cancelText={modal.cancelText}
                onConfirm={modal.onConfirm}
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
                    <Text style={[textStyles.title, { color: colors.violet, fontSize: 30 }]}>
                            Course Settings
                        </Text>
                    <View style={[layout.formContainer, layout.shadowStyle]}>

                        <View style={layout.menuItem}>
                            <Text style={layout.menuText}>Study language</Text>
                            <Text style={layout.menuText}>{course.studyLanguage}</Text>
                        </View>

                        <View style={layout.settingsItem}>
                            <Text style={layout.menuText}>Change translation language</Text>

                            <LanguageDropdown 
                                data={availableLanguages}
                                value={translationLanguage}
                                onSelect={confirmChangeTranslationLanguage}
                                disableItem={(item) => item.disabled}
                                placeholder = "Change translation language"
                            />
                        </View>

                        <View style={layout.menuItem}>
                            <Text style={layout.menuText}>              
                                Delete course
                            </Text>
                            <Pressable 
                                style={styles.deleteButton}
                                onPress={confirmDelete}
                            >
                                <Text style={[layout.menuText, { color: colors.white }]}>              
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
  deleteButton: {
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: colors.red
  },
});

export default CourseSettingsScreen;