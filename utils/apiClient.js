import Constants from "expo-constants";

// 1. API BASE
const API_BASE = Constants.expoConfig?.extra?.API_BASE;

// 2. Logout-function (called when token is expired)
let logoutRef = null;

/**
 * 3. Register global API handlers (logout)
 */
export const setApiHandlers = (logout) => {
  logoutRef = logout;
};

/**
 * 4. Sleep helper (used for retry delays)
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 5. Fetch with timeout support
 * Aborts request if it takes too long
 */
const fetchWithTimeout = (url, options = {}, timeout = 12000) => {
  const controller = new AbortController();

  // after timeout ms interrupt the request
  const timer = setTimeout(() => controller.abort(), timeout);

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => clearTimeout(timer));
};

/**
 * 6. Safe fetch with retry logic
 * Retries request on network failure
 */
const safeFetch = async (url, options, retries = 2) => {
  try {
    return await fetchWithTimeout(url, options);
  } catch (error) {
    if (retries > 0) {
      await sleep(500); // a short delay
      return safeFetch(url, options, retries - 1);
    }
    throw error;
  }
};

/**
 * 7. Core request handler
 * - executes HTTP request
 * - handles 401 (logout)
 * - parses JSON response
 * - throws error for non-OK responses
 */
const request = async (endpoint, options = {}) => {
  // full URL of request
  const url = `${API_BASE}${endpoint}`;

  // execute the request
  const res = await safeFetch(url, options);

  // token expired - logout user
  if (res.status === 401) {
    if (logoutRef) await logoutRef();
    return null;
  }

   // safe JSON parsing
  const data = await res.json().catch(() => null);

  // handle HTTP errors
  if (!res.ok) {
    throw {
      status: res.status,
      response: data,
    };
  }

  return data;
};

/**
 * API wrapper methods
 */
export const api = {
  // GET request
  get: (url, token) =>
    request(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // POST request
  post: (url, body, token) =>
    request(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }),

  // PUT request
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

/**
 * build full image URL
 */
export const getImageUrl = (path) => `${API_BASE}${path}`;

/**
 * build full sound URL
 */
export const getSoundUrl = (path) => `${API_BASE}${path}`;