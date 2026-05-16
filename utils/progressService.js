export const saveProgress = async ({
  API_BASE,
  userId,
  token,
  exerciseID,
  selectedLanguage,
  maxScore,
  categoryID,
}) => {
  if (!exerciseID || !userId) return;

  const body = {
    exerciseID,
    selectedLanguage,
    maxScore,
    categoryID,
  };

  const res = await fetch(`${API_BASE}/progress/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  
  return data;
};