import { EnergySummary } from "../types";
import Icon from "./icons/Icon";

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
  // Helper to format numbers nicely
  const formatValue = (value: number): string => {
    return value.toFixed(1);
  };

  // Calculate surplus/deficit
  const netEnergy = summary.total_generation - summary.total_consumption;
  const isPositiveNet = netEnergy >= 0;

  if (isLoading) {
    return (
      <div className={`card animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${className}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Energy Summary
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Consumption Card */}
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-red-800">Consumption</h3>
            <Icon name="consumption" size="lg" className="text-red-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {formatValue(summary.total_consumption)} kWh
          </p>
          <p className="text-sm text-red-800">
            Total energy consumed during period
          </p>
        </div>

        {/* Generation Card */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-green-800">Generation</h3>
            <Icon name="generation" size="lg" className="text-green-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {formatValue(summary.total_generation)} kWh
          </p>
          <p className="text-sm text-green-800">
            Total energy generated during period
          </p>
        </div>

        {/* Net Energy Card */}
        <div
          className={`${
            isPositiveNet ? "bg-teal-50" : "bg-amber-50"
          } p-4 rounded-lg`}
        >
          <div className="flex items-center justify-between">
            <h3
              className={`text-base font-medium ${
                isPositiveNet ? "text-teal-800" : "text-amber-800"
              }`}
            >
              {isPositiveNet ? "Net Surplus" : "Net Deficit"}
            </h3>
            <Icon
              name={isPositiveNet ? "surplus" : "deficit"}
              size="lg"
              className={isPositiveNet ? "text-teal-400" : "text-amber-400"}
            />
          </div>
          <p
            className={`mt-2 text-2xl font-bold ${
              isPositiveNet ? "text-teal-600" : "text-amber-600"
            }`}
          >
            {formatValue(Math.abs(netEnergy))} kWh
          </p>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full bg-primary"
                style={{
                  width: `${Math.min(100, summary.renewable_percentage)}%`,
                }}
              ></div>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {summary.renewable_percentage.toFixed(1)}% from renewable sources
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergySummaryCard;
