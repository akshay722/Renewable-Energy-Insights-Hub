import axios from "axios";
import {
  EnergyFilter,
  EnergyConsumption,
  EnergyGeneration,
  EnergySummary,
  InsightRecommendation,
  EnergyTrends,
} from "../types";

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
  getSummary: async (startDate?: string, endDate?: string) => {
    const response = await api.get<EnergySummary>("/insights/summary", {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  getRecommendations: async () => {
    const response = await api.get<InsightRecommendation[]>(
      "/insights/recommendations"
    );
    return response.data;
  },

  getTrends: async (months: number = 3) => {
    const response = await api.get<EnergyTrends>("/insights/trends", {
      params: { months },
    });
    return response.data;
  },
};

// No mock data API - data is handled externally

export default api;
