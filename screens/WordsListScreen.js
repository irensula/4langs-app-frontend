import { useState, useEffect, useContext, useRef, useCallback} from 'react';
import { View, ScrollView, Pressable, Text, StyleSheet} from 'react-native';
import { createAudioPlayer } from 'expo-audio';

import { useIsFocused } from '@react-navigation/native';

import { AuthContext } from '../utils/AuthContext';
import { api, getSoundUrl } from "../utils/apiClient";

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
    const [messageType, setMessageType] = useState("");

    const isFocused = useIsFocused();

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

    // player
    const playerRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const currentIndexRef = useRef(currentIndex);
    const isPlaylistPlayingRef = useRef(false);
    const gapTimeoutRef = useRef(null);
    const [isGapPending, setIsGapPending] = useState(false);
    
    const GAP_BETWEEN_TRACKS_MS = 700;

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
    console.log("playlistItems",playlistItems);
    const currentItem = playlistItems[currentIndex];

    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    const clearGapTimeout = () => {
        if (gapTimeoutRef.current) {
            clearTimeout(gapTimeoutRef.current);
            gapTimeoutRef.current = null;
        }
        setIsGapPending(false);
    };

    // Создаём плеер один раз при монтировании
      useEffect(() => {
        if (!playlistItems.length) return;
        if (playerRef.current) return;
        
        const player = createAudioPlayer(playlistItems[0].uri);
        
        playerRef.current = player;
    
        const subscription = player.addListener('playbackStatusUpdate', (status) => {
            console.log('AUDIO STATUS:', JSON.stringify(status));

          // Трек догружен и готов — можно играть
          if (status.playbackState === 'readyToPlay' && isPlaylistPlayingRef.current) {
            player.play();
          }
    
          // Трек доиграл до конца — переключаемся на следующий (с паузой)
          if (status.didJustFinish) {
            const nextIndex = currentIndexRef.current + 1;
    
            if (nextIndex < playlistItems.length && isPlaylistPlayingRef.current) {
              setIsGapPending(true);
              
              gapTimeoutRef.current = setTimeout(() => {
                gapTimeoutRef.current = null;
                setIsGapPending(false);
                // Если за время паузы пользователь нажал "Пауза" — не продолжаем
                if (!isPlaylistPlayingRef.current) return;
                currentIndexRef.current = nextIndex;
                setCurrentIndex(nextIndex);
                player.replace(playlistItems[nextIndex].uri);
                // play() будет вызван автоматически по 'readyToPlay' выше
              }, GAP_BETWEEN_TRACKS_MS);
            } else {
              // Плейлист закончился — сбрасываем в начало
              isPlaylistPlayingRef.current = false;
              setIsPlaying(false);
              currentIndexRef.current = 0;
              setCurrentIndex(0);
              player.replace(playlistItems[0].uri);
              handleComplete(); // show messages and save progress
            }
          }
        });
    
        return () => {
          subscription.remove();
          clearGapTimeout();
          player.release();
        };
      }, [playlistItems]);
    
      const playFromIndex = useCallback((index) => {
        const player = playerRef.current;
        if (!player) return;

        const item = playlistItems[index];
        if (!item) return;

        console.log("index =", index);
        console.log(item);      
    
        clearGapTimeout(); // если кликнули по треку прямо во время паузы между звуками
        
        isPlaylistPlayingRef.current = true;
        setIsPlaying(true);
        
        currentIndexRef.current = index;
        setCurrentIndex(index);
        
        player.replace(item.uri);
        // play() сработает по событию 'readyToPlay'
      }, [playlistItems]);

      // play all / pause
      const togglePlay = () => {
        const player = playerRef.current;
        if (!player) return;

        if (isPlaying) {
            isPlaylistPlayingRef.current = false;
            setIsPlaying(false);
            clearGapTimeout();
            player.pause();
        } else {
            playFromIndex(currentIndexRef.current);
        }
    };
    
      const handleSelectTrack = (index) => {
        playFromIndex(index);
      };

      useEffect(() => {
        if (!isFocused) {
            isPlaylistPlayingRef.current = false;
            setIsPlaying(false);

            clearGapTimeout();

            const player = playerRef.current;
            if (player) {
                player.pause();
            }

            currentIndexRef.current = 0;
            setCurrentIndex(0);
        }
    }, [isFocused]);

    const playSingle = (word, part) => {
        const index = playlistItems.findIndex(
            item =>
                item.id === word.content_id &&
                item.part === part
        );

        if (index !== -1) {
            playFromIndex(index);
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
                    onPress={togglePlay}
                >
                    <Text style={textStyles.buttonTextInner}>
                        <AntDesign 
                            name={isPlaying ? "pause-circle" : "play-circle"} 
                            size={24} 
                            color={colors.darkorange} 
                        />
                        {isPlaying ? "Pause" : "Play all"}
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