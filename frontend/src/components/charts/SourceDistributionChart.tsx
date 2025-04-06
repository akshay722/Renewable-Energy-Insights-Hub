import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";
import { Pie, Doughnut } from "react-chartjs-2";
import { useMemo } from "react";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface SourceDistributionChartProps {
  data: Record<string, number>;
  title?: string;
  chartType?: "pie" | "doughnut";
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
  chartType = "doughnut",
  height = 300,
  showGreenVsNonGreen = false,
  resolutionControls,
}: SourceDistributionChartProps) => {
  // Format source names for display
  const formatSourceName = (name: string): string => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Prepare chart data
  const chartData = useMemo<ChartData<"pie" | "doughnut">>(() => {
    // If showing green vs non-green, transform the data
    if (showGreenVsNonGreen) {
      const nonGreenSources = ["grid"];

      // Calculate totals
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

    // Normal source distribution chart
    const labels = Object.keys(data).map(formatSourceName);
    const values = Object.values(data);

    // Get colors for each source
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

  return (
    <div style={{ height }}>
      <div className="mb-2 flex justify-between items-center">
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        {resolutionControls}
      </div>
      {chartType === "pie" ? (
        <Pie
          data={chartData as ChartData<"pie">}
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
      ) : (
        <Doughnut
          data={chartData as ChartData<"doughnut">}
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
      )}
    </div>
  );
};

export default SourceDistributionChart;
