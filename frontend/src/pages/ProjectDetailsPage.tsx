import { useState } from "react";
import { useParams } from "react-router-dom";
import { useDateRange } from "../context/DateRangeContext";
import { EnergySourceType } from "../types";
import EnergyChart from "../components/charts/EnergyChart";
import SourceDistributionChart from "../components/charts/SourceDistributionChart";
import SavedVisualizations from "../components/project/SavedVisualizations";
import ProjectAlerts from "../components/project/ProjectAlerts";
import ChartControls from "../components/project/ChartControls";
import AlertNotification from "../components/project/AlertNotification";
import ProjectHeader from "../components/project/ProjectHeader";
import { getEnergyChartData, getChartTitle } from "../utils/chartDataUtils";

import { useEnergyData } from "../hooks/useEnergyData";
import { useAlerts } from "../hooks/useAlerts";
import { useVisualizations } from "../hooks/useVisualizations";

type ChartView = "graph" | "pie";
type DataType = "consumption" | "generation" | "both";
type ChartResolution = "hourly" | "daily" | "weekly";

const ProjectDetailsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { startDate, endDate, setDateRange } = useDateRange();

  const [chartView, setChartView] = useState<ChartView>("graph");
  const dataType: DataType = "both"; // Always both in this implementation
  const [chartResolution, setChartResolution] =
    useState<ChartResolution>("hourly");
  const [sourceFilters, setSourceFilters] = useState<EnergySourceType[]>([
    EnergySourceType.SOLAR,
    EnergySourceType.WIND,
    EnergySourceType.HYDRO,
    EnergySourceType.GEOTHERMAL,
    EnergySourceType.BIOMASS,
    EnergySourceType.GRID,
  ]);

  // Load energy data with custom hook
  const {
    project,
    consumptionData,
    generationData,
    dailyConsumptionData,
    dailyGenerationData,
    weeklyConsumptionData,
    weeklyGenerationData,
    consumptionBySource,
    generationBySource,
    totalConsumption,
    totalGeneration,
    isLoading,
  } = useEnergyData({
    projectId,
    startDate,
    endDate,
    sourceFilters,
  });

  // Handle alerts with custom hook
  const {
    alerts,
    triggeredAlerts,
    showTriggeredAlerts,
    setShowTriggeredAlerts,
    saveAlert,
    toggleAlertStatus,
    deleteAlert,
  } = useAlerts({
    projectId,
    totalConsumption,
    totalGeneration,
  });

  // Handle visualizations with custom hook
  const {
    savedVisualizations,
    saveVisualization,
    loadVisualization,
    deleteVisualization,
  } = useVisualizations(
    { projectId },
    {
      chartView,
      sourceFilters,
      chartResolution,
      startDate,
      endDate,
      dataType,
    },
    (settings) => {
      if (settings.chartView) setChartView(settings.chartView);
      if (settings.sourceFilters) setSourceFilters(settings.sourceFilters);
      if (settings.chartResolution)
        setChartResolution(settings.chartResolution);
      if (settings.startDate && settings.endDate) {
        setDateRange(settings.startDate, settings.endDate);
      }
    }
  );

  // Filter functions
  const toggleSourceFilter = (source: EnergySourceType) => {
    if (sourceFilters.includes(source)) {
      setSourceFilters(sourceFilters.filter((s) => s !== source));
    } else {
      setSourceFilters([...sourceFilters, source]);
    }
  };

  const resetFilters = () => {
    setSourceFilters([
      EnergySourceType.SOLAR,
      EnergySourceType.WIND,
      EnergySourceType.HYDRO,
      EnergySourceType.GEOTHERMAL,
      EnergySourceType.BIOMASS,
      EnergySourceType.GRID,
    ]);
  };

  // Get chart data based on current settings
  const getChartData = () => {
    const energyChartData = getEnergyChartData(
      chartResolution,
      consumptionData,
      generationData,
      dailyConsumptionData,
      dailyGenerationData,
      weeklyConsumptionData,
      weeklyGenerationData
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
        show={showTriggeredAlerts}
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
            handleResolutionChange={setChartResolution}
            sourceFilters={sourceFilters}
            toggleSourceFilter={toggleSourceFilter}
            resetFilters={resetFilters}
          />
        </div>

        {/* Chart Area */}
        <div className={chartView === "graph" ? "h-[410px]" : ""}>
          {isLoading ? (
            <div
              className="animate-pulse h-full rounded"
              style={{ backgroundColor: "var(--color-card-border)" }}
            ></div>
          ) : chartView === "graph" ? (
            // Graph View
            <EnergyChart
              consumptionData={getChartData().consumption}
              generationData={getChartData().generation}
              chartType="line"
              height={380}
              timeFrame={chartResolution}
              title={getChartTitle(chartResolution)}
            />
          ) : (
            // Pie Chart View - Separate charts for consumption and generation
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <>
                {/* Consumption Pie Chart */}
                <div>
                  <h3
                    className="text-lg font-semibold mb-2 text-center"
                    style={{ color: "var(--color-text)" }}
                  >
                    Consumption by Sourcess
                  </h3>
                  {Object.keys(consumptionBySource).length > 0 ? (
                    <SourceDistributionChart
                      key={`pie-consumption-${sourceFilters.join("-")}`}
                      data={consumptionBySource}
                      height={300}
                      title=""
                      resolutionControls={null}
                    />
                  ) : (
                    <div
                      className="flex items-center justify-center h-[300px] rounded-lg border"
                      style={{
                        backgroundColor: "var(--color-background-dark)",
                        borderColor: "var(--color-card-border)",
                      }}
                    >
                      <div className="text-center p-6">
                        <p style={{ color: "var(--color-text-light)" }}>
                          No consumption data matches your filter selection
                        </p>
                        <button
                          onClick={resetFilters}
                          className="mt-3 text-sm font-medium hover:opacity-80"
                          style={{ color: "var(--color-primary)" }}
                        >
                          Reset Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Generation Pie Chart */}
                <div>
                  <h3
                    className="text-lg font-semibold mb-2 text-center"
                    style={{ color: "var(--color-text)" }}
                  >
                    Generation by Source
                  </h3>
                  {Object.keys(generationBySource).length > 0 ? (
                    <SourceDistributionChart
                      key={`pie-generation-${sourceFilters.join("-")}`}
                      data={generationBySource}
                      height={300}
                      title=""
                      resolutionControls={null}
                    />
                  ) : (
                    <div
                      className="flex items-center justify-center h-[300px] rounded-lg border"
                      style={{
                        backgroundColor: "var(--color-background-dark)",
                        borderColor: "var(--color-card-border)",
                      }}
                    >
                      <div className="text-center p-6">
                        <p style={{ color: "var(--color-text-light)" }}>
                          No generation data matches your filter selection
                        </p>
                        <button
                          onClick={resetFilters}
                          className="mt-3 text-sm font-medium hover:opacity-80"
                          style={{ color: "var(--color-primary)" }}
                        >
                          Reset Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
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
