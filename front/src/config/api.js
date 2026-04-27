const API_BASE_URL = process.env.REACT_APP_API_URL || "https://aeropulse-qgtu.onrender.com/api";

const getToken = () => localStorage.getItem("accessToken");
const getActiveBranch = () => localStorage.getItem("activeBranch");

const apiRequest = async (path, options = {}) => {
  const token = getToken();
  const activeBranch = getActiveBranch();
  const method = String(options.method || "GET").toUpperCase();
  const shouldDisableCache = method === "GET";
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    ...(shouldDisableCache ? { cache: "no-store" } : {}),
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(activeBranch ? { "X-Branch": activeBranch } : {}),
      ...(options.headers || {}),
    },
  });

  let data = null;
  try {
    data = await response.json();
  } catch (_error) {
    data = null;
  }

  if (!response.ok) {
    const message = data?.message || "Request failed";
    const err = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
};

export { API_BASE_URL, apiRequest };
