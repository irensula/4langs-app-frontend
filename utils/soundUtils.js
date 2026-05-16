import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

let player = null;

export const initAudio = async () => {
  if (!player) {
    await setAudioModeAsync({
      playsInSilentMode: true,
    });

    player = createAudioPlayer();
  }
};

export const playSound = async (file, baseUri = "") => {
  if (!file) return;

  try {
    await initAudio();

    const uri = `${baseUri}${file}`;

    // reset current playback
    player.pause?.();
    player.seekTo?.(0);

    // IMPORTANT: set new source instead of creating new player
    player.replace?.({ uri }); 

    player.play?.();
  } catch (err) {
    console.error("Sound play error:", err);
  }
};