import React from "react";
import { EnergySourceType } from "../../types";
import Icon from "../icons/Icon";

// Source type display mapping
const sourceTypeMap: Record<
  string,
  { label: string; color: string; activeColor: string }
> = {
  solar: {
    label: "Solar",
    color: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    activeColor: "bg-yellow-600 text-white",
  },
  wind: {
    label: "Wind",
    color: "bg-sky-100 text-sky-800 border border-sky-300",
    activeColor: "bg-sky-600 text-white",
  },
  hydro: {
    label: "Hydro",
    color: "bg-blue-100 text-blue-800 border border-blue-300",
    activeColor: "bg-blue-600 text-white",
  },
  geothermal: {
    label: "Geothermal",
    color: "bg-purple-100 text-purple-800 border border-purple-300",
    activeColor: "bg-purple-600 text-white",
  },
  biomass: {
    label: "Biomass",
    color: "bg-green-100 text-green-800 border border-green-300",
    activeColor: "bg-green-600 text-white",
  },
  grid: {
    label: "Grid",
    color: "bg-gray-100 text-gray-800 border border-gray-300",
    activeColor: "bg-gray-600 text-white",
  },
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
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="mr-2 text-sm text-gray-600">Filter by source:</div>
      {Object.entries(sourceTypeMap).map(
        ([source, { label, color, activeColor }]) => (
          <button
            key={source}
            onClick={() => toggleSourceFilter(source as EnergySourceType)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              sourceFilters.includes(source as EnergySourceType)
                ? activeColor
                : color
            }`}
          >
            {label}
          </button>
        )
      )}
      {sourceFilters.length > 0 && (
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
