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

export const playCorrectSound = async () => {
  await initAudio();

  uiPlayer.pause?.();
  uiPlayer.seekTo?.(0);

  uiPlayer.replace?.(require("../assets/sounds/correct.mp3"));
  uiPlayer.play?.();
};