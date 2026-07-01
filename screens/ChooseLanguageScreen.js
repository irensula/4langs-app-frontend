import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../utils/AuthContext";
import { api } from "../utils/apiClient";
import { View, Text, Pressable } from "react-native";
import { layout } from "../constants/layout";
import Sentence from "../components/Sentence";
import Navbar from "../components/Navbar";

const ChooseLanguageScreen = ({ navigation }) => {
    const { token, loadUser } = useContext(AuthContext);

    const [languages, setLanguages] = useState([]);
    const [translationLanguages, setTranslationLanguages] = useState([]);

    const [studyLanguage, setStudyLanguage] = useState(null);
    const [translationLanguage, setTranslationLanguage] = useState(null);

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

    const handleChoosingLanguage = async () => {
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
            await loadUser(token);

        } catch (error) {
            console.error("Error choosing language:", error);
        }
    }

    return (
        <View style={layout.container}>
            <Text>Choose language to study</Text>
            {languages.map((lang) => (
                <Pressable 
                    key={lang.language_id}
                    onPress={() => setStudyLanguage(lang.language_id)}
                >
                    <Text>
                        {lang.name}{studyLanguage === lang.language_id ? "✓" : ""}
                    </Text>
                </Pressable>
            ))}
            <Text>Choose translation language</Text>
            {translationLanguages.map((lang) => (
                <Pressable 
                    key={lang.language_id}
                    onPress={() => setTranslationLanguage(lang.language_id)}    
                >
                    <Text>
                        {lang.name}{translationLanguage === lang.language_id ? "✓" : ""}
                    </Text>
                </Pressable>
            ))}

            <Pressable 
                disabled={!studyLanguage || !translationLanguage}
                onPress={handleChoosingLanguage}
            >
                <Text>Continue</Text>
            </Pressable>

            
            <View style={layout.navbarWrapper}>
                <Navbar navigation={navigation} />
            </View>
            
        </View>
    )
}

export default ChooseLanguageScreen;