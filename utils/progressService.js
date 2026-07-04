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
    `/progress/course/${courseId}/category/${categoryId}/exercise/${exerciseId}`,
    {
      exerciseID,
      maxScore,
      categoryID,
    },
    token,
  );
};