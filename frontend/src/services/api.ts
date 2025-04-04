import axios from "axios";

// Create axios instance with base URL and default headers
const api = axios.create({
  baseURL: "/api/v1",
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Special handling for demo token
    if (token === "demo-token") {
      // For demo token, we'll skip adding the Authorization header
      // This tells the backend to use the demo user account
      config.headers["X-Demo-User"] = "true";
    } else if (token) {
      // Normal auth token handling
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication API
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post(
      "/auth/login",
      new URLSearchParams({
        username: username,
        password: password,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data;
  },

  register: async (email: string, username: string, password: string) => {
    const response = await api.post("/auth/register", {
      email,
      username,
      password,
    });
    return response.data;
  },
};
