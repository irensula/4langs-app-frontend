// Список звуков
// const words = [
//   { id: 0, name: 'Правильный ответ (Correct)', source: require('../assets/sounds/correct.mp3') },
//   { id: 1, name: 'Первый вариант (First Option)', source: require('../assets/sounds/first-option.mp3') },
//   { id: 2, name: 'Победа (Win)', source: require('../assets/sounds/win.mp3') },
//   { id: 3, name: 'Ошибка (Wrong)', source: require('../assets/sounds/wrong.mp3') },
//   { id: 4, name: 'sister', source: require('../assets/sounds/sister.mp3') },
//   { id: 5, name: 'täti', source: require('../assets/sounds/täti.mp3') },
//   { id: 6, name: 'дідусь', source: require('../assets/sounds/дідусь.mp3') },
//   { id: 7, name: "сім'я", source: require("../assets/sounds/сім'я.mp3") },
// ];

/**
 * Один персистентный AudioPlayer на весь плейлист.
 * createAudioPlayer (не хук useAudioPlayer!) не пересоздаётся при ререндерах —
 * им управляем вручную и сами освобождаем через release().
 *
 * Логика переключения трека:
 * 1. player.replace(source) — грузим новый источник
 * 2. ждём статус 'readyToPlay' — только тогда вызываем play()
 *    (на Android play() сразу после replace() иногда не срабатывает)
 * 3. по didJustFinish — переходим к следующему треку или останавливаемся
 */

import React, { useEffect, useRef, useState, useCallback, useContext, useMemo } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { createAudioPlayer } from 'expo-audio';
import { api, getSoundUrl } from "../utils/apiClient";

const GAP_BETWEEN_TRACKS_MS = 700;

import { AuthContext } from '../utils/AuthContext';
export default function AudioPlayer() {
  const { token } = useContext(AuthContext);
  const playerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0); // индекс внутри playlistItems, не words!
  const [isPlaying, setIsPlaying] = useState(false);

  const currentIndexRef = useRef(currentIndex);
  const isPlaylistPlayingRef = useRef(false);
  const gapTimeoutRef = useRef(null);
  const hasFinishedRef = useRef(false);
  const [isGapPending, setIsGapPending] = useState(false);
  const [words, setWords] = useState([]);

  useEffect(() => {
    const fetchWordsList = async () => {
      try {
        const data = await api.get(`/courses/31/categories/1/exercises/1`, token);
        if (!Array.isArray(data.content)) return;
        setWords(data.content);
        console.log("data.content", data.content);
      } catch (error) {
        console.error("Error fetching words list:", error);
        setWords([]);
      }
    };
    fetchWordsList();
  }, [token]);

  // Плоский плейлист: на каждое слово — два элемента (study, translation).
  // useMemo обязателен: без него flatMap создавал бы новый массив на каждый
  // ререндер, и эффект ниже пересоздавал бы плеер бесконечно.
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
          // Плейлист доиграл до конца — просто останавливаемся,
          // оставаясь на последнем треке (без сброса и без replace)
          isPlaylistPlayingRef.current = false;
          setIsPlaying(false);
          hasFinishedRef.current = true;
        }
      }
    });

    return () => {
      subscription.remove();
      clearGapTimeout();
      player.release();
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
      player.replace(item.uri);
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
      player.pause();
    } else if (hasFinishedRef.current) {
      playFromIndex(0);
    } else {
      isPlaylistPlayingRef.current = true;
      setIsPlaying(true);
      player.play();
    }
  }, [isPlaying, playFromIndex]);

  // Клик по конкретному слову (study или translation)
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

  return (
    <ScrollView>
      <View style={styles.playerContainer}>
        <Text style={styles.title}>Список звуков:</Text>

        <View style={styles.listContainer}>
          {words.map((word) => {
            const isStudyCurrent =
              currentItem?.wordId === word.content_id && currentItem?.part === 'study';
            const isTranslationCurrent =
              currentItem?.wordId === word.content_id && currentItem?.part === 'translation';

            return (
              <View key={word.content_id} style={styles.wordRow}>
                <TouchableOpacity
                  style={[styles.trackItem, isStudyCurrent && styles.activeTrackItem]}
                  onPress={() => playSingle(word.content_id, 'study')}
                >
                  <Text style={[styles.trackText, isStudyCurrent && styles.activeTrackText]}>
                    {isStudyCurrent && isPlaying ? '🔊 ' : '🔹 '}
                    {word.study}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.trackItem, isTranslationCurrent && styles.activeTrackItem]}
                  onPress={() => playSingle(word.content_id, 'translation')}
                >
                  <Text style={[styles.trackText, isTranslationCurrent && styles.activeTrackText]}>
                    {isTranslationCurrent && isPlaying ? '🔊 ' : '🔹 '}
                    {word.translation}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <Text style={styles.statusText}>
          Статус: {isGapPending ? 'Пауза между звуками… ⏳' : isPlaying ? 'Воспроизведение 🔊' : 'Пауза ⏸'}
          {'  '}({playlistItems.length ? currentIndex + 1 : 0}/{playlistItems.length})
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            title={isPlaying ? 'ПАУЗА ⏸' : 'ЗАПУСТИТЬ ВСЁ ПО ПОРЯДКУ ▶'}
            onPress={togglePlay}
            color={isPlaying ? '#ff5252' : '#4caf50'}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  playerContainer: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  listContainer: { marginVertical: 10, gap: 8 },
  wordRow: { flexDirection: 'row', gap: 8 },
  trackItem: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
  activeTrackItem: { backgroundColor: '#e3f2fd', borderColor: '#90caf9' },
  trackText: { fontSize: 15, color: '#666' },
  activeTrackText: { fontWeight: 'bold', color: '#1565c0' },
  statusText: { fontSize: 16, textAlign: 'center', marginVertical: 10, color: '#555', fontWeight: '500' },
  buttonContainer: { marginTop: 5 },
});

// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
// import { createAudioPlayer } from 'expo-audio';

// // Список звуков
// const PLAYLIST = [
//   { id: 0, name: 'Правильный ответ (Correct)', source: require('../assets/sounds/correct.mp3') },
//   { id: 1, name: 'Первый вариант (First Option)', source: require('../assets/sounds/first-option.mp3') },
//   { id: 2, name: 'Победа (Win)', source: require('../assets/sounds/win.mp3') },
//   { id: 3, name: 'Ошибка (Wrong)', source: require('../assets/sounds/wrong.mp3') },
//   { id: 4, name: 'sister', source: require('../assets/sounds/sister.mp3') },
//   { id: 5, name: 'täti', source: require('../assets/sounds/täti.mp3') },
//   { id: 6, name: 'дідусь', source: require('../assets/sounds/дідусь.mp3') },
//   { id: 7, name: "сім'я", source: require("../assets/sounds/сім'я.mp3") },
// ];

// // Пауза между треками, мс. Поставьте 0, если пауза не нужна.
// const GAP_BETWEEN_TRACKS_MS = 700;

// /**
//  * Один персистентный AudioPlayer на весь плейлист.
//  * createAudioPlayer (не хук useAudioPlayer!) не пересоздаётся при ререндерах —
//  * им управляем вручную и сами освобождаем через release().
//  *
//  * Логика переключения трека:
//  * 1. player.replace(source) — грузим новый источник
//  * 2. ждём статус 'readyToPlay' — только тогда вызываем play()
//  *    (на Android play() сразу после replace() иногда не срабатывает)
//  * 3. по didJustFinish — переходим к следующему треку или останавливаемся
//  */
// export default function AudioPlayer() {
//   const playerRef = useRef(null);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);

//   // Держим актуальный индекс и флаг "играть ли всё" в ref,
//   // чтобы обработчик события не захватывал устаревшее замыкание.
//   const currentIndexRef = useRef(currentIndex);
//   const isPlaylistPlayingRef = useRef(false);
//   const gapTimeoutRef = useRef(null);
//   const [isGapPending, setIsGapPending] = useState(false);

//   useEffect(() => {
//     currentIndexRef.current = currentIndex;
//   }, [currentIndex]);

//   const clearGapTimeout = () => {
//     if (gapTimeoutRef.current) {
//       clearTimeout(gapTimeoutRef.current);
//       gapTimeoutRef.current = null;
//     }
//     setIsGapPending(false);
//   };

//   // Создаём плеер один раз при монтировании
//   useEffect(() => {
//     const player = createAudioPlayer(PLAYLIST[0].source);
//     playerRef.current = player;

//     const subscription = player.addListener('playbackStatusUpdate', (status) => {
//       // Трек догружен и готов — можно играть
//       if (status.playbackState === 'readyToPlay' && isPlaylistPlayingRef.current) {
//         player.play();
//       }

//       // Трек доиграл до конца — переключаемся на следующий (с паузой)
//       if (status.didJustFinish) {
//         const nextIndex = currentIndexRef.current + 1;

//         if (nextIndex < PLAYLIST.length && isPlaylistPlayingRef.current) {
//           setIsGapPending(true);
//           gapTimeoutRef.current = setTimeout(() => {
//             gapTimeoutRef.current = null;
//             setIsGapPending(false);
//             // Если за время паузы пользователь нажал "Пауза" — не продолжаем
//             if (!isPlaylistPlayingRef.current) return;
//             currentIndexRef.current = nextIndex;
//             setCurrentIndex(nextIndex);
//             player.replace(PLAYLIST[nextIndex].source);
//             // play() будет вызван автоматически по 'readyToPlay' выше
//           }, GAP_BETWEEN_TRACKS_MS);
//         } else {
//           // Плейлист закончился — сбрасываем в начало
//           isPlaylistPlayingRef.current = false;
//           setIsPlaying(false);
//           currentIndexRef.current = 0;
//           setCurrentIndex(0);
//           player.replace(PLAYLIST[0].source);
//         }
//       }
//     });

//     return () => {
//       subscription.remove();
//       clearGapTimeout();
//       player.release();
//     };
//   }, []);

//   const playFromIndex = useCallback((index) => {
//     const player = playerRef.current;
//     if (!player) return;

//     clearGapTimeout(); // если кликнули по треку прямо во время паузы между звуками
//     isPlaylistPlayingRef.current = true;
//     setIsPlaying(true);
//     currentIndexRef.current = index;
//     setCurrentIndex(index);
//     player.replace(PLAYLIST[index].source);
//     // play() сработает по событию 'readyToPlay'
//   }, []);

//   const togglePlay = useCallback(() => {
//     const player = playerRef.current;
//     if (!player) return;

//     if (isPlaying) {
//       isPlaylistPlayingRef.current = false;
//       setIsPlaying(false);
//       clearGapTimeout(); // отменяем ожидающее переключение на следующий трек
//       player.pause();
//     } else {
//       isPlaylistPlayingRef.current = true;
//       setIsPlaying(true);
//       player.play();
//     }
//   }, [isPlaying]);

//   const handleSelectTrack = (index) => {
//     playFromIndex(index);
//   };

//   return (
//     <View style={styles.playerContainer}>
//       <Text style={styles.title}>Список звуков:</Text>

//       <View style={styles.listContainer}>
//         {PLAYLIST.map((track, index) => {
//           const isCurrent = currentIndex === index;
//           return (
//             <TouchableOpacity
//               key={track.id}
//               style={[styles.trackItem, isCurrent && styles.activeTrackItem]}
//               onPress={() => handleSelectTrack(index)}
//             >
//               <Text style={[styles.trackText, isCurrent && styles.activeTrackText]}>
//                 {isCurrent && isPlaying ? '🔊 ' : '🔹 '}
//                 {track.name}
//               </Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>

//       <Text style={styles.statusText}>
//         Статус: {isGapPending ? 'Пауза между звуками… ⏳' : isPlaying ? 'Воспроизведение 🔊' : 'Пауза ⏸'}
//         {'  '}({currentIndex + 1}/{PLAYLIST.length})
//       </Text>

//       <View style={styles.buttonContainer}>
//         <Button
//           title={isPlaying ? 'ПАУЗА ⏸' : 'ЗАПУСТИТЬ ВСЁ ПО ПОРЯДКУ ▶'}
//           onPress={togglePlay}
//           color={isPlaying ? '#ff5252' : '#4caf50'}
//         />
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   playerContainer: {
//     backgroundColor: '#f9f9f9',
//     padding: 20,
//     borderRadius: 12,
//     width: '90%',
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//   },
//   title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
//   listContainer: { marginVertical: 10, gap: 8 },
//   trackItem: { padding: 12, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
//   activeTrackItem: { backgroundColor: '#e3f2fd', borderColor: '#90caf9' },
//   trackText: { fontSize: 15, color: '#666' },
//   activeTrackText: { fontWeight: 'bold', color: '#1565c0' },
//   statusText: { fontSize: 16, textAlign: 'center', marginVertical: 10, color: '#555', fontWeight: '500' },
//   buttonContainer: { marginTop: 5 },
// });
