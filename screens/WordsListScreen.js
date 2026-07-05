import { useState, useEffect, useContext, useRef } from 'react';
import { View, ScrollView, Pressable, Text, StyleSheet} from 'react-native';

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

    const [playerState, setPlayerState] = useState({
        playing: false,
        paused: false,
        currentId: null,
        currentPart: null,
        playAll: false,
    });

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
    // PLAY ALL WORDS 
    const playAllWords = async () => {
        
        stopRef.current = false;
        pauseRef.current = false;

        setPlayerState({
            playing: true,
            paused: false,
            playAll: true,
            currentId: null,
            currentPart: null,
        });

        for (const word of words) {

            if (stopRef.current) break;

            while (pauseRef.current) {
                await sleep(100);
            }

            setPlayerState(prev => ({
                ...prev,
                currentId: word.content_id,
                currentPart: "study",
            }));

            await playSound(getSoundUrl(word.study_sound));

            while (pauseRef.current) {
                await sleep(100);
            }

            setPlayerState(prev => ({
                ...prev,
                currentPart: "translation",
            }));

            await playSound(getSoundUrl(word.translation_sound));
            }

            setPlayerState({
                playing: false,
                paused: false,
                playAll: false,
                currentId: null,
                currentPart: null,
            });

            if (!stopRef.current) {
                await handleComplete();
            }
    };
    // stop playing all when user left screen
    const stopPlayback = () => {
        stopRef.current = true;
        pauseRef.current = false;

        stopSound();

        setPlayerState({
            playing: false,
            paused: false,
            playAll: false,
            currentId: null,
            currentPart: null,
        });
    };
    
    // PAUSE
    const pausePlayback = () => {
        pauseRef.current = true;

        stopSound();

        setPlayerState(prev => ({
            ...prev,
            paused: true,
            playing: false,
        }));
    };
    const resumePlayback = () => {
        pauseRef.current = false;

        setPlayerState(prev => ({
            ...prev,
            paused: false,
            playing: true,
        }));
    };
    const togglePlayPause = () => {

        if (!playerState.playAll) {
            playAllWords();
            return;
        }

        if (playerState.paused) {
            resumePlayback();
        } else {
            pausePlayback();
        }
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
                    onPress={togglePlayPause}
                >
                    <Text style={textStyles.buttonTextInner}>
                        <AntDesign 
                            name={playerState.playAll && !playerState.paused ? "pause-circle" : "play-circle"} 
                            size={24} 
                            color={colors.darkorange} 
                        />
                        {playerState.playAll && !playerState.paused ? "Pause" : "Play all"}
                    </Text>
                </Pressable>
                {/* WORDS LIST */}
                <View style={layout.wrapper}>
                    {words.map((word) => (
                        <WordListCard 
                            key={word.content_id} 
                            word={word}
                            playingPart={
                                playerState.currentId === word.content_id
                                    ? playerState.currentPart
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