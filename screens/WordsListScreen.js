import { useState, useEffect, useContext, useRef } from 'react';
import { View, ScrollView, Pressable, Text, StyleSheet} from 'react-native';
import { useAudioPlaylist, useAudioPlaylistStatus } from 'expo-audio';

import { useIsFocused } from '@react-navigation/native';

import { AuthContext } from '../utils/AuthContext';
import { api, getSoundUrl } from "../utils/apiClient";
import { playSound, stopSound } from "../utils/soundUtils";

import CategoryTitle from '../components/CategoryTitle';
import WordListCard from '../components/WordListCard';
import NextArrow from '../components/NextArrow';
import Navbar from '../components/Navbar';

import { layout, textStyles, colors } from '../constants/layout';

import AntDesign from "@expo/vector-icons/AntDesign";

const WordsListScreen = ({ route, navigation }) => {
    const { token } = useContext(AuthContext);
    const { categoryName, courseId, categoryId, exerciseId } = route.params;

    const [words, setWords] = useState([]);
    const [exercise, setExercise] = useState(null);

    const [hasScored, setHasScored] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    const isFocused = useIsFocused();
    
    const stopRef = useRef(false);
    const pauseRef = useRef(false);

    // GET GAME DATA
    useEffect(() => {
        const fetchWordsList = async () => {
        
            if (!token || !courseId || !categoryId || !exerciseId) return;

            try {
                const data = await api.get(
                    `/courses/${courseId}/categories/${categoryId}/exercises/${exerciseId}`,
                    token
                );

                if (!Array.isArray(data.content)) return;
                
                setWords(data.content);
                setExercise(data.exercise);
                
            } catch (error) {
                console.error("Error fetching words list:", error);
                setWords([]);
            }
        };
        fetchWordsList();
    }, [token, courseId, categoryId, exerciseId]);
    // PLAYLIST
    const playlistSources = words.flatMap(word => [
        { uri: getSoundUrl(word.study_sound) },
        { uri: getSoundUrl(word.translation_sound) },
    ]);

    const playlistItems = words.flatMap(word => [
        {
            id: word.content_id,
            part: "study",
            uri: getSoundUrl(word.study_sound),
        },
        {
            id: word.content_id,
            part: "translation",
            uri: getSoundUrl(word.translation_sound),
        },
    ]);

    const playlist = useAudioPlaylist({
        sources: playlistItems.map(item => ({ uri: item.uri })),
        loop: "none",
    });

    const status = useAudioPlaylistStatus(playlist);

    const currentItem = playlistItems[status.currentIndex];

    const togglePlay = () => {
        if (status.playing) {
            playlist.pause();
        } else {
            playlist.play();
        }
    };

    useEffect(() => {
        if (!isFocused && status.playing) {
            playlist.pause();
            playlist.skipTo(0);
        };
    }, [isFocused]);

    useEffect(() => {
        if (
            !status.playing &&
            status.currentIndex === status.trackCount - 1 &&
            status.trackCount > 0
        ) {
            handleComplete();
        }
    }, [status.playing, status.currentIndex]);

    const playSingle = (word, part) => {
        const index = playlistItems.findIndex(
            item =>
                item.id === word.content_id &&
                item.part === part
        );

        playlist.skipTo(index);
        playlist.play();
    };
    
    // COMPLETE AND SAVE PROGRESS 
    const handleComplete = async () => {
        if (hasScored) return;

        setHasScored(true);

        try {
            await saveProgress({
                courseId,
                categoryId,
                exerciseId,
                token,
            });

            playUISound("win");

            setModalMessage("Harjoitus suoritettu!");
            setMessageType("success");
            setModalVisible(true);

            setRefreshProgress(Date.now());

        } catch (error) {

            setModalMessage(
                error.response?.error ?? "Failed to save progress"
            );

            setMessageType("error");
            setModalVisible(true);
        }
    };

    return (
        <View style={layout.screen}>
            <ScrollView contentContainerStyle={layout.scrollContent}>
                {/* CATEGORY TITLLE */}
                <CategoryTitle 
                    categoryId={categoryId} 
                    categoryName={categoryName} 
                    subtitle={exercise?.name}
                    isFocused={isFocused}
                />
                {/* PLAY ALL SOUNDS */}
                <Pressable
                    style={layout.buttonInner}
                    onPress={togglePlay}
                >
                    <Text style={textStyles.buttonTextInner}>
                        <AntDesign 
                            name={status.playing ? "pause-circle" : "play-circle"} 
                            size={24} 
                            color={colors.darkorange} 
                        />
                        {status.playing ? "Pause" : "Play all"}
                    </Text>
                </Pressable>
                {/* WORDS LIST */}
                <View style={layout.wrapper}>
                    {words.map((word) => (
                        <WordListCard 
                            key={word.content_id} 
                            word={word}
                            playingPart={
                                currentItem?.id === word.content_id
                                    ? currentItem.part
                                    : null
                            }
                        />
                    ))}
                </View>
                {/* NEXT ARROW */}
                <NextArrow screen={'Text'} categoryName={categoryName} categoryId={categoryId} />

            </ScrollView>
            {/* NAVBAR */}
            <View style={layout.navbarWrapper}>
                <Navbar navigation={navigation} />
            </View>
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