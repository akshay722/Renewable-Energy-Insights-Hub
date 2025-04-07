import React from "react";
import { EnergySourceType } from "../../types";
import SourceFilters from "./SourceFilters";

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
  // Source filter props
  sourceFilters,
  toggleSourceFilter,
  resetFilters,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          {/* Chart Type Toggle */}
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => setChartView("graph")}
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                chartView === "graph"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Graph
            </button>
            <button
              onClick={() => setChartView("pie")}
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                chartView === "pie"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Pie Chart
            </button>
          </div>
        </div>
        {/* Source Filters Section */}
        <div className="mt-3">
          <SourceFilters
            sourceFilters={sourceFilters}
            toggleSourceFilter={toggleSourceFilter}
            resetFilters={resetFilters}
          />
        </div>

        <div className="flex items-center space-x-3">
          {/* Time Resolution for Graph View */}
          {chartView === "graph" && (
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                onClick={() => handleResolutionChange("hourly")}
                className={`px-3 py-1.5 text-xs font-medium rounded-l-md ${
                  chartResolution === "hourly"
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Hourly
              </button>
              <button
                onClick={() => handleResolutionChange("daily")}
                className={`px-3 py-1.5 text-xs font-medium ${
                  chartResolution === "daily"
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => handleResolutionChange("weekly")}
                className={`px-3 py-1.5 text-xs font-medium rounded-r-md ${
                  chartResolution === "weekly"
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
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
