import { parseISO } from "date-fns";
import {
  EnergyConsumption,
  EnergyGeneration,
  DailyAggregateData,
  WeeklyAggregateData,
  EnergySourceType,
} from "../types";

/**
 * Process data for energy line/bar charts based on time resolution
 */
export const getEnergyChartData = (
  chartResolution: "hourly" | "daily" | "weekly",
  startDate: string,
  endDate: string,
  consumptionData: EnergyConsumption[],
  generationData: EnergyGeneration[],
  dailyConsumptionData: DailyAggregateData[],
  dailyGenerationData: DailyAggregateData[],
  weeklyConsumptionData: WeeklyAggregateData[],
  weeklyGenerationData: WeeklyAggregateData[],
  sourceFilters: EnergySourceType[]
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let consumption: any[] = [];
  let generation: any[] = [];

  if (chartResolution === "hourly") {
    // Use hourly data and filter by the selected date range
    consumption = consumptionData
      .filter((item) => {
        const itemDate = parseISO(item.timestamp);
        return itemDate >= start && itemDate <= end;
      })
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

    generation = generationData
      .filter((item) => {
        const itemDate = parseISO(item.timestamp);
        return itemDate >= start && itemDate <= end;
      })
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

    // Apply source type filters for hourly data
    if (sourceFilters.length > 0) {
      consumption = consumption.filter((item) =>
        sourceFilters.includes(item.source_type)
      );
      generation = generation.filter((item) =>
        sourceFilters.includes(item.source_type)
      );
    }
  } else if (chartResolution === "daily") {
    // Use daily aggregated data
    consumption = [...dailyConsumptionData];
    generation = [...dailyGenerationData];
  } else if (chartResolution === "weekly") {
    // Use weekly aggregated data
    consumption = [...weeklyConsumptionData];
    generation = [...weeklyGenerationData];
  }

  return { consumption, generation };
};

/**
 * Filter consumption and generation data by source
 */
export const getFilteredSourceData = (
  consumptionBySource: Record<string, number>,
  generationBySource: Record<string, number>,
  sourceFilters: EnergySourceType[]
) => {
  if (sourceFilters.length === 0) {
    return {
      consumption: consumptionBySource,
      generation: generationBySource,
    };
  }

  // Filter sources based on selected filters
  const filteredConsumption: Record<string, number> = {};
  const filteredGeneration: Record<string, number> = {};

  Object.entries(consumptionBySource).forEach(([source, value]) => {
    if (sourceFilters.includes(source as EnergySourceType)) {
      filteredConsumption[source] = value;
    }
  });

  Object.entries(generationBySource).forEach(([source, value]) => {
    if (sourceFilters.includes(source as EnergySourceType)) {
      filteredGeneration[source] = value;
    }
  });

  return {
    consumption: filteredConsumption,
    generation: filteredGeneration,
  };
};

/**
 * Check if there's data available after filtering
 */
export const hasFilteredData = (
  consumptionBySource: Record<string, number>,
  generationBySource: Record<string, number>,
  sourceFilters: EnergySourceType[]
) => {
  const { consumption, generation } = getFilteredSourceData(
    consumptionBySource,
    generationBySource,
    sourceFilters
  );

  return (
    Object.keys(consumption).length > 0 || Object.keys(generation).length > 0
  );
};

/**
 * Get chart title based on resolution
 */
export const getChartTitle = (chartResolution: string): string => {
  switch (chartResolution) {
    case "hourly":
      return "Hourly Energy Overview";
    case "daily":
      return "Daily Energy Overview";
    case "weekly":
      return "Weekly Energy Overview";
    case "monthly":
      return "Monthly Energy Overview";
    case "yearly":
      return "Yearly Energy Overview";
    default:
      return "Energy Overview";
  }
};
