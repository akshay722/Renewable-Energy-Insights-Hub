import React from "react";
import { EnergySourceType } from "../../types";
import Icon from "../icons/Icon";

// Simplified mapping only for labels
const sourceTypeMap: Record<string, { label: string }> = {
  solar: { label: "Solar" },
  wind: { label: "Wind" },
  hydro: { label: "Hydro" },
  geothermal: { label: "Geothermal" },
  biomass: { label: "Biomass" },
  grid: { label: "Grid" },
};

interface SourceFiltersProps {
  sourceFilters: EnergySourceType[];
  toggleSourceFilter: (source: EnergySourceType) => void;
  resetFilters: () => void;
}

const SourceFilters: React.FC<SourceFiltersProps> = ({
  sourceFilters,
  toggleSourceFilter,
  resetFilters,
}) => {
  const activeClass = "bg-blue-600 text-white";
  const inactiveClass = "bg-blue-100 text-blue-800 border border-blue-300";

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div
        className="mr-2 text-sm  "
        style={{ color: "var(--color-text-light)" }}
      >
        Filter by source:
      </div>
      {Object.entries(sourceTypeMap).map(([source, { label }]) => (
        <button
          key={source}
          onClick={() => toggleSourceFilter(source as EnergySourceType)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            sourceFilters.includes(source as EnergySourceType)
              ? activeClass
              : inactiveClass
          }`}
        >
          {label}
        </button>
      ))}
      {sourceFilters.length !== 6 && (
        <button
          onClick={resetFilters}
          className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300 hover:bg-red-200 transition-colors ml-2 flex items-center"
        >
          <Icon name="close" size="sm" className="mr-1" />
          Reset
        </button>
      )}
    </div>
  );
};

export default SourceFilters;
