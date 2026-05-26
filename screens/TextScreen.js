import { useState, useEffect, useContext } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { AuthContext } from '../utils/AuthContext';
import { layout, textStyles, colors, spacing } from '../constants/layout';
import TextCard from '../components/TextCard';
import Navbar from '../components/Navbar';
import NextArrow from '../components/NextArrow';
import LanguageTabs from '../components/LanguageTabs';
import CategoryTitle from '../components/CategoryTitle';
import { api } from "../utils/apiClient";

const TextScreen = ({ route, navigation }) => {
    const { user, token } = useContext(AuthContext);
    const { name, categoryID } = route.params;
    const [texts, setTexts] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [activeLanguage, setActiveLanguage] = useState(false);
    const isFocused = useIsFocused();
    
    useEffect(() => {
        const fetchTexts = async () => {

            if (!token || !categoryID) return;
            
            try {
                const data = await api.get(
                    `/categories/${categoryID}/texts`, 
                    token 
                );

                if (!Array.isArray(data)) return;

                setTexts(data);
                
            } catch (error) {
                console.error('Error fetching texts:', error);
                setTexts([]);
            }
        };
        fetchTexts();
    }, [token, categoryID]);
    
    return (
        <View style={layout.screen}>
            <ScrollView contentContainerStyle={layout.scrollContent}>

                <CategoryTitle 
                    categoryID={categoryID} 
                    name={name} 
                    subtitle="Teksti"
                    isFocused={isFocused}
                />

                <View style={layout.wrapper}>
                    
                    <LanguageTabs 
                    selectedLanguage={selectedLanguage}
                    setSelectedLanguage={setSelectedLanguage}
                    activeLanguage={activeLanguage}
                />

                    {texts.map((item, index) =>(
                        <TextCard 
                            key={index}
                            texts={item} 
                            selectedLanguage={selectedLanguage}
                        />)
                    )}
                </View>
                <NextArrow screen={'MemoScreen'} name={name} categoryID={categoryID} />
            </ScrollView>

            {user && (
                <View style={layout.navbarWrapper}>
                    <Navbar user={user} navigation={navigation} />
                </View>
            )}

        </View>
    )
}

export default TextScreen;