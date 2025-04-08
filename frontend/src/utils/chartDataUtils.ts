import { parseISO } from "date-fns";
import {
  EnergyConsumption,
  EnergyGeneration,
  DailyAggregateData,
  WeeklyAggregateData,
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
  weeklyGenerationData: WeeklyAggregateData[]
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
  } else if (chartResolution === "daily") {
    consumption = [...dailyConsumptionData];
    generation = [...dailyGenerationData];
  } else if (chartResolution === "weekly") {
    consumption = [...weeklyConsumptionData];
    generation = [...weeklyGenerationData];
  }

  return { consumption, generation };
};

export const hasFilteredData = (
  consumptionBySource: Record<string, number>,
  generationBySource: Record<string, number>
) => {
  return (
    Object.keys(consumptionBySource).length > 0 ||
    Object.keys(generationBySource).length > 0
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
