import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { Link } from "react-router-dom";
import {
  insightsApi,
  consumptionApi,
  generationApi,
  projectsApi,
} from "../services/api";
import { EnergySummary, EnergySourceType, Project } from "../types";
import { useDateRange } from "../context/DateRangeContext";
import { useAuth } from "../context/AuthContext"; // Import auth context
import EnergySummaryCard from "../components/EnergySummaryCard";
import EnvironmentalImpactCard from "../components/EnvironmentalImpactCard";
import SourceDistributionChart from "../components/charts/SourceDistributionChart";
import ConsumptionGenerationBarChart from "../components/charts/ConsumptionGenerationBarChart";
import Icon from "../components/icons/Icon";

const Dashboard = () => {
  const { startDate, endDate } = useDateRange();
  const { token, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [summary, setSummary] = useState<EnergySummary | null>(null);
  const [_, setHourlyConsumptionData] = useState<any[]>([]);
  const [consumptionBySource, setConsumptionBySource] = useState<
    Record<string, number>
  >({});
  const [generationBySource, setGenerationBySource] = useState<
    Record<string, number>
  >({});

  const activeSourceTypes = [
    EnergySourceType.BIOMASS,
    EnergySourceType.WIND,
    EnergySourceType.HYDRO,
    EnergySourceType.GEOTHERMAL,
    EnergySourceType.GRID,
    EnergySourceType.SOLAR,
  ];
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
      const sevenDaysAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");
      // Prepare filter params
      const filters = {
        start_date: startDate,
        end_date: endDate,
        source_type: activeSourceTypes,
        project_id: selectedProjectId || undefined,
      };

      // Fetch all data in parallel.
      const [
        summaryData,
        dailyConsumptionResponse,
        dailyGenerationResponse,
        hourlyConsumptionResponse,
      ] = await Promise.all([
        insightsApi.getSummary(
          startDate,
          endDate,
          selectedProjectId || undefined
        ),
        consumptionApi.getDailyAggregate(filters),
        generationApi.getDailyAggregate(filters),
        consumptionApi.getAll({ ...filters, start_date: sevenDaysAgo }),
      ]);

      setSummary(summaryData);

      if (dailyConsumptionResponse) {
        setConsumptionBySource(dailyConsumptionResponse.by_source || {});
      }

      if (dailyGenerationResponse) {
        setGenerationBySource(dailyGenerationResponse.by_source || {});
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
    if (isAuthenticated && token) {
      loadDashboardData();
    }
  }, [startDate, endDate, selectedProjectId, token, isAuthenticated]);

  // Handle project change
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedProjectId(value ? Number(value) : null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1
          className="text-2xl font-bold mb-4 md:mb-0"
          style={{ color: "var(--color-text)" }}
        >
          Portfolio
        </h1>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Project selector */}
          {!loadingProjects && projects.length > 0 && (
            <div className="relative">
              <select
                value={selectedProjectId || ""}
                onChange={handleProjectChange}
                className="block w-full py-2 pl-3 pr-10 text-base rounded-md focus:outline-none focus:ring-primary"
                style={{
                  backgroundColor: "var(--color-input-bg)",
                  color: "var(--color-text)",
                  borderColor: "var(--color-input-border)",
                  borderWidth: "1px",
                  borderStyle: "solid",
                }}
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
              <Icon name="info" className="h-5 w-5" />
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
              <Icon name="info" className="h-5 w-5" />
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

      {/* Environmental Impact Card */}
      {summary &&
        (summary.total_generation > 0 ||
          Object.keys(generationBySource).length > 0) && (
          <EnvironmentalImpactCard
            summary={summary}
            generationBySource={generationBySource}
            isLoading={isLoading}
            className="mt-6"
          />
        )}

      {summary && <EnergySummaryCard summary={summary} isLoading={isLoading} />}

      {/* Energy Source Distribution and Consumption vs Generation Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="card">
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: "var(--color-text)" }}
          >
            {Object.keys(consumptionBySource).length > 0
              ? "Energy Consumption by Source"
              : Object.keys(generationBySource).length > 0
              ? "Energy Generation by Source"
              : "Energy Source Breakdown"}
          </h2>
          {isLoading ? (
            <div
              className="animate-pulse h-64 rounded"
              style={{ backgroundColor: "var(--color-card-border)" }}
            ></div>
          ) : Object.keys(consumptionBySource).length > 0 ? (
            // Show consumption data if available
            <SourceDistributionChart
              data={consumptionBySource}
              height={260}
              title=""
            />
          ) : Object.keys(generationBySource).length > 0 ? (
            // Show generation data if consumption isn't available
            <SourceDistributionChart
              data={generationBySource}
              height={260}
              title=""
            />
          ) : (
            <div
              className="flex items-center justify-center h-64"
              style={{ color: "var(--color-text-light)" }}
            >
              No energy source data available
            </div>
          )}
        </div>
        <div className="card">
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: "var(--color-text)" }}
          >
            Renewable Generation vs Consumption
          </h2>
          {isLoading ? (
            <div
              className="animate-pulse h-64 rounded"
              style={{ backgroundColor: "var(--color-card-border)" }}
            ></div>
          ) : summary &&
            (summary.total_consumption > 0 || summary.total_generation > 0) ? (
            <ConsumptionGenerationBarChart
              consumptionBySource={consumptionBySource}
              generationBySource={generationBySource}
              height={260}
            />
          ) : (
            <div
              className="flex items-center justify-center h-64"
              style={{ color: "var(--color-text-light)" }}
            >
              No energy data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
