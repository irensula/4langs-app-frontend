import Constants from "expo-constants";

const API_BASE = Constants.expoConfig?.extra?.API_BASE;
console.log("API_BASE:", API_BASE);
let logoutRef = null;

export const setApiHandlers = (logout) => {
  logoutRef = logout;
};

const handle401 = async () => {
  if (logoutRef) await logoutRef();
};

const request = async (endpoint, options = {}) => {
  try {
    console.log("API CALL:", endpoint);

    let res;

    try {
      res = await safeFetch(`${API_BASE}${endpoint}`, options);
    } catch (networkError) {
      console.log("❌ NETWORK FAIL:", endpoint, networkError);
      throw networkError;
    }

    console.log("STATUS:", res.status);

    let data = null;

    const text = await res.text().catch(() => null);

    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.log("JSON parse error:", text);
      }
    }

    if (!res.ok) {
      throw {
        status: res.status,
        response: data,
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

const fetchWithTimeout = (url, options = {}, ms = 12000) => {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, ms);

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => {
    clearTimeout(timeout);
  });
};

const wait = (ms) => new Promise(res => setTimeout(res, ms));

const safeFetch = async (url, options, retries = 2) => {
  try {
    return await fetchWithTimeout(url, options);
  } catch (e) {
    if (retries > 0) {
      await wait(500);
      return safeFetch(url, options, retries - 1);
    }
    throw e;
  }
};

export const getImageUrl = (path) => {
  return `${API_BASE}${path}`;
};

export const getSoundUrl = (path) => {
  return `${API_BASE}${path}`;
};