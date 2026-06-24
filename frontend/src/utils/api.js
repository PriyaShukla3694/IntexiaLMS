const rawBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const BASE = rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;

export const authFetch = async (path, options = {}) => {
  const token = localStorage.getItem("lms_token");
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    // Token expired or invalid — force logout
    localStorage.removeItem("lms_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  return res;
};
