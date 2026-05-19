import { api } from "./apiClient";

export const saveProgress = async ({
  userId,
  token,
  exerciseID,
  selectedLanguage,
  maxScore,
  categoryID,
}) => {
  
  if (!exerciseID || !userId) return;

  return await api.post(
    `/progress/${userId}`,
    {
      exerciseID,
      selectedLanguage,
      maxScore,
      categoryID,
    },
    token,
  );
};