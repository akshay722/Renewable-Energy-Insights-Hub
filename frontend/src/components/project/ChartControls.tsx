import React from "react";
import { EnergySourceType } from "../../types";
import SourceFilters from "./SourceFilters";
import { useTheme } from "../../context/ThemeContext";

type ChartView = "graph" | "pie";
type ChartResolution = "hourly" | "daily" | "weekly";

interface ChartControlsProps {
  chartView: ChartView;
  setChartView: (view: ChartView) => void;
  chartResolution: ChartResolution;
  handleResolutionChange: (resolution: ChartResolution) => void;
  sourceFilters: EnergySourceType[];
  toggleSourceFilter: (source: EnergySourceType) => void;
  resetFilters: () => void;
}

const ChartControls: React.FC<ChartControlsProps> = ({
  chartView,
  setChartView,
  chartResolution,
  handleResolutionChange,
  sourceFilters,
  toggleSourceFilter,
  resetFilters,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Theme-aware styles for inactive buttons
  const inactiveButtonStyle = {
    backgroundColor: isDark
      ? "var(--color-background-dark)"
      : "var(--color-card-bg)",
    color: "var(--color-text)",
    borderColor: "var(--color-card-border)",
    borderWidth: "1px",
    borderStyle: "solid",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          {/* Chart Type Toggle */}
          <div className="inline-flex rounded-md align-center" role="group">
            <button
              onClick={() => setChartView("graph")}
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                chartView === "graph" ? "bg-primary text-white" : ""
              }`}
              style={chartView !== "graph" ? inactiveButtonStyle : {}}
            >
              Graph
            </button>
            <button
              onClick={() => setChartView("pie")}
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                chartView === "pie" ? "bg-primary text-white" : ""
              }`}
              style={chartView !== "pie" ? inactiveButtonStyle : {}}
            >
              Pie Chart
            </button>
            {/* Source Filters Section */}
            <div className="flex ml-3">
              <SourceFilters
                sourceFilters={sourceFilters}
                toggleSourceFilter={toggleSourceFilter}
                resetFilters={resetFilters}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Time Resolution for Graph View */}
          {chartView === "graph" && (
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                onClick={() => handleResolutionChange("hourly")}
                className={`px-3 py-1.5 text-xs font-medium rounded-l-md ${
                  chartResolution === "hourly" ? "bg-primary text-white" : ""
                }`}
                style={chartResolution !== "hourly" ? inactiveButtonStyle : {}}
              >
                Hourly
              </button>
              <button
                onClick={() => handleResolutionChange("daily")}
                className={`px-3 py-1.5 text-xs font-medium ${
                  chartResolution === "daily" ? "bg-primary text-white" : ""
                }`}
                style={chartResolution !== "daily" ? inactiveButtonStyle : {}}
              >
                Daily
              </button>
              <button
                onClick={() => handleResolutionChange("weekly")}
                className={`px-3 py-1.5 text-xs font-medium rounded-r-md ${
                  chartResolution === "weekly" ? "bg-primary text-white" : ""
                }`}
                style={chartResolution !== "weekly" ? inactiveButtonStyle : {}}
              >
                Weekly
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartControls;
