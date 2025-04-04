import { useState, useEffect } from "react";
import { parseISO, format, subDays } from "date-fns";
import { Link } from "react-router-dom";
import { insightsApi, consumptionApi, projectsApi } from "../services/api";
import {
  EnergySummary,
  InsightRecommendation,
  EnergySourceType,
  Project,
} from "../types";
import { useDateRange } from "../context/DateRangeContext";
import { useAuth } from "../context/AuthContext"; // Import auth context
import EnergySummaryCard from "../components/EnergySummaryCard";
import SourceDistributionChart from "../components/charts/SourceDistributionChart";
import GreenPowerHeatmap from "../components/charts/GreenPowerHeatmap";

const Dashboard = () => {
  // Use global date range from context
  const { startDate, endDate } = useDateRange();
  // Get token (or isAuthenticated) from auth context
  const { token, isAuthenticated } = useAuth();

  // State for API data
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [summary, setSummary] = useState<EnergySummary | null>(null);
  const [recommendations, setRecommendations] = useState<
    InsightRecommendation[]
  >([]);
  const [hourlyConsumptionData, setHourlyConsumptionData] = useState<any[]>([]);
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

  // Project selection state
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Load user's projects
  useEffect(() => {
    const loadProjects = async () => {
      setLoadingProjects(true);
      try {
        const data = await projectsApi.getAll();
        setProjects(data);
      } catch (error) {
        console.error("Error loading projects:", error);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

  // Load dashboard data from APIs
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch a larger range for hourly data.
      const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");

      console.log("Loading data for date range:", startDate, endDate);
      console.log("Selected project:", selectedProjectId);

      // Prepare filter params
      const filters = {
        start_date: startDate,
        end_date: endDate,
        source_type:
          activeSourceTypes.length > 0 ? activeSourceTypes : undefined,
        project_id: selectedProjectId || undefined,
      };

      // Fetch all data in parallel.
      const [
        summaryData,
        recommendationsData,
        dailyConsumptionResponse,
        hourlyConsumptionResponse,
      ] = await Promise.all([
        insightsApi.getSummary(
          startDate,
          endDate,
          selectedProjectId || undefined
        ),
        insightsApi.getRecommendations(selectedProjectId || undefined),
        consumptionApi.getDailyAggregate(filters),
        consumptionApi.getAll({ ...filters, start_date: thirtyDaysAgo }),
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

  // Reload data when the date range, selected project, or auth token changes
  useEffect(() => {
    // Only load dashboard data if the user is authenticated
    if (isAuthenticated && token) {
      loadDashboardData();
    }
  }, [startDate, endDate, selectedProjectId, token, isAuthenticated]);

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

  // Handle project change
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedProjectId(value ? Number(value) : null);
  };

  // Prepare data for charts.
  const greenVsNonGreenData = getGreenVsNonGreenData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
          Dashboard
        </h1>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Project selector */}
          {!loadingProjects && projects.length > 0 && (
            <div className="relative">
              <select
                value={selectedProjectId || ""}
                onChange={handleProjectChange}
                className="block w-full py-2 pl-3 pr-10 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
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

      {projects.length === 0 && !loadingProjects && !isLoading && (
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
                No projects found.{" "}
                <Link to="/projects" className="underline font-medium">
                  Create a new project
                </Link>{" "}
                to start tracking energy data.
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

      {/* Recommendations section can be uncommented if needed */}
    </div>
  );
};

export default Dashboard;
