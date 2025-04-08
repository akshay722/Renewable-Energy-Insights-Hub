import React from "react";
import { EnergySummary, EnergySourceType } from "../types";

interface EnvironmentalImpactCardProps {
  summary: EnergySummary | null;
  generationBySource?: Record<string, number>;
  isLoading?: boolean;
  className?: string;
}

const EnvironmentalImpactCard: React.FC<EnvironmentalImpactCardProps> = ({
  summary,
  generationBySource = {},
  isLoading = false,
  className = "",
}) => {
  if (isLoading) {
    return (
      <div className={`card animate-pulse ${className}`}>
        <div
          className="h-4 rounded w-1/2 mb-4"
          style={{ backgroundColor: "var(--color-card-border)" }}
        ></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="h-24 rounded"
            style={{ backgroundColor: "var(--color-card-border)" }}
          ></div>
          <div
            className="h-24 rounded"
            style={{ backgroundColor: "var(--color-card-border)" }}
          ></div>
          <div
            className="h-24 rounded"
            style={{ backgroundColor: "var(--color-card-border)" }}
          ></div>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  // Calculate renewable energy generation (excluding grid)
  const renewableGeneration = Object.entries(generationBySource)
    .filter(([source]) => source !== EnergySourceType.GRID)
    .reduce((sum, [_, value]) => sum + value, 0);

  // Conversion constants
  const CO2_PER_KWH_GRID = 0.42; // kg CO₂ per kWh from grid (example average)
  const TREES_PER_TON_CO2 = 45; // Trees needed to absorb 1 ton CO₂ per year
  const costPerKWh = 0.12; // Electricity cost per kWh in dollars

  // Calculate environmental metrics
  const co2Saved = renewableGeneration * CO2_PER_KWH_GRID; // in kg
  const treesEquivalent = Math.round((co2Saved / 1000) * TREES_PER_TON_CO2); // converting kg to tons for tree calculation
  const electricitySavings = renewableGeneration * costPerKWh; // in dollars

  // Utility to format large numbers
  const formatValue = (value: number): string => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  // Define metrics with their icons
  const metricsData = [
    {
      title: "CO₂ Saved",
      value: `${co2Saved.toFixed(1)} kg`,
      description: "Emissions prevented by using renewable energy",
      icon: "🌿",
      accentColor: "var(--color-primary)",
    },
    {
      title: "Tree Equivalent",
      value: `${formatValue(treesEquivalent)} trees`,
      description: "Trees needed to absorb annual CO₂ emissions",
      icon: "🌳",
      accentColor: "var(--color-primary-dark)",
    },
    {
      title: "Electricity Savings",
      value: `$${electricitySavings.toFixed(2)}`,
      description: "Annual savings on electricity bills",
      icon: "💰",
      accentColor: "var(--color-secondary)",
    },
  ];

  return (
    <div className={`card ${className}`}>
      <h2
        className="text-xl font-semibold mb-4"
        style={{ color: "var(--color-text)" }}
      >
        Environmental Impact
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricsData.map((metric, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: "var(--color-background-dark)",
              borderColor: "var(--color-card-border)",
            }}
          >
            <div className="flex items-center justify-between">
              <h3
                className="text-base font-medium"
                style={{ color: "var(--color-text)" }}
              >
                {metric.title}
              </h3>
              <span className="text-2xl" style={{ opacity: 0.7 }}>
                {metric.icon}
              </span>
            </div>
            <p
              className="mt-2 text-2xl font-bold"
              style={{ color: metric.accentColor }}
            >
              {metric.value}
            </p>
            <p className="text-sm" style={{ color: "var(--color-text-light)" }}>
              {metric.description}
            </p>
          </div>
        ))}
      </div>

      <div
        className="mt-4 pt-3 text-xs"
        style={{
          borderTop: "1px solid var(--color-card-border)",
          color: "var(--color-text-light)",
          fontStyle: "italic",
        }}
      >
        Impact metrics calculated using standard environmental conversion
        factors. Actual values may vary.
      </div>
    </div>
  );
};

export default EnvironmentalImpactCard;
