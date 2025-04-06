// Authentication types
export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Project types
export interface Project {
  id: number;
  name: string;
  description?: string;
  location?: string;
  user_id: number;
  created_at: string;
  updated_at?: string;
}

// Energy data types
export enum EnergySourceType {
  SOLAR = "solar",
  WIND = "wind",
  HYDRO = "hydro",
  GEOTHERMAL = "geothermal",
  BIOMASS = "biomass",
  GRID = "grid",
}

// Helper to determine if a source is renewable
export const isRenewableSource = (source: EnergySourceType): boolean => {
  return source !== EnergySourceType.GRID;
};

export interface EnergyConsumptionData {
  id: number;
  project_id: number;
  timestamp: string;
  value_kwh: number;
  source_type: EnergySourceType;
  created_at: string;
  updated_at?: string;
}

export interface EnergyGenerationData {
  id: number;
  project_id: number;
  timestamp: string;
  value_kwh: number;
  source_type: EnergySourceType;
  efficiency?: number;
  created_at: string;
  updated_at?: string;
}

export interface EnergyConsumption extends EnergyConsumptionData {}

export interface EnergyGeneration extends EnergyGenerationData {}

export interface EnergySummary {
  total_consumption: number;
  total_generation: number;
  renewable_percentage: number;
  start_date: string;
  end_date: string;
  project_id?: number;
}

export interface DailyAggregateData {
  date: string;
  value_kwh: number;
}

export interface WeeklyAggregateData {
  date: string;
  value_kwh: number;
}

export interface AggregatedEnergyData {
  daily_consumption?: DailyAggregateData[];
  daily_generation?: DailyAggregateData[];
  total_kwh: number;
  by_source: Record<string, number>;
  by_project?: Record<string, number>;
  avg_efficiency?: number;
}

export interface InsightRecommendation {
  type: "reduction" | "shift" | "optimization" | "general";
  title: string;
  description: string;
}

export interface EnergyTrends {
  monthly_trends: {
    month: string;
    consumption: number;
    generation: number;
    net_usage: number;
  }[];
  consumption_by_source: Record<string, number>;
  generation_by_source: Record<string, number>;
}

// Filter parameters
export interface DateRangeFilter {
  start_date?: string;
  end_date?: string;
}

export interface EnergyFilter extends DateRangeFilter {
  source_type?: EnergySourceType[];
  project_id?: number;
}

// Alert types
export interface Alert {
  id: string;
  name: string;
  type: "consumption" | "generation";
  threshold: number;
  condition: "above" | "below";
  active: boolean;
  project_id: number | null; // null means global alert
  global: boolean; // true for global alerts across all projects
}

// Visualization types
export interface SavedVisualization {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  chartView: "graph" | "pie";
  dataType: "consumption" | "generation" | "both";
  sourceFilters: EnergySourceType[];
  timeFrame: "hourly" | "daily" | "weekly";
  project_id: number | null; // null means global visualization
  global: boolean; // true for global visualizations across all projects
}

// Helper functions for alert management
export const getAlertsForProject = (
  alerts: Alert[],
  projectId: number | null
): Alert[] => {
  if (projectId === null) {
    return alerts.filter((alert) => alert.global);
  }
  return alerts.filter(
    (alert) => alert.global || alert.project_id === projectId
  );
};

// Helper functions for visualization management
export const getVisualizationsForProject = (
  visualizations: SavedVisualization[],
  projectId: number | null
): SavedVisualization[] => {
  if (projectId === null) {
    return visualizations.filter((viz) => viz.global);
  }
  return visualizations.filter(
    (viz) => viz.global || viz.project_id === projectId
  );
};

// Storage keys
export const ALERTS_STORAGE_KEY = "energyAlerts";
export const VISUALIZATIONS_STORAGE_KEY = "savedVisualizations";
