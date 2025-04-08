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
  consumptionData: EnergyConsumption[],
  generationData: EnergyGeneration[],
  dailyConsumptionData: DailyAggregateData[],
  dailyGenerationData: DailyAggregateData[],
  weeklyConsumptionData: WeeklyAggregateData[],
  weeklyGenerationData: WeeklyAggregateData[]
) => {
  let consumption: any[] = [];
  let generation: any[] = [];

  if (chartResolution === "hourly") {
    consumption = [...consumptionData].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    generation = [...generationData].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  } else if (chartResolution === "daily") {
    consumption = [...dailyConsumptionData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    generation = [...dailyGenerationData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  } else if (chartResolution === "weekly") {
    consumption = [...weeklyConsumptionData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    generation = [...weeklyGenerationData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
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
