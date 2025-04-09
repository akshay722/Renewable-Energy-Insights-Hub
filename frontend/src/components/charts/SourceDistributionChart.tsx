import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useMemo } from "react";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface SourceDistributionChartProps {
  data: Record<string, number>;
  title?: string;
  height?: number;
  showGreenVsNonGreen?: boolean;
  resolutionControls?: React.ReactNode;
}

// Energy source color mapping
const sourceColors: Record<string, { border: string; background: string }> = {
  solar: {
    border: "rgb(250, 204, 21)",
    background: "rgba(250, 204, 21, 0.7)",
  },
  wind: {
    border: "rgb(56, 189, 248)",
    background: "rgba(56, 189, 248, 0.7)",
  },
  hydro: {
    border: "rgb(59, 130, 246)",
    background: "rgba(59, 130, 246, 0.7)",
  },
  geothermal: {
    border: "rgb(217, 70, 239)",
    background: "rgba(217, 70, 239, 0.7)",
  },
  biomass: {
    border: "rgb(132, 204, 22)",
    background: "rgba(132, 204, 22, 0.7)",
  },
  grid: {
    border: "rgb(100, 116, 139)",
    background: "rgba(100, 116, 139, 0.7)",
  },
};

// Green vs Non-Green colors
const greenVsNonGreenColors = {
  green: {
    border: "rgb(22, 163, 74)",
    background: "rgba(22, 163, 74, 0.7)",
  },
  nonGreen: {
    border: "rgb(100, 116, 139)",
    background: "rgba(100, 116, 139, 0.7)",
  },
};

// Default colors for unknown sources
const defaultColors = [
  { border: "rgb(255, 99, 132)", background: "rgba(255, 99, 132, 0.7)" },
  { border: "rgb(54, 162, 235)", background: "rgba(54, 162, 235, 0.7)" },
  { border: "rgb(255, 206, 86)", background: "rgba(255, 206, 86, 0.7)" },
  { border: "rgb(75, 192, 192)", background: "rgba(75, 192, 192, 0.7)" },
  { border: "rgb(153, 102, 255)", background: "rgba(153, 102, 255, 0.7)" },
];

const SourceDistributionChart = ({
  data,
  title = "Energy Source Distribution",
  height = 300,
  showGreenVsNonGreen = false,
  resolutionControls,
}: SourceDistributionChartProps) => {
  const formatSourceName = (name: string): string => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Prepare chart data
  const chartData = useMemo<ChartData<"doughnut">>(() => {
    if (showGreenVsNonGreen) {
      const nonGreenSources = ["grid"];

      let greenTotal = 0;
      let nonGreenTotal = 0;

      Object.entries(data).forEach(([source, value]) => {
        if (nonGreenSources.includes(source)) {
          nonGreenTotal += value;
        } else {
          greenTotal += value;
        }
      });

      return {
        labels: ["Renewable Energy", "Non-Renewable Energy"],
        datasets: [
          {
            data: [greenTotal, nonGreenTotal],
            backgroundColor: [
              greenVsNonGreenColors.green.background,
              greenVsNonGreenColors.nonGreen.background,
            ],
            borderColor: [
              greenVsNonGreenColors.green.border,
              greenVsNonGreenColors.nonGreen.border,
            ],
            borderWidth: 1,
          },
        ],
      };
    }

    const labels = Object.keys(data).map(formatSourceName);
    const values = Object.values(data);

    const backgroundColors = Object.keys(data).map(
      (source) =>
        sourceColors[source]?.background || defaultColors[0].background
    );

    const borderColors = Object.keys(data).map(
      (source) => sourceColors[source]?.border || defaultColors[0].border
    );

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    };
  }, [data, showGreenVsNonGreen]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%", // Makes the doughnut hole larger
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: !!title,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.chart.data.datasets[0].data.reduce(
              (acc: number, curr: number) => acc + curr,
              0
            );
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value.toFixed(1)} kWh (${percentage}%)`;
          },
        },
      },
    },
  };

  const isSingleSource = Object.keys(data).length === 1;
  const singleSourceName = isSingleSource ? Object.keys(data)[0] : null;
  const singleSourceValue = isSingleSource ? Object.values(data)[0] : null;

  return (
    <div style={{ height }} className="flex flex-col">
      <div className="mb-2 flex justify-between items-center">
        {title && (
          <h3
            className="text-lg font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            {title}
          </h3>
        )}
        {resolutionControls}
      </div>

      {/* Show message when there's only one source */}
      {isSingleSource ? (
        <div className="flex flex-col items-center justify-center h-full">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4"
            style={{
              backgroundColor:
                sourceColors[singleSourceName!]?.background ||
                defaultColors[0].background,
            }}
          >
            100%
          </div>
          <p
            className="text-lg font-medium"
            style={{ color: "var(--color-text-light)" }}
          >
            All energy comes from{" "}
            <span className="font-bold">
              {formatSourceName(singleSourceName!)}
            </span>
          </p>
          <p
            className="text-sm  mt-1"
            style={{ color: "var(--color-text-light)" }}
          >
            {singleSourceValue!.toFixed(1)} kWh
          </p>
        </div>
      ) : (
        <div className="relative" style={{ width: "100%", height: "100%" }}>
          <Doughnut
            data={chartData}
            options={{
              ...options,
              plugins: {
                ...options.plugins,
                title: {
                  ...options.plugins.title,
                  display: false,
                },
              },
            }}
          />
          <div
            className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center flex-col"
            style={{
              pointerEvents: "none",
              position: "absolute",
              left: "50%",
              top: "55%",
              transform: "translate(-50%, -50%)",
              width: "40%", // Control the size of the centered text area
              height: "40%",
            }}
          >
            <div
              className="text-2xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              {Object.values(data)
                .reduce((acc, val) => acc + val, 0)
                .toFixed(1)}
            </div>
            <div
              className="text-sm"
              style={{ color: "var(--color-text-light)" }}
            >
              kWh
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SourceDistributionChart;
