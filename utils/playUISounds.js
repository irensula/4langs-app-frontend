import { initAudio } from "./soundUtils";

export const playCorrectSound = async () => {
  await initAudio();

  uiPlayer.pause?.();
  uiPlayer.seekTo?.(0);

  uiPlayer.replace?.(require("../assets/sounds/correct.mp3"));
  uiPlayer.play?.();
};