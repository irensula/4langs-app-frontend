import React, { useEffect, useRef, useState, useCallback, useContext, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { createAudioPlayer } from 'expo-audio';

import { api, getImageUrl, getSoundUrl } from "../utils/apiClient";
import { saveProgress } from "../utils/progressService";
import { playUISound } from "../utils/soundUtils";

import MessageModal from "../components/MessageModal";
import CategoryTitle from '../components/CategoryTitle';
// import WordListCard from '../components/WordListCard';
import NextArrow from '../components/NextArrow';
import Navbar from '../components/Navbar';

import { layout, textStyles, colors } from '../constants/layout';
import AntDesign from "@expo/vector-icons/AntDesign";

const GAP_BETWEEN_TRACKS_MS = 700;

import { AuthContext } from '../utils/AuthContext';

const WordsListScreen = ({ route, navigation }) => {
  const { token } = useContext(AuthContext);
  const { categoryName, courseId, categoryId, exerciseId } = route.params;
  const playerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0); // индекс внутри playlistItems, не words!
  const [isPlaying, setIsPlaying] = useState(false);

  const currentIndexRef = useRef(currentIndex);
  const isPlaylistPlayingRef = useRef(false);
  const gapTimeoutRef = useRef(null);
  const hasFinishedRef = useRef(false);
  const [isGapPending, setIsGapPending] = useState(false);
  const [words, setWords] = useState([]);
  const [exercise, setExercise] = useState(null);

  const [hasScored, setHasScored] = useState(false);
  const [modal, setModal] = useState({
      visible: false,
      type: "message",
      title: "",
      message: "",
  });
  
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchWordsList = async () => {
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
  const playlistItems = useMemo(
    () =>
      words.flatMap((word) => [
        {
          wordId: word.content_id,
          part: 'study',
          text: word.study,
          uri: getSoundUrl(word.study_sound),
        },
        {
          wordId: word.content_id,
          part: 'translation',
          text: word.translation,
          uri: getSoundUrl(word.translation_sound),
        },
      ]),
    [words]
  );

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

  // Создаём плеер, как только появился playlistItems
  useEffect(() => {
    if (!playlistItems.length) return;
    if (playerRef.current) return;

    const player = createAudioPlayer(playlistItems[0].uri);
    playerRef.current = player;

    const subscription = player.addListener('playbackStatusUpdate', (status) => {
      if (status.playbackState === 'readyToPlay' && isPlaylistPlayingRef.current) {
        player.play();
      }

      if (status.didJustFinish) {
        const nextIndex = currentIndexRef.current + 1;

        if (nextIndex < playlistItems.length && isPlaylistPlayingRef.current) {
          setIsGapPending(true);
          gapTimeoutRef.current = setTimeout(() => {
            gapTimeoutRef.current = null;
            setIsGapPending(false);
            if (!isPlaylistPlayingRef.current) return;
            currentIndexRef.current = nextIndex;
            setCurrentIndex(nextIndex);
            player.replace(playlistItems[nextIndex].uri);
          }, GAP_BETWEEN_TRACKS_MS);
        } else {
          // player played all trackes - stop without replace
          isPlaylistPlayingRef.current = false;
          setIsPlaying(false);
          hasFinishedRef.current = true;
          handleComplete(); // save progress
        }
      }
    });

    return () => {
      subscription.remove();
      clearGapTimeout();
      player.release();
      playerRef.current = null;
    };
  }, [playlistItems]);

  const playFromIndex = useCallback(
    (index) => {
      const player = playerRef.current;
      const item = playlistItems[index];
      if (!player || !item) return;

      clearGapTimeout();
      hasFinishedRef.current = false;
      isPlaylistPlayingRef.current = true;
      setIsPlaying(true);
      currentIndexRef.current = index;
      setCurrentIndex(index);
      
      try {
        player.replace(item.uri);
      } catch (e) {
        console.warn('Player already released, skip replace:', e);
      }
    },
    [playlistItems]
  );

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    if (isPlaying) {
      isPlaylistPlayingRef.current = false;
      setIsPlaying(false);
      clearGapTimeout();
      try {
        player.pause();
      } catch (e) {
        console.warn('Player already released, skip pause:', e);
      }
    } else if (hasFinishedRef.current) {
      playFromIndex(0);
    } else {
      isPlaylistPlayingRef.current = true;
      setIsPlaying(true);
      try {
        player.play();
      } catch (e) {
        console.warn('Player already released, skip play:', e);
      }
    }
  }, [isPlaying, playFromIndex]);

  // click on single word (study or translation)
  const playSingle = useCallback(
    (wordId, part) => {
      const index = playlistItems.findIndex(
        (item) => item.wordId === wordId && item.part === part
      );
      if (index !== -1) {
        playFromIndex(index);
      }
    },
    [playlistItems, playFromIndex]
  );

  useEffect(() => {
    if (!isFocused) {
      // screen is not in focuse - stop playing
      isPlaylistPlayingRef.current = false;
      setIsPlaying(false);
      clearGapTimeout();
      try {
        playerRef.current?.pause();
      } catch (e) {
        console.warn('Player already released, skip pause:', e);
      }
    }
  }, [isFocused]);

  // COMPLETE AND SAVE PROGRESS 
  const handleComplete = async () => {
      
      if (hasScored) return;

      setHasScored(true);

      try {
          await saveProgress
          ({
              courseId,
              categoryId,
              exerciseId,
              token,
          });

          playUISound("win");

          setModal({
              visible: true,
              type: "message",
              title: "",
              message: "Exercise completed!",
              confirmText: "Next",
          }); 

          setRefreshProgress(Date.now());

      } catch (error) {
          playUISound("second_win");
          setModal({
              visible: true,
              type: "message",
              title: "",
              message: error.response?.error,
              confirmText: "OK",
          }); 
      }
  };

  return (
    <View style={layout.screen}>
      {/* MESSAGE MODAL */}
      <MessageModal
          visible={modal.visible}
          type={modal.type}
          title={modal.title}
          message={modal.message}
          onClose={() =>
              setModal(prev => ({
                  ...prev,
                  visible: false,
              }))
          }
      />
      <ScrollView contentContainerStyle={layout.scrollContent}>
        {/* CATEGORY TITLLE */}
        <CategoryTitle 
            categoryId={categoryId} 
            categoryName={categoryName} 
            subtitle={exercise?.name}
            isFocused={isFocused}
        />
        {/* PLAY ALL SOUNDS */}
        <View style={styles.contentContainer}>
          <Pressable
              style={styles.playButton}
              onPress={togglePlay}
          >
            <AntDesign 
                name={isPlaying ? "pause-circle" : "play-circle"} 
                size={26} 
                color={colors.white} 
            />
            <Text style={styles.playButtonText}> 
                {isPlaying ? "Pause" : "Play all"}
            </Text>
          </Pressable>
        
        {/* WORDS LIST */}
        <View style={styles.listContainer}>
          {words.map((word) => {
            const isStudyCurrent =
              currentItem?.wordId === word.content_id && currentItem?.part === 'study';
            const isTranslationCurrent =
              currentItem?.wordId === word.content_id && currentItem?.part === 'translation';

            return (
              <View key={word.content_id} style={{ flexDirection: "row" }}>
                <Image
                  source={{ uri: getImageUrl(word.image_path) }}
                  style={layout.image}
                  resizeMode="cover"
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <TouchableOpacity
                    style={[styles.trackItem, isStudyCurrent && styles.activeTrackItem]}
                    onPress={() => playSingle(word.content_id, 'study')}
                  >
                    <Text style={[isStudyCurrent && styles.activeTrackText]}>
                      {word.study}                  
                    </Text>
                    <AntDesign name={"play-circle"} size={24} color={colors.darkorange} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.trackItem, isTranslationCurrent && styles.activeTrackItem]}
                    onPress={() => playSingle(word.content_id, 'translation')}
                  >
                    <Text style={[isTranslationCurrent && styles.activeTrackText]}>
                      {word.translation}
                    </Text>
                    <AntDesign name={"play-circle"} size={24} color={colors.darkorange} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
        {/* NEXT ARROW */}
        <NextArrow screen={'Text'} categoryName={categoryName} categoryId={categoryId} />
        </View>
      </ScrollView>
      {/* NAVBAR */}
      <View style={layout.navbarWrapper}>
          <Navbar navigation={navigation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    margin: 15
  },
  listContainer: { 
    marginVertical: 10, 
    gap: 8 
  },
  playButton: {
    backgroundColor: colors.orange,
    width: "100%",
    borderRadius: 50,
    height: 50,
    flexDirection: "row",
    columnGap: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    alignSelf: "flex-end"
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: 400,
    color: colors.white
  },
  trackItem: { 
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 5, 
    borderRadius: 8, 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#eee' 
  },
  activeTrackItem: { 
    backgroundColor: colors.lightgreen, 
    borderColor: colors.primary 
  },
  activeTrackText: { 
    fontWeight: 600, 
    color: colors.secondary 
  }
});

export default WordsListScreen;