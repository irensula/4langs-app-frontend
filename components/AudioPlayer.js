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

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { createAudioPlayer } from 'expo-audio';

// Список звуков
const PLAYLIST = [
  { id: 0, name: 'Правильный ответ (Correct)', source: require('../assets/sounds/correct.mp3') },
  { id: 1, name: 'Первый вариант (First Option)', source: require('../assets/sounds/first-option.mp3') },
  { id: 2, name: 'Победа (Win)', source: require('../assets/sounds/win.mp3') },
  { id: 3, name: 'Ошибка (Wrong)', source: require('../assets/sounds/wrong.mp3') },
];

// Пауза между треками, мс. Поставьте 0, если пауза не нужна.
const GAP_BETWEEN_TRACKS_MS = 700;

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
export default function AudioPlayer() {
  const playerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Держим актуальный индекс и флаг "играть ли всё" в ref,
  // чтобы обработчик события не захватывал устаревшее замыкание.
  const currentIndexRef = useRef(currentIndex);
  const isPlaylistPlayingRef = useRef(false);
  const gapTimeoutRef = useRef(null);
  const [isGapPending, setIsGapPending] = useState(false);

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
    const player = createAudioPlayer(PLAYLIST[0].source);
    playerRef.current = player;

    const subscription = player.addListener('playbackStatusUpdate', (status) => {
      // Трек догружен и готов — можно играть
      if (status.playbackState === 'readyToPlay' && isPlaylistPlayingRef.current) {
        player.play();
      }

      // Трек доиграл до конца — переключаемся на следующий (с паузой)
      if (status.didJustFinish) {
        const nextIndex = currentIndexRef.current + 1;

        if (nextIndex < PLAYLIST.length && isPlaylistPlayingRef.current) {
          setIsGapPending(true);
          gapTimeoutRef.current = setTimeout(() => {
            gapTimeoutRef.current = null;
            setIsGapPending(false);
            // Если за время паузы пользователь нажал "Пауза" — не продолжаем
            if (!isPlaylistPlayingRef.current) return;
            currentIndexRef.current = nextIndex;
            setCurrentIndex(nextIndex);
            player.replace(PLAYLIST[nextIndex].source);
            // play() будет вызван автоматически по 'readyToPlay' выше
          }, GAP_BETWEEN_TRACKS_MS);
        } else {
          // Плейлист закончился — сбрасываем в начало
          isPlaylistPlayingRef.current = false;
          setIsPlaying(false);
          currentIndexRef.current = 0;
          setCurrentIndex(0);
          player.replace(PLAYLIST[0].source);
        }
      }
    });

    return () => {
      subscription.remove();
      clearGapTimeout();
      player.release();
    };
  }, []);

  const playFromIndex = useCallback((index) => {
    const player = playerRef.current;
    if (!player) return;

    clearGapTimeout(); // если кликнули по треку прямо во время паузы между звуками
    isPlaylistPlayingRef.current = true;
    setIsPlaying(true);
    currentIndexRef.current = index;
    setCurrentIndex(index);
    player.replace(PLAYLIST[index].source);
    // play() сработает по событию 'readyToPlay'
  }, []);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    if (isPlaying) {
      isPlaylistPlayingRef.current = false;
      setIsPlaying(false);
      clearGapTimeout(); // отменяем ожидающее переключение на следующий трек
      player.pause();
    } else {
      isPlaylistPlayingRef.current = true;
      setIsPlaying(true);
      player.play();
    }
  }, [isPlaying]);

  const handleSelectTrack = (index) => {
    playFromIndex(index);
  };

  return (
    <View style={styles.playerContainer}>
      <Text style={styles.title}>Список звуков:</Text>

      <View style={styles.listContainer}>
        {PLAYLIST.map((track, index) => {
          const isCurrent = currentIndex === index;
          return (
            <TouchableOpacity
              key={track.id}
              style={[styles.trackItem, isCurrent && styles.activeTrackItem]}
              onPress={() => handleSelectTrack(index)}
            >
              <Text style={[styles.trackText, isCurrent && styles.activeTrackText]}>
                {isCurrent && isPlaying ? '🔊 ' : '🔹 '}
                {track.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.statusText}>
        Статус: {isGapPending ? 'Пауза между звуками… ⏳' : isPlaying ? 'Воспроизведение 🔊' : 'Пауза ⏸'}
        {'  '}({currentIndex + 1}/{PLAYLIST.length})
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title={isPlaying ? 'ПАУЗА ⏸' : 'ЗАПУСТИТЬ ВСЁ ПО ПОРЯДКУ ▶'}
          onPress={togglePlay}
          color={isPlaying ? '#ff5252' : '#4caf50'}
        />
      </View>
    </View>
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
  trackItem: { padding: 12, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
  activeTrackItem: { backgroundColor: '#e3f2fd', borderColor: '#90caf9' },
  trackText: { fontSize: 15, color: '#666' },
  activeTrackText: { fontWeight: 'bold', color: '#1565c0' },
  statusText: { fontSize: 16, textAlign: 'center', marginVertical: 10, color: '#555', fontWeight: '500' },
  buttonContainer: { marginTop: 5 },
});
