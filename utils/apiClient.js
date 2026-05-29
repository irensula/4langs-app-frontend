import Constants from "expo-constants";

const API_BASE = Constants.expoConfig?.extra?.API_BASE;

let logoutRef = null;

export const setApiHandlers = (logout) => {
  logoutRef = logout;
};

const handle401 = async () => {
  if (logoutRef) await logoutRef();
};

const request = async (endpoint, options = {}) => {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);

    if (res.status === 401) {
      await handle401();
      return null;
    }

    const data = await res.json();

    if (!res.ok) {
        // console.log("API error:", res.status, data);

        throw { 
          status: res.status, 
          response: { data } 
        };
    }

    return data;

  } catch (err) {
    // console.error("Network/API error:", err);
    throw err;
  };
};

export const api = {
  get: (url, token) =>
    request(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  post: (url, body, token) =>
    request(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }),
  put: (url, body, token) =>
    request(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }),
};

export const getImageUrl = (path) => {
  return `${API_BASE}${path}`;
};

export const getSoundUrl = (path) => {
  return `${API_BASE}${path}`;
};