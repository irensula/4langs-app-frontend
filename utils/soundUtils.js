import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

let wordPlayer = null;
let uiPlayer = null;

export const initAudio = async () => {
  if (!wordPlayer) wordPlayer = createAudioPlayer();
  if (!uiPlayer) uiPlayer = createAudioPlayer();

  await setAudioModeAsync({
    playsInSilentMode: true,
  });
};

export const playSound = async (file, baseUri = "") => {
  await initAudio();

  const uri = `${baseUri}${file}`;

  wordPlayer.pause?.();
  wordPlayer.seekTo?.(0);

  wordPlayer.replace?.({ uri });
  wordPlayer.play?.();
};

export const stopSound = () => {
    wordPlayer.pause?.();
    wordPlayer.seekTo?.(0);
};

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