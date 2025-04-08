import { EnergySummary } from "../types";
import Icon from "./icons/Icon";
import { useTheme } from "../context/ThemeContext";

interface EnergySummaryCardProps {
  summary: EnergySummary;
  isLoading?: boolean;
  className?: string;
}

const EnergySummaryCard = ({
  summary,
  isLoading = false,
  className = "",
}: EnergySummaryCardProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Helper to format numbers nicely
  const formatValue = (value: number): string => {
    return value.toFixed(1);
  };

  // Calculate surplus/deficit
  const netEnergy = summary.total_generation - summary.total_consumption;
  const isPositiveNet = netEnergy >= 0;

  // Theme-aware color variables
  const consumptionCardStyle = {
    backgroundColor: isDark
      ? "rgba(220, 38, 38, 0.1)"
      : "rgba(254, 226, 226, 0.7)",
    color: isDark ? "rgba(254, 202, 202, 0.9)" : "#991b1b",
  };

  const generationCardStyle = {
    backgroundColor: isDark
      ? "rgba(16, 185, 129, 0.1)"
      : "rgba(209, 250, 229, 0.7)",
    color: isDark ? "rgba(167, 243, 208, 0.9)" : "#065f46",
  };

  const netCardStyle = isPositiveNet
    ? {
        backgroundColor: isDark
          ? "rgba(20, 184, 166, 0.1)"
          : "rgba(204, 251, 241, 0.7)",
        color: isDark ? "rgba(153, 246, 228, 0.9)" : "#0f766e",
      }
    : {
        backgroundColor: isDark
          ? "rgba(245, 158, 11, 0.1)"
          : "rgba(254, 243, 199, 0.7)",
        color: isDark ? "rgba(252, 211, 77, 0.9)" : "#92400e",
      };

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

  return (
    <div className={`card ${className}`}>
      <h2
        className="text-xl font-semibold mb-4"
        style={{ color: "var(--color-text)" }}
      >
        Energy Summary
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Consumption Card */}
        <div className="p-4 rounded-lg" style={consumptionCardStyle}>
          <div className="flex items-center justify-between">
            <h3
              className="text-base font-medium"
              style={{ color: consumptionCardStyle.color }}
            >
              Consumption
            </h3>
            <Icon name="consumption" size="lg" />
          </div>
          <p
            className="mt-2 text-2xl font-bold"
            style={{ color: consumptionCardStyle.color }}
          >
            {formatValue(summary.total_consumption)} kWh
          </p>
          <p
            className="text-sm"
            style={{ color: consumptionCardStyle.color, opacity: 0.9 }}
          >
            Total energy consumed during period
          </p>
        </div>

        {/* Generation Card */}
        <div className="p-4 rounded-lg" style={generationCardStyle}>
          <div className="flex items-center justify-between">
            <h3
              className="text-base font-medium"
              style={{ color: generationCardStyle.color }}
            >
              Generation
            </h3>
            <Icon name="generation" size="lg" />
          </div>
          <p
            className="mt-2 text-2xl font-bold"
            style={{ color: generationCardStyle.color }}
          >
            {formatValue(summary.total_generation)} kWh
          </p>
          <p
            className="text-sm"
            style={{ color: generationCardStyle.color, opacity: 0.9 }}
          >
            Total energy generated during period
          </p>
        </div>

        {/* Net Energy Card */}
        <div className="p-4 rounded-lg" style={netCardStyle}>
          <div className="flex items-center justify-between">
            <h3
              className="text-base font-medium"
              style={{ color: netCardStyle.color }}
            >
              {isPositiveNet ? "Net Surplus" : "Net Deficit"}
            </h3>
            <Icon name={isPositiveNet ? "surplus" : "deficit"} size="lg" />
          </div>
          <p
            className="mt-2 text-2xl font-bold"
            style={{ color: netCardStyle.color }}
          >
            {formatValue(Math.abs(netEnergy))} kWh
          </p>
          <div className="mt-2">
            <div
              className="w-full rounded-full h-2.5"
              style={{ backgroundColor: "var(--color-background-dark)" }}
            >
              <div
                className="h-2.5 rounded-full bg-primary"
                style={{
                  width: `${Math.min(100, summary.renewable_percentage)}%`,
                }}
              ></div>
            </div>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--color-text-light)" }}
            >
              {summary.renewable_percentage.toFixed(1)}% from renewable sources
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergySummaryCard;
