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
  user_id: number;
  timestamp: string;
  value_kwh: number;
  source_type: EnergySourceType;
  created_at: string;
  updated_at?: string;
}

export interface EnergyGenerationData {
  id: number;
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
}
