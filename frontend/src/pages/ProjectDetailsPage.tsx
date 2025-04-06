import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  projectsApi,
  insightsApi,
  consumptionApi,
  generationApi,
} from "../services/api";
import {
  Project,
  EnergySummary,
  EnergySourceType,
  DailyAggregateData,
  EnergyConsumption,
  EnergyGeneration,
  WeeklyAggregateData,
  Alert,
  getAlertsForProject,
  ALERTS_STORAGE_KEY,
  SavedVisualization,
  getVisualizationsForProject,
  VISUALIZATIONS_STORAGE_KEY,
} from "../types";
import { useDateRange } from "../context/DateRangeContext";
import EnergyChart from "../components/charts/EnergyChart";
import SourceDistributionChart from "../components/charts/SourceDistributionChart";
import SavedVisualizations from "../components/project/SavedVisualizations";
import ProjectAlerts from "../components/project/ProjectAlerts";
import ChartControls from "../components/project/ChartControls";
import AlertNotification from "../components/project/AlertNotification";
import ProjectHeader from "../components/project/ProjectHeader";
import {
  getEnergyChartData,
  getFilteredSourceData,
  hasFilteredData as checkFilteredData,
  getChartTitle,
} from "../utils/chartDataUtils";

// Chart view types
type ChartView = "graph" | "pie";
type DataType = "consumption" | "generation" | "both";

const ProjectDetailsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { startDate, endDate, setDateRange } = useDateRange();

  // Project data state
  const [project, setProject] = useState<Project | null>(null);
  const [summary, setSummary] = useState<EnergySummary | null>(null);

  // Energy data state
  const [consumptionData, setConsumptionData] = useState<EnergyConsumption[]>(
    []
  );
  const [generationData, setGenerationData] = useState<EnergyGeneration[]>([]);
  const [dailyConsumptionData, setDailyConsumptionData] = useState<
    DailyAggregateData[]
  >([]);
  const [dailyGenerationData, setDailyGenerationData] = useState<
    DailyAggregateData[]
  >([]);
  const [weeklyConsumptionData, setWeeklyConsumptionData] = useState<
    WeeklyAggregateData[]
  >([]);
  const [weeklyGenerationData, setWeeklyGenerationData] = useState<
    WeeklyAggregateData[]
  >([]);
  const [consumptionBySource, setConsumptionBySource] = useState<
    Record<string, number>
  >({});
  const [generationBySource, setGenerationBySource] = useState<
    Record<string, number>
  >({});
  const [totalConsumption, setTotalConsumption] = useState(0);
  const [totalGeneration, setTotalGeneration] = useState(0);

  // Chart configuration state
  const [chartView, setChartView] = useState<ChartView>("graph");
  // dataType is now always "both"
  const dataType: DataType = "both";
  const [chartResolution, setChartResolution] = useState<
    "hourly" | "daily" | "weekly"
  >("daily");
  const [sourceFilters, setSourceFilters] = useState<EnergySourceType[]>([]);

  // Saved visualizations and alerts
  const [savedVisualizations, setSavedVisualizations] = useState<
    SavedVisualization[]
  >(() => {
    const saved = localStorage.getItem(VISUALIZATIONS_STORAGE_KEY);
    const allVisualizations = saved ? JSON.parse(saved) : [];
    return projectId
      ? getVisualizationsForProject(allVisualizations, Number(projectId))
      : [];
  });

  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem(ALERTS_STORAGE_KEY);
    const allAlerts = saved ? JSON.parse(saved) : [];
    return projectId ? getAlertsForProject(allAlerts, Number(projectId)) : [];
  });

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [triggeredAlerts, setTriggeredAlerts] = useState<string[]>([]);
  const [showTriggeredAlerts, setShowTriggeredAlerts] = useState(false);

  // Load project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) return;

      try {
        const projectData = await projectsApi.getById(Number(projectId));
        setProject(projectData);
      } catch (error) {
        console.error("Error loading project details:", error);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  // Toggle source filter
  const toggleSourceFilter = (source: EnergySourceType) => {
    if (sourceFilters.includes(source)) {
      setSourceFilters(sourceFilters.filter((s) => s !== source));
    } else {
      setSourceFilters([...sourceFilters, source]);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSourceFilters([]);
  };

  // Handle chart resolution change
  const handleResolutionChange = (
    resolution: "hourly" | "daily" | "weekly"
  ) => {
    setChartResolution(resolution);
  };

  // Load saved visualization
  const loadVisualization = (visualization: SavedVisualization) => {
    setDateRange(visualization.startDate, visualization.endDate);
    setChartView(visualization.chartView);
    setSourceFilters(visualization.sourceFilters);
    setChartResolution(visualization.timeFrame);
  };

  // Delete saved visualization
  const deleteVisualization = (id: string) => {
    // Update local state
    const updatedVisualizations = savedVisualizations.filter(
      (v) => v.id !== id
    );
    setSavedVisualizations(updatedVisualizations);

    // Update localStorage
    const saved = localStorage.getItem(VISUALIZATIONS_STORAGE_KEY);
    if (saved) {
      const allVisualizations = JSON.parse(saved);
      const filteredVisualizations = allVisualizations.filter(
        (v: SavedVisualization) => v.id !== id
      );
      localStorage.setItem(
        VISUALIZATIONS_STORAGE_KEY,
        JSON.stringify(filteredVisualizations)
      );
    }
  };

  // Save current visualization
  const saveVisualization = (name: string, isGlobal: boolean) => {
    const newVisualization: SavedVisualization = {
      id: Date.now().toString(),
      name,
      chartView,
      dataType,
      sourceFilters,
      timeFrame: chartResolution,
      startDate,
      endDate,
      global: isGlobal,
      project_id: Number(projectId),
    };

    // Update local state
    setSavedVisualizations([...savedVisualizations, newVisualization]);

    // Update localStorage
    const saved = localStorage.getItem(VISUALIZATIONS_STORAGE_KEY);
    const allVisualizations = saved ? JSON.parse(saved) : [];
    allVisualizations.push(newVisualization);
    localStorage.setItem(
      VISUALIZATIONS_STORAGE_KEY,
      JSON.stringify(allVisualizations)
    );
  };

  // Save new alert
  const saveAlert = (
    name: string,
    type: "consumption" | "generation",
    threshold: number,
    condition: "above" | "below",
    isGlobal: boolean
  ) => {
    const newAlert: Alert = {
      id: Date.now().toString(),
      name,
      type,
      threshold,
      condition,
      active: true,
      global: isGlobal,
      project_id: Number(projectId),
    };

    // Update local state
    setAlerts([...alerts, newAlert]);

    // Update localStorage
    const saved = localStorage.getItem(ALERTS_STORAGE_KEY);
    const allAlerts = saved ? JSON.parse(saved) : [];
    allAlerts.push(newAlert);
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(allAlerts));
  };

  // Toggle alert active status
  const toggleAlertStatus = (id: string) => {
    // Update local state
    const updatedAlerts = alerts.map((alert) =>
      alert.id === id ? { ...alert, active: !alert.active } : alert
    );
    setAlerts(updatedAlerts);

    // Update localStorage
    const saved = localStorage.getItem(ALERTS_STORAGE_KEY);
    if (saved) {
      const allAlerts = JSON.parse(saved);
      const updatedAllAlerts = allAlerts.map((alert: Alert) =>
        alert.id === id ? { ...alert, active: !alert.active } : alert
      );
      localStorage.setItem(
        ALERTS_STORAGE_KEY,
        JSON.stringify(updatedAllAlerts)
      );
    }
  };

  // Delete alert
  const deleteAlert = (id: string) => {
    // Update local state
    const updatedAlerts = alerts.filter((a) => a.id !== id);
    setAlerts(updatedAlerts);

    // Update localStorage
    const saved = localStorage.getItem(ALERTS_STORAGE_KEY);
    if (saved) {
      const allAlerts = JSON.parse(saved);
      const filteredAlerts = allAlerts.filter((a: Alert) => a.id !== id);
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(filteredAlerts));
    }
  };

  // Check alerts against current data
  useEffect(() => {
    // Only check enabled alerts
    const activeAlerts = alerts.filter((alert) => alert.active);
    if (activeAlerts.length === 0) return;

    const triggered: string[] = [];

    activeAlerts.forEach((alert) => {
      const value =
        alert.type === "consumption" ? totalConsumption : totalGeneration;
      const triggerCondition =
        (alert.condition === "above" && value > alert.threshold) ||
        (alert.condition === "below" && value < alert.threshold);

      if (triggerCondition) {
        triggered.push(
          `${alert.name}: ${alert.type} is ${
            alert.condition === "above" ? "above" : "below"
          } threshold of ${alert.threshold} kWh (Current: ${value.toFixed(
            1
          )} kWh)`
        );
      }
    });

    if (triggered.length > 0) {
      setTriggeredAlerts(triggered);
      setShowTriggeredAlerts(true);
    }
  }, [alerts, totalConsumption, totalGeneration]);

  // Load energy data
  const loadEnergyData = async () => {
    if (!projectId) return;

    setIsLoading(true);
    try {
      // Prepare filter params
      const filters = {
        start_date: startDate,
        end_date: endDate,
        source_type: sourceFilters.length > 0 ? sourceFilters : undefined,
        project_id: Number(projectId),
      };

      // Fetch all relevant data in parallel
      const [
        summaryData,
        consumptionResponse,
        generationResponse,
        dailyConsumptionResponse,
        dailyGenerationResponse,
        weeklyConsumptionResponse,
        weeklyGenerationResponse,
      ] = await Promise.all([
        insightsApi.getSummary(startDate, endDate, Number(projectId)),
        consumptionApi.getAll(filters),
        generationApi.getAll(filters),
        consumptionApi.getDailyAggregate(filters),
        generationApi.getDailyAggregate(filters),
        consumptionApi.getWeeklyAggregate(filters),
        generationApi.getWeeklyAggregate(filters),
      ]);

      // Set summary data
      setSummary(summaryData);
      setTotalConsumption(summaryData?.total_consumption || 0);
      setTotalGeneration(summaryData?.total_generation || 0);

      // Set hourly data
      setConsumptionData(consumptionResponse || []);
      setGenerationData(generationResponse || []);

      // Set source distribution data
      if (dailyConsumptionResponse) {
        setConsumptionBySource(dailyConsumptionResponse.by_source || {});
        setDailyConsumptionData(
          dailyConsumptionResponse.daily_consumption || []
        );
      }

      if (dailyGenerationResponse) {
        setGenerationBySource(dailyGenerationResponse.by_source || {});
        setDailyGenerationData(dailyGenerationResponse.daily_generation || []);
      }

      // Set weekly data
      if (weeklyConsumptionResponse) {
        setWeeklyConsumptionData(
          weeklyConsumptionResponse.weekly_consumption || []
        );
      }

      if (weeklyGenerationResponse) {
        setWeeklyGenerationData(
          weeklyGenerationResponse.weekly_generation || []
        );
      }
    } catch (error) {
      console.error("Error loading energy data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when filters change
  useEffect(() => {
    loadEnergyData();
  }, [projectId, startDate, endDate, sourceFilters]);

  // Check if there's data available after filtering
  const hasFilteredData = () => {
    return checkFilteredData(
      consumptionBySource,
      generationBySource,
      sourceFilters
    );
  };

  // Get chart data based on current settings
  const getChartData = () => {
    const energyChartData = getEnergyChartData(
      chartResolution,
      startDate,
      endDate,
      consumptionData,
      generationData,
      dailyConsumptionData,
      dailyGenerationData,
      weeklyConsumptionData,
      weeklyGenerationData,
      sourceFilters
    );

    return {
      consumption: energyChartData.consumption || [],
      generation: energyChartData.generation || [],
    };
  };

  return (
    <div className="space-y-6">
      {/* Alert notification banner */}
      <AlertNotification
        triggeredAlerts={triggeredAlerts}
        onClose={() => setShowTriggeredAlerts(false)}
      />

      {/* Project header */}
      <ProjectHeader project={project} isLoading={isLoading} />

      {/* Chart controls */}
      <div className="card">
        <div className="flex-grow mb-6">
          <ChartControls
            chartView={chartView}
            setChartView={setChartView}
            chartResolution={chartResolution}
            handleResolutionChange={handleResolutionChange}
            sourceFilters={sourceFilters}
            toggleSourceFilter={toggleSourceFilter}
            resetFilters={resetFilters}
          />
        </div>

        {/* Chart Area */}
        <div className="h-[400px]">
          {isLoading ? (
            <div className="animate-pulse h-full bg-gray-200 rounded"></div>
          ) : chartView === "graph" ? (
            // Graph View
            <EnergyChart
              consumptionData={getChartData().consumption}
              generationData={getChartData().generation}
              chartType="line"
              height={400}
              timeFrame={chartResolution}
              title={getChartTitle(chartResolution)}
            />
          ) : (
            // Pie Chart View - Separate charts for consumption and generation
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Consumption Pie Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">
                  Consumption by Source
                </h3>
                {Object.keys(
                  getFilteredSourceData(
                    consumptionBySource,
                    generationBySource,
                    sourceFilters
                  ).consumption
                ).length > 0 ? (
                  <SourceDistributionChart
                    key={`pie-consumption-${sourceFilters.join("-")}`}
                    data={
                      getFilteredSourceData(
                        consumptionBySource,
                        generationBySource,
                        sourceFilters
                      ).consumption
                    }
                    chartType="pie"
                    height={300}
                    title=""
                    resolutionControls={null}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-center p-6">
                      <p className="text-gray-500">
                        No consumption data matches your filter selection
                      </p>
                      <button
                        onClick={resetFilters}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Generation Pie Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">
                  Generation by Source
                </h3>
                {Object.keys(
                  getFilteredSourceData(
                    consumptionBySource,
                    generationBySource,
                    sourceFilters
                  ).generation
                ).length > 0 ? (
                  <SourceDistributionChart
                    key={`pie-generation-${sourceFilters.join("-")}`}
                    data={
                      getFilteredSourceData(
                        consumptionBySource,
                        generationBySource,
                        sourceFilters
                      ).generation
                    }
                    chartType="pie"
                    height={300}
                    title=""
                    resolutionControls={null}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-center p-6">
                      <p className="text-gray-500">
                        No generation data matches your filter selection
                      </p>
                      <button
                        onClick={resetFilters}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Saved Visualizations & Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Saved Visualizations */}
        <SavedVisualizations
          savedVisualizations={savedVisualizations}
          loadVisualization={loadVisualization}
          deleteVisualization={deleteVisualization}
          saveVisualization={saveVisualization}
        />

        {/* Alerts */}
        <ProjectAlerts
          alerts={alerts}
          toggleAlertStatus={toggleAlertStatus}
          deleteAlert={deleteAlert}
          saveAlert={saveAlert}
          totalConsumption={totalConsumption}
          totalGeneration={totalGeneration}
        />
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
