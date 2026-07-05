import { api } from "./apiClient";

export const saveProgress = async ({
  token,
  courseId,
  categoryId,
  exerciseId,
}) => {
  
  if (!token || !courseId || !categoryId || !exerciseId) return;

  return await api.post(
    `/progress/course/${courseId}/category/${categoryId}/exercise/${exerciseId}`,
    {},
    token,
  );
};