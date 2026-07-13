import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

let wordPlayer = null;
let uiPlayer = null;
let wordPlayerSubscription = null;
let hasEnded = false;

export const initAudio = async () => {
  if (!uiPlayer) uiPlayer = createAudioPlayer();

  await setAudioModeAsync({
    playsInSilentMode: true,
  });
};

export const playSound = async (file, { baseUri = "", onEnd, onStatusUpdate } = {}) => {
  await initAudio();

  const uri = `${baseUri}${file}`;

  wordPlayerSubscription?.remove?.();
  wordPlayerSubscription = null;
  wordPlayer?.pause?.();
  wordPlayer?.release?.();

  hasEnded = false;
  wordPlayer = createAudioPlayer({ uri });

  wordPlayerSubscription = wordPlayer.addListener("playbackStatusUpdate", (status) => {
    if (status.didJustFinish) {
      if (hasEnded) return; // защита от повторных срабатываний (баг Android)
      hasEnded = true;

      wordPlayerSubscription?.remove?.();
      wordPlayerSubscription = null;

      onStatusUpdate?.(status);
      onEnd?.();
      return;
    }

    onStatusUpdate?.(status);
  });

  wordPlayer.play?.();
};

export const stopSound = () => {
    wordPlayerSubscription?.remove?.();
    wordPlayerSubscription = null;
    wordPlayer?.pause?.();
    wordPlayer?.seekTo?.(0);
};

export const pauseSound = () => {
    wordPlayer?.pause?.();
};

export const resumeSound = () => {
    if (hasEnded) {
        wordPlayer?.seekTo?.(0);
        hasEnded = false;
    }
    wordPlayer?.play?.();
};

export const isSoundPlaying = () => {
    return wordPlayer?.playing ?? false;
};

export const getPlayer = () => wordPlayer;

const UI_SOUNDS = {
  correct: require("../assets/sounds/correct.mp3"),
  wrong: require("../assets/sounds/wrong.mp3"),
  win: require("../assets/sounds/win.mp3"),
  second_win: require("../assets/sounds/second-win.mp3"),
};

export const playUISound = async (soundName) => {
  await initAudio();

  uiPlayer.pause?.();
  uiPlayer.seekTo?.(0);

  uiPlayer.replace?.(UI_SOUNDS[soundName]);
  uiPlayer.play?.();
};