import axios from "axios";
import queryString from "query-string";
import {
  EnergyFilter,
  EnergyConsumption,
  EnergyGeneration,
  EnergySummary,
} from "../types";

// Get API URL from environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
const IS_PRODUCTION = import.meta.env.VITE_ENV === "production";

// Create axios instance with base URL and default headers
const api = axios.create({
  baseURL: API_BASE_URL,
  // Longer timeout for production environments
  timeout: IS_PRODUCTION ? 30000 : 10000,
  // Don't allow redirects which might cause protocol switching
  maxRedirects: 0,
  // Force protocol to stay as HTTP
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
  paramsSerializer: (params) =>
    queryString.stringify(params, { arrayFormat: "none" }),
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("API Error Response:", {
        data: error.response.data,
        status: error.response.status,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error("API No Response:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("API Request Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Make sure headers object exists
    if (!config.headers) {
      config.headers = new axios.AxiosHeaders();
    }

    // Add token to auth header if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add content type if not already set
    if (!config.headers["Content-Type"] && !config.headers["content-type"]) {
      config.headers["Content-Type"] = "application/json";
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

// Projects API
export const projectsApi = {
  getAll: async () => {
    const response = await api.get("/projects");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    description?: string;
    location?: string;
  }) => {
    const response = await api.post("/projects", data);
    return response.data;
  },

  update: async (
    id: number,
    data: { name?: string; description?: string; location?: string }
  ) => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/projects/${id}`);
    return true;
  },
};

// Energy Consumption API
export const consumptionApi = {
  getAll: async (filters?: EnergyFilter) => {
    const response = await api.get("/energy/consumption", { params: filters });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/energy/consumption/${id}`);
    return response.data;
  },

  create: async (data: Partial<EnergyConsumption>) => {
    const response = await api.post("/energy/consumption", data);
    return response.data;
  },

  update: async (id: number, data: Partial<EnergyConsumption>) => {
    const response = await api.put(`/energy/consumption/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/energy/consumption/${id}`);
    return true;
  },

  batchCreate: async (data: Partial<EnergyConsumption>[]) => {
    const response = await api.post("/energy/consumption/batch-create", data);
    return response.data;
  },

  getDailyAggregate: async (filters?: EnergyFilter) => {
    const response = await api.get("/energy/consumption/aggregate/daily", {
      params: filters,
    });
    return response.data;
  },

  getWeeklyAggregate: async (filters?: EnergyFilter) => {
    const response = await api.get("/energy/consumption/aggregate/weekly", {
      params: filters,
    });
    return response.data;
  },
};

// Energy Generation API
export const generationApi = {
  getAll: async (filters?: EnergyFilter) => {
    const response = await api.get("/energy/generation", { params: filters });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/energy/generation/${id}`);
    return response.data;
  },

  create: async (data: Partial<EnergyGeneration>) => {
    const response = await api.post("/energy/generation", data);
    return response.data;
  },

  update: async (id: number, data: Partial<EnergyGeneration>) => {
    const response = await api.put(`/energy/generation/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/energy/generation/${id}`);
    return true;
  },

  batchCreate: async (data: Partial<EnergyGeneration>[]) => {
    const response = await api.post("/energy/generation/batch-create", data);
    return response.data;
  },

  getDailyAggregate: async (filters?: EnergyFilter) => {
    const response = await api.get("/energy/generation/aggregate/daily", {
      params: filters,
    });
    return response.data;
  },

  getWeeklyAggregate: async (filters?: EnergyFilter) => {
    const response = await api.get("/energy/generation/aggregate/weekly", {
      params: filters,
    });
    return response.data;
  },
};

// Insights API
export const insightsApi = {
  getSummary: async (
    startDate?: string,
    endDate?: string,
    projectId?: number
  ) => {
    const response = await api.get<EnergySummary>("/insights/summary", {
      params: {
        start_date: startDate,
        end_date: endDate,
        project_id: projectId,
      },
    });
    return response.data;
  },
};

export default api;
