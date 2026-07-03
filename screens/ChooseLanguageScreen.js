import { useState, useEffect, useContext } from "react";
import { View, Text, Pressable, ScrollView, Image } from "react-native";

import { AuthContext } from "../utils/AuthContext";
import { api, getImageUrl } from "../utils/apiClient";

import { layout, textStyles } from "../constants/layout";

import BackButton from "../components/BackButton";
import Navbar from "../components/Navbar";
import MessageModal from "../components/MessageModal";

const ChooseLanguageScreen = ({ navigation }) => {
    const { token, refreshSession } = useContext(AuthContext);
    // languages list
    const [languages, setLanguages] = useState([]);
    const [translationLanguages, setTranslationLanguages] = useState([]);
    // chosen course
    const [studyLanguage, setStudyLanguage] = useState(null);
    const [translationLanguage, setTranslationLanguage] = useState(null);
    // messages
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    
    useEffect(() => {
        const fetchLanguages = async () => {
        
            if (!token) return;

            try {
                const data = await api.get(
                    `/languages`,
                    token
                );

                if (!Array.isArray(data)) return;
                
                setLanguages(data.slice(0, 3));
                setTranslationLanguages(data);

            } catch (error) {
                console.error("Error fetching languages:", error);
            }
        };
        
        fetchLanguages();
    }, [token]);

    const handleCreateCourse = async () => {
        if (!studyLanguage || !translationLanguage || !token ) return;

        try {
            await api.post(
                `/courses`,
                {
                    language_id: studyLanguage,
                    translation_language_id: translationLanguage
                },
                token
            );
            await refreshSession();

            setModalMessage("You created the course!");
            setModalVisible(true);

            setTimeout(() => {
                navigation.replace("Home");
            }, 3000);

        } catch (error) {
            setModalMessage(error.response?.error || "Failed to create course");
            setModalVisible(true);

            setTimeout(() => {
                setModalMessage("");
                setMessageType("");
            }, 3000);
                }
    }

    return (
        <View style={layout.screen}>
            <MessageModal
                visible={modalVisible}
                message={modalMessage}
                onClose={() => setModalVisible(false)}
            />

            <ScrollView contentContainerStyle={[layout.scrollContent, { margin: 10 }]}>
                <BackButton />

                <Text style={textStyles.subtitle}>Choose language to study</Text>
                {languages.map((lang) => (
                    <Pressable 
                        key={lang.language_id}
                        onPress={() => setStudyLanguage(lang.language_id)}
                        style={layout.langWrap}
                    >
                        <Image 
                            source={{ uri: getImageUrl(lang.flag_path) }}
                            style={layout.flagImage}
                            
                        />
                        <Text>
                            {lang.name}{studyLanguage === lang.language_id ? "✓" : ""}
                        </Text>
                    </Pressable>
                ))}
                <Text style={textStyles.subtitle}>Choose translation language</Text>
                {translationLanguages.map((lang) => (
                    <Pressable 
                        key={lang.language_id}
                        onPress={() => setTranslationLanguage(lang.language_id)} 
                        style={layout.langWrap}   
                    >
                        <Image 
                            source={{ uri: getImageUrl(lang.flag_path) }}
                            style={layout.flagImage}
                        />
                        <Text>
                            {lang.name}{translationLanguage === lang.language_id ? "✓" : ""}
                        </Text>
                    </Pressable>
                ))}

                <Pressable 
                    disabled={!studyLanguage || !translationLanguage}
                    onPress={handleCreateCourse}
                    style={layout.formButton}
                >
                    <Text style={textStyles.formButtonText}>Choose!</Text>
                </Pressable>
                
            </ScrollView>
      
            <View style={layout.navbarWrapper}>
                <Navbar navigation={navigation} />
            </View>
    </View>
    )
}

export default ChooseLanguageScreen;