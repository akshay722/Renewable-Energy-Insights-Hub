import { useState, useEffect } from "react";
import { format, subDays, parseISO } from "date-fns";
import { insightsApi, consumptionApi, generationApi } from "../services/api";
import {
  EnergySummary,
  InsightRecommendation,
  EnergySourceType,
  isRenewableSource,
} from "../types";

import DateRangePicker from "../components/DateRangePicker";
import EnergySummaryCard from "../components/EnergySummaryCard";
import RecommendationCard from "../components/RecommendationCard";
import SourceDistributionChart from "../components/charts/SourceDistributionChart";
import GreenPowerHeatmap from "../components/charts/GreenPowerHeatmap";

const Dashboard = () => {
  // Set default date range to last 7 days
  const today = new Date();
  const sevenDaysAgo = subDays(today, 7);
  const [startDate, setStartDate] = useState(
    format(sevenDaysAgo, "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(today, "yyyy-MM-dd"));

  // State for API data
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [summary, setSummary] = useState<EnergySummary | null>(null);
  const [recommendations, setRecommendations] = useState<
    InsightRecommendation[]
  >([]);
  const [hourlyConsumptionData, setHourlyConsumptionData] = useState([]);
  const [consumptionBySource, setConsumptionBySource] = useState<
    Record<string, number>
  >({});

  // Active energy sources to display
  const [activeSourceTypes, setActiveSourceTypes] = useState<
    EnergySourceType[]
  >([
    EnergySourceType.BIOMASS,
    EnergySourceType.WIND,
    EnergySourceType.HYDRO,
    EnergySourceType.GEOTHERMAL,
    EnergySourceType.GRID,
    EnergySourceType.SOLAR,
  ]);

  // Handle date range changes
  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  // Load dashboard data from APIs
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch a larger range for hourly data.
      const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");

      console.log("Loading data for date range:", startDate, endDate);

      // Fetch all data in parallel.
      const [
        summaryData,
        recommendationsData,
        dailyConsumptionResponse,
        hourlyConsumptionResponse,
      ] = await Promise.all([
        insightsApi.getSummary(startDate, endDate),
        insightsApi.getRecommendations(),
        consumptionApi.getDailyAggregate({
          start_date: startDate,
          end_date: endDate,
          source_type: activeSourceTypes,
        }),
        consumptionApi.getAll({
          start_date: thirtyDaysAgo,
          end_date: endDate,
          source_type: activeSourceTypes,
        }),
      ]);

      setSummary(summaryData);
      setRecommendations(recommendationsData);

      if (dailyConsumptionResponse) {
        setConsumptionBySource(dailyConsumptionResponse.by_source || {});
      }
      
      if (hourlyConsumptionResponse) {
        setHourlyConsumptionData(hourlyConsumptionResponse);
      }

      if (
        summaryData &&
        (summaryData.total_consumption > 0 || summaryData.total_generation > 0)
      ) {
        setHasData(true);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reload data when the date range changes.
  useEffect(() => {
    loadDashboardData();
  }, [startDate, endDate]);

  // Calculate green vs non-green energy consumption.
  const getGreenVsNonGreenData = (): Record<string, number> => {
    if (!consumptionBySource || Object.keys(consumptionBySource).length === 0) {
      return {};
    }
    let greenTotal = 0;
    let nonGreenTotal = 0;
    Object.entries(consumptionBySource).forEach(([source, value]) => {
      if (source === "grid") {
        nonGreenTotal += value;
      } else {
        greenTotal += value;
      }
    });
    return {
      "Renewable Energy": greenTotal,
      "Non-Renewable Energy": nonGreenTotal,
    };
  };

  // Prepare data for charts.
  const greenVsNonGreenData = getGreenVsNonGreenData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
          Dashboard
        </h1>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
        />
      </div>

      {!hasData && !isLoading && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0 text-blue-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                No energy data found. Please check if data has been loaded to
                the database.
              </p>
            </div>
          </div>
        </div>
      )}

      {summary && <EnergySummaryCard summary={summary} isLoading={isLoading} />}

      {/* Energy Source Distribution and Green Power Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Energy Source Breakdown
            </h2>
            {isLoading ? (
              <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
            ) : Object.keys(consumptionBySource).length > 0 ? (
              <SourceDistributionChart
                data={consumptionBySource}
                chartType="doughnut"
                height={260}
                title="Source Distribution"
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                No consumption data available
              </div>
            )}
          </div>
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Renewable vs Non-Renewable Energy
            </h2>
            {isLoading ? (
              <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
            ) : Object.keys(greenVsNonGreenData).length > 0 ? (
              <SourceDistributionChart
                data={greenVsNonGreenData}
                chartType="pie"
                height={260}
                title="Green Energy Percentage"
                showGreenVsNonGreen={true}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                No consumption data available
              </div>
            )}
          </div>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            24/7 Green Power Coverage
          </h2>
          {isLoading ? (
            <div className="animate-pulse h-80 bg-gray-200 rounded"></div>
          ) : hourlyConsumptionData.length > 0 ? (
            <GreenPowerHeatmap
              consumptionData={hourlyConsumptionData.filter((item) => {
                const date = parseISO(item.timestamp);
                const startDt = new Date(startDate);
                const endDt = new Date(endDate);
                return date >= startDt && date <= endDt;
              })}
              viewMode="day"
              title=""
            />
          ) : (
            <div className="flex items-center justify-center h-80 text-gray-400">
              No hourly data available
            </div>
          )}
        </div>
      </div>

      {/* Recommendations section */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Recommendations
        </h2>
        {isLoading ? (
          <div className="space-y-4">
            <div className="animate-pulse h-20 bg-gray-200 rounded"></div>
            <div className="animate-pulse h-20 bg-gray-200 rounded"></div>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <RecommendationCard key={index} recommendation={recommendation} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No recommendations available.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;