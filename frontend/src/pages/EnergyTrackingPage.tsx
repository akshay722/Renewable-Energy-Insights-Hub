import { useState, useEffect } from "react";
import { format, subDays, parseISO } from "date-fns";
import { consumptionApi, generationApi } from "../services/api";
import {
  EnergySourceType,
  DailyAggregateData,
  EnergyConsumption,
  EnergyGeneration,
  WeeklyAggregateData,
} from "../types";

import DateRangePicker from "../components/DateRangePicker";
import EnergyChart from "../components/charts/EnergyChart";
import SourceDistributionChart from "../components/charts/SourceDistributionChart";

type ChartView = "graph" | "pie";
type DataType = "consumption" | "generation" | "both";
type SavedVisualization = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  chartView: ChartView;
  dataType: DataType;
  sourceFilters: EnergySourceType[];
  timeFrame: "hourly" | "daily" | "weekly";
};

type Alert = {
  id: string;
  name: string;
  type: "consumption" | "generation";
  threshold: number;
  condition: "above" | "below";
  active: boolean;
};

const EnergyTrackingPage = () => {
  // Set default date range to last 30 days
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);
  const [startDate, setStartDate] = useState(
    format(thirtyDaysAgo, "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(today, "yyyy-MM-dd"));

  // Chart view state
  const [chartView, setChartView] = useState<ChartView>("graph");
  const [dataType, setDataType] = useState<DataType>("both");
  
  // Chart resolution: "hourly" or "daily" or "weekly"
  const [chartResolution, setChartResolution] = useState<
    "hourly" | "daily" | "weekly"
  >("daily");

  // Saved visualizations and alerts
  const [savedVisualizations, setSavedVisualizations] = useState<SavedVisualization[]>(() => {
    const saved = localStorage.getItem("savedVisualizations");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem("energyAlerts");
    return saved ? JSON.parse(saved) : [];
  });
  
  // New visualization/alert form states
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [newVisualizationName, setNewVisualizationName] = useState("");
  
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [newAlertName, setNewAlertName] = useState("");
  const [newAlertType, setNewAlertType] = useState<"consumption" | "generation">("consumption");
  const [newAlertThreshold, setNewAlertThreshold] = useState(100);
  const [newAlertCondition, setNewAlertCondition] = useState<"above" | "below">("above");

  // Active energy sources to display
  const [sourceFilters, setSourceFilters] = useState<EnergySourceType[]>([]);

  // State for API data
  const [isLoading, setIsLoading] = useState(true);
  const [consumptionData, setConsumptionData] = useState<EnergyConsumption[]>([]);
  const [generationData, setGenerationData] = useState<EnergyGeneration[]>([]);
  const [dailyConsumptionData, setDailyConsumptionData] = useState<DailyAggregateData[]>([]);
  const [dailyGenerationData, setDailyGenerationData] = useState<DailyAggregateData[]>([]);
  const [weeklyConsumptionData, setWeeklyConsumptionData] = useState<WeeklyAggregateData[]>([]);
  const [weeklyGenerationData, setWeeklyGenerationData] = useState<WeeklyAggregateData[]>([]);
  const [consumptionBySource, setConsumptionBySource] = useState<Record<string, number>>({});
  const [generationBySource, setGenerationBySource] = useState<Record<string, number>>({});
  const [totalConsumption, setTotalConsumption] = useState(0);
  const [totalGeneration, setTotalGeneration] = useState(0);

  // Source type display mapping
  const sourceTypeMap: Record<string, { label: string; color: string }> = {
    solar: { label: "Solar", color: "bg-yellow-100 text-yellow-800" },
    wind: { label: "Wind", color: "bg-sky-100 text-sky-800" },
    hydro: { label: "Hydro", color: "bg-blue-100 text-blue-800" },
    geothermal: { label: "Geothermal", color: "bg-purple-100 text-purple-800" },
    biomass: { label: "Biomass", color: "bg-green-100 text-green-800" },
    grid: { label: "Grid", color: "bg-gray-100 text-gray-800" },
  };

  // Handle date range changes
  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

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
  const handleResolutionChange = (resolution: "hourly" | "daily" | "weekly") => {
    setChartResolution(resolution);
  };

  // Save current visualization
  const saveVisualization = () => {
    if (!newVisualizationName.trim()) return;
    
    const newVisualization: SavedVisualization = {
      id: Date.now().toString(),
      name: newVisualizationName,
      startDate,
      endDate,
      chartView,
      dataType,
      sourceFilters,
      timeFrame: chartResolution
    };
    
    const updatedVisualizations = [...savedVisualizations, newVisualization];
    setSavedVisualizations(updatedVisualizations);
    localStorage.setItem("savedVisualizations", JSON.stringify(updatedVisualizations));
    
    setShowSaveForm(false);
    setNewVisualizationName("");
  };

  // Load saved visualization
  const loadVisualization = (visualization: SavedVisualization) => {
    setStartDate(visualization.startDate);
    setEndDate(visualization.endDate);
    setChartView(visualization.chartView);
    setDataType(visualization.dataType);
    setSourceFilters(visualization.sourceFilters);
    setChartResolution(visualization.timeFrame);
  };

  // Delete saved visualization
  const deleteVisualization = (id: string) => {
    const updatedVisualizations = savedVisualizations.filter(v => v.id !== id);
    setSavedVisualizations(updatedVisualizations);
    localStorage.setItem("savedVisualizations", JSON.stringify(updatedVisualizations));
  };

  // Save new alert
  const saveAlert = () => {
    if (!newAlertName.trim()) return;
    
    const newAlert: Alert = {
      id: Date.now().toString(),
      name: newAlertName,
      type: newAlertType,
      threshold: newAlertThreshold,
      condition: newAlertCondition,
      active: true
    };
    
    const updatedAlerts = [...alerts, newAlert];
    setAlerts(updatedAlerts);
    localStorage.setItem("energyAlerts", JSON.stringify(updatedAlerts));
    
    setShowAlertForm(false);
    setNewAlertName("");
  };

  // Toggle alert active status
  const toggleAlertStatus = (id: string) => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === id ? { ...alert, active: !alert.active } : alert
    );
    setAlerts(updatedAlerts);
    localStorage.setItem("energyAlerts", JSON.stringify(updatedAlerts));
  };

  // Delete alert
  const deleteAlert = (id: string) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== id);
    setAlerts(updatedAlerts);
    localStorage.setItem("energyAlerts", JSON.stringify(updatedAlerts));
  };

  // Check alerts against current data
  useEffect(() => {
    if (alerts.length === 0 || isLoading) return;
    
    const activeAlerts = alerts.filter(alert => alert.active);
    
    activeAlerts.forEach(alert => {
      if (alert.type === "consumption" && totalConsumption > 0) {
        const condition = alert.condition === "above" 
          ? totalConsumption > alert.threshold
          : totalConsumption < alert.threshold;
          
        if (condition) {
          // In a real app, this would show an actual notification
          // For now, just log to console
          console.log(`ALERT: ${alert.name} - Consumption is ${alert.condition} threshold of ${alert.threshold}kWh (Current: ${totalConsumption.toFixed(1)}kWh)`);
        }
      } else if (alert.type === "generation" && totalGeneration > 0) {
        const condition = alert.condition === "above" 
          ? totalGeneration > alert.threshold
          : totalGeneration < alert.threshold;
          
        if (condition) {
          console.log(`ALERT: ${alert.name} - Generation is ${alert.condition} threshold of ${alert.threshold}kWh (Current: ${totalGeneration.toFixed(1)}kWh)`);
        }
      }
    });
  }, [totalConsumption, totalGeneration, alerts, isLoading]);

  // Load energy data from API
  const loadEnergyData = async () => {
    setIsLoading(true);

    try {
      // Prepare filter params
      const filters = {
        start_date: startDate,
        end_date: endDate,
        source_type: sourceFilters.length > 0 ? sourceFilters : undefined,
      };

      // Fetch a larger range for hourly data
      const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");

      // Fetch all data in parallel
      const [
        consumptionListResponse,
        generationListResponse,
        dailyConsumptionResponse,
        dailyGenerationResponse,
        weeklyConsumptionResponse,
        weeklyGenerationResponse,
      ] = await Promise.all([
        consumptionApi.getAll({
          ...filters,
          start_date: thirtyDaysAgo,
        }),
        generationApi.getAll({
          ...filters,
          start_date: thirtyDaysAgo,
        }),
        consumptionApi.getDailyAggregate(filters),
        generationApi.getDailyAggregate(filters),
        consumptionApi.getWeeklyAggregate(filters),
        generationApi.getWeeklyAggregate(filters),
      ]);

      setConsumptionData(consumptionListResponse || []);
      setGenerationData(generationListResponse || []);

      if (dailyConsumptionResponse) {
        setDailyConsumptionData(dailyConsumptionResponse.daily_consumption || []);
        setConsumptionBySource(dailyConsumptionResponse.by_source || {});
        setTotalConsumption(dailyConsumptionResponse.total_kwh || 0);
      }
      
      if (dailyGenerationResponse) {
        setDailyGenerationData(dailyGenerationResponse.daily_generation || []);
        setGenerationBySource(dailyGenerationResponse.by_source || {});
        setTotalGeneration(dailyGenerationResponse.total_kwh || 0);
      }
      
      if (weeklyConsumptionResponse) {
        setWeeklyConsumptionData(weeklyConsumptionResponse.weekly_consumption || []);
      }
      
      if (weeklyGenerationResponse) {
        setWeeklyGenerationData(weeklyGenerationResponse.weekly_generation || []);
      }
    } catch (error) {
      console.error("Error loading energy data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get data for the energy chart based on the selected resolution and source filters
  const getEnergyChartData = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let consumption, generation;

    if (chartResolution === "hourly") {
      // Use hourly data and filter by the selected date range.
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

      // Apply source type filters
      if (sourceFilters.length > 0) {
        consumption = consumption.filter((item) =>
          sourceFilters.includes(item.source_type)
        );
        generation = generation.filter((item) =>
          sourceFilters.includes(item.source_type)
        );
      }
    } else if (chartResolution === "daily") {
      // Use daily aggregated data.
      consumption = dailyConsumptionData;
      generation = dailyGenerationData;
    } else if (chartResolution === "weekly") {
      // Use weekly aggregated data.
      consumption = weeklyConsumptionData;
      generation = weeklyGenerationData;
    }

    return { consumption, generation };
  };

  // Initial data loading and reload when filters change
  useEffect(() => {
    loadEnergyData();
  }, [startDate, endDate, sourceFilters]);

  // Return data for the currently selected data type (consumption, generation, or both)
  const getChartData = () => {
    const energyChartData = getEnergyChartData();
    
    if (dataType === "consumption") {
      return {
        consumption: energyChartData.consumption,
        generation: undefined
      };
    } else if (dataType === "generation") {
      return {
        consumption: undefined,
        generation: energyChartData.generation
      };
    } else {
      return energyChartData;
    }
  };

  // Get the appropriate data for pie chart based on the selected data type
  const getPieChartData = () => {
    if (dataType === "consumption") {
      return consumptionBySource;
    } else if (dataType === "generation") {
      return generationBySource;
    } else {
      // For "both", combine the data
      const combinedData: Record<string, number> = { ...consumptionBySource };
      
      // Add "_gen" suffix to generation sources to distinguish them
      Object.entries(generationBySource).forEach(([key, value]) => {
        combinedData[`${key}_gen`] = value;
      });
      
      return combinedData;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
          Energy Tracking
        </h1>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
        />
      </div>

      {/* Controls Section */}
      <div className="card">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
          {/* Chart Type Toggle */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Chart Type</h2>
            <div className="inline-flex rounded-md shadow-sm">
              <button
                type="button"
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-l-md ${
                  chartView === "graph"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } border border-gray-300`}
                onClick={() => setChartView("graph")}
              >
                Graph
              </button>
              <button
                type="button"
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-r-md ${
                  chartView === "pie"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } border border-gray-300`}
                onClick={() => setChartView("pie")}
              >
                Pie Chart
              </button>
            </div>
          </div>

          {/* Data Type Selection */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Data</h2>
            <div className="inline-flex rounded-md shadow-sm">
              <button
                type="button"
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-l-md ${
                  dataType === "consumption"
                    ? "bg-red-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } border border-gray-300`}
                onClick={() => setDataType("consumption")}
              >
                Consumption
              </button>
              <button
                type="button"
                className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
                  dataType === "both"
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } border border-gray-300`}
                onClick={() => setDataType("both")}
              >
                Both
              </button>
              <button
                type="button"
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-r-md ${
                  dataType === "generation"
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } border border-gray-300`}
                onClick={() => setDataType("generation")}
              >
                Generation
              </button>
            </div>
          </div>

          {/* Time Resolution (only for Graph view) */}
          {chartView === "graph" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Resolution</h2>
              <div className="inline-flex rounded-md shadow-sm">
                <button
                  type="button"
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-l-md ${
                    chartResolution === "hourly"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  } border border-gray-300`}
                  onClick={() => handleResolutionChange("hourly")}
                >
                  Hourly
                </button>
                <button
                  type="button"
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
                    chartResolution === "daily"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  } border border-gray-300`}
                  onClick={() => handleResolutionChange("daily")}
                >
                  Daily
                </button>
                <button
                  type="button"
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-r-md ${
                    chartResolution === "weekly"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  } border border-gray-300`}
                  onClick={() => handleResolutionChange("weekly")}
                >
                  Weekly
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Source filters */}
        <div>
          <div className="flex flex-wrap justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Energy Sources</h2>
            <button
              onClick={resetFilters}
              className="btn text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Reset Filters
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(EnergySourceType).map(([key, value]) => (
              <button
                key={key}
                onClick={() => toggleSourceFilter(value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  sourceFilters.includes(value)
                    ? "bg-primary text-white"
                    : sourceTypeMap[value]?.color || "bg-gray-100 text-gray-800"
                }`}
              >
                {sourceTypeMap[value]?.label || value}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Energy Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Consumption card */}
        <div className="card bg-red-50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-red-800">
                Total Consumption
              </h3>
              <p className="mt-2 text-3xl font-bold text-red-600">
                {totalConsumption.toFixed(1)} kWh
              </p>
            </div>
            <div className="p-2 rounded-full bg-red-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-sm text-red-700">For the selected period</p>
        </div>

        {/* Generation card */}
        <div className="card bg-green-50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-green-800">
                Total Generation
              </h3>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {totalGeneration.toFixed(1)} kWh
              </p>
            </div>
            <div className="p-2 rounded-full bg-green-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-sm text-green-700">For the selected period</p>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="card h-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {dataType === "consumption" 
              ? "Energy Consumption" 
              : dataType === "generation" 
                ? "Energy Generation" 
                : "Energy Consumption vs Generation"}
          </h2>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowSaveForm(true)}
              className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md text-sm font-medium"
            >
              Save Visualization
            </button>
            <button
              onClick={() => setShowAlertForm(true)}
              className="px-3 py-1.5 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-md text-sm font-medium"
            >
              Set Alert
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="animate-pulse h-80 bg-gray-200 rounded"></div>
        ) : chartView === "graph" ? (
          // Graph View
          <EnergyChart
            consumptionData={getChartData().consumption}
            generationData={getChartData().generation}
            chartType={dataType === "both" ? "consumption-generation" : "bar"}
            height={320}
            timeFrame={chartResolution}
            title=""
          />
        ) : (
          // Pie Chart View
          <SourceDistributionChart
            data={getPieChartData()}
            chartType="pie"
            height={320}
            title={dataType === "both" ? "Energy Distribution by Source" : `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} by Source`}
          />
        )}
      </div>

      {/* Saved Visualizations & Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Saved Visualizations */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Saved Visualizations
          </h2>
          
          {savedVisualizations.length > 0 ? (
            <div className="space-y-3">
              {savedVisualizations.map(viz => (
                <div key={viz.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">{viz.name}</h3>
                    <p className="text-sm text-gray-500">
                      {viz.chartView === "graph" ? "Graph" : "Pie"} · 
                      {viz.dataType === "consumption" 
                        ? " Consumption" 
                        : viz.dataType === "generation" 
                          ? " Generation" 
                          : " Both"}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => loadVisualization(viz)}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                    >
                      Load
                    </button>
                    <button 
                      onClick={() => deleteVisualization(viz.id)}
                      className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No saved visualizations yet. Create one by clicking "Save Visualization".</p>
          )}
          
          {/* Save Visualization Form */}
          {showSaveForm && (
            <div className="mt-4 p-4 border rounded-lg bg-blue-50">
              <h3 className="text-lg font-medium text-blue-800 mb-3">Save Current View</h3>
              <div className="mb-3">
                <label htmlFor="viz-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Visualization Name
                </label>
                <input
                  type="text"
                  id="viz-name"
                  value={newVisualizationName}
                  onChange={(e) => setNewVisualizationName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="My Energy Visualization"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowSaveForm(false)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={saveVisualization}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Energy Alerts */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Energy Alerts
          </h2>
          
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">{alert.name}</h3>
                    <p className="text-sm text-gray-500">
                      {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} {alert.condition} {alert.threshold} kWh
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => toggleAlertStatus(alert.id)}
                      className={`px-2 py-1 text-xs ${
                        alert.active 
                          ? "bg-green-100 text-green-700" 
                          : "bg-gray-100 text-gray-700"
                      } rounded`}
                    >
                      {alert.active ? "Active" : "Inactive"}
                    </button>
                    <button 
                      onClick={() => deleteAlert(alert.id)}
                      className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No alerts set. Create one by clicking "Set Alert".</p>
          )}
          
          {/* New Alert Form */}
          {showAlertForm && (
            <div className="mt-4 p-4 border rounded-lg bg-yellow-50">
              <h3 className="text-lg font-medium text-yellow-800 mb-3">Set Energy Alert</h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="alert-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Alert Name
                  </label>
                  <input
                    type="text"
                    id="alert-name"
                    value={newAlertName}
                    onChange={(e) => setNewAlertName(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="High Consumption Warning"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Energy Type
                    </label>
                    <select
                      value={newAlertType}
                      onChange={(e) => setNewAlertType(e.target.value as "consumption" | "generation")}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="consumption">Consumption</option>
                      <option value="generation">Generation</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condition
                    </label>
                    <select
                      value={newAlertCondition}
                      onChange={(e) => setNewAlertCondition(e.target.value as "above" | "below")}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="above">Above</option>
                      <option value="below">Below</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="threshold" className="block text-sm font-medium text-gray-700 mb-1">
                    Threshold (kWh)
                  </label>
                  <input
                    type="number"
                    id="threshold"
                    value={newAlertThreshold}
                    onChange={(e) => setNewAlertThreshold(Number(e.target.value))}
                    className="w-full p-2 border rounded-md"
                    min="0"
                    step="10"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setShowAlertForm(false)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAlert}
                  className="px-3 py-1.5 bg-yellow-600 text-white rounded-md text-sm"
                >
                  Create Alert
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnergyTrackingPage;