import { useState, useEffect, useContext } from 'react';
import {View, ScrollView, StyleSheet} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { AuthContext } from '../utils/AuthContext';
import Constants from 'expo-constants';
import WordListCard from '../components/WordListCard';
import Navbar from '../components/Navbar';
import NextArrow from '../components/NextArrow';
import { layout, textStyles, colors, spacing } from '../constants/layout';
import CategoryTitle from '../components/CategoryTitle';

const WordsListScreen = ({ route, navigation }) => {
    const [words, setWords] = useState([]);
    const { name, categoryID } = route.params;
    const { user, token } = useContext(AuthContext);
    const API_BASE = Constants.expoConfig?.extra?.API_BASE || 'fallback value';
    const isFocused = useIsFocused();
    const [progress, setProgress] = useState([]);

    useEffect(() => {
        const fetchWords = async () => {
            try {
                if (!token || !categoryID) return;
                const res = await fetch(`${API_BASE}/categories/${categoryID}/words`, { 
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setWords(data);
            } catch (err) {
                console.error('Error fetching words:', err);
            }
    };
    fetchWords();
}, [token, categoryID]);

    return (
        <View style={layout.screen}>
            <ScrollView contentContainerStyle={layout.scrollContent}>
                
                <CategoryTitle 
                    categoryID={categoryID} 
                    name={name} 
                    subtitle="Sanalista"
                    isFocused={isFocused}
                />
                
                <View style={layout.wrapper}>
                    {words.map((word) => (
                        <WordListCard key={word.wordID} word={word} API_BASE={API_BASE} />
                    ))}
                </View>
                <NextArrow screen={'TextScreen'} name={name} categoryID={categoryID} />

            </ScrollView>
            {user && (
                <View style={layout.navbarWrapper}>
                    <Navbar user={user} navigation={navigation} />
                </View>
            )}
        </View>
    )
} 

const styles = StyleSheet.create({
    tabsWrapper: {
        flexDirection: 'row', 
        gap: 5, 
        marginBottom: 15, 
    },
    tabWrapper: {
        borderWidth: 2, 
        backgroundColor: colors.lightorange,
        borderColor: colors.orange,  
        borderRadius: 50,
        paddingVertical: 7,
        paddingHorizontal: 10,
        marginVertical: 10,
    },
    text: {
        color: colors.white,
        fontFamily: 'ABeeZee',
        fontSize: 14,
    },
})

export default WordsListScreen;