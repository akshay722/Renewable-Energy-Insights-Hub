import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  TimeScale,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import {
  DailyAggregateData,
  EnergyConsumption,
  EnergyGeneration,
  WeeklyAggregateData,
} from "../../types";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import "chartjs-adapter-date-fns";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// Need to register this to make mixed charts work properly
// @ts-ignore - the type definitions don't include this despite it being valid
ChartJS.defaults.set("plugins.datalabels", {
  display: false,
});

interface EnergyChartProps {
  consumptionData?:
    | DailyAggregateData[]
    | EnergyConsumption[]
    | WeeklyAggregateData[];
  generationData?:
    | DailyAggregateData[]
    | EnergyGeneration[]
    | WeeklyAggregateData[];
  chartType?: "line" | "bar" | "mixed" | "consumption-generation";
  title?: string;
  height?: number;
  timeFrame?: "hourly" | "daily" | "weekly" | "monthly";
  resolutionControls?: React.ReactNode;
}

const EnergyChart = ({
  consumptionData = [],
  generationData = [],
  chartType = "line",
  title = "Energy Consumption vs Generation",
  height = 300,
  timeFrame = "hourly",
  resolutionControls,
}: EnergyChartProps) => {
  // Format dates based on timeframe
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);

      switch (timeFrame) {
        case "hourly":
          return format(date, "MMM dd HH:mm");
        case "daily":
          return format(date, "MMM dd");
        case "weekly":
          return format(date, "EEE, MMM dd");
        case "monthly":
          return format(date, "MMM yyyy");
        default:
          return format(date, "MMM dd HH:mm");
      }
    } catch (error) {
      console.error("Date parsing error:", error, dateString);
      return dateString;
    }
  };

  // Format hour for nicer display in hourly view
  const formatHour = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      const hour = date.getHours();

      // 12-hour format with AM/PM
      if (hour === 0) return "12 AM";
      if (hour === 12) return "12 PM";
      return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
    } catch (error) {
      return dateString;
    }
  };

  // Get date or timestamp field based on data type
  const getDateField = (item: any): string => {
    if (item.timestamp) return item.timestamp;
    if (item.date) return item.date;
    if (item.week_start) return item.week_start; // Added to support weekly aggregated data
    return "";
  };

  const getValueField = (item: any): number => {
    const value = item.value_kwh || 0;
    return typeof value === "number" ? value : parseFloat(value) || 0;
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    // Get all unique dates from both datasets\
    const allDates = new Set<string>(
      [
        ...consumptionData.map((item) => getDateField(item)),
        ...generationData.map((item) => getDateField(item)),
      ].sort()
    );

    // For hourly timeframe, format data differently
    let labels = Array.from(allDates);

    if (timeFrame === "hourly") {
      // Sort chronologically for hourly data
      labels = labels.sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );

      // Use short hour format for hourly labels
      labels = labels.map(formatHour);
    } else {
      labels = labels.map(formatDate);
    }

    const datasets = [];

    // For consumption-generation chart, always use bars for consumption and line for generation
    if (chartType === "consumption-generation") {
      if (consumptionData.length > 0) {
        const consumptionMap = new Map(
          consumptionData.map((item) => [
            getDateField(item),
            getValueField(item),
          ])
        );

        const orderedDates = Array.from(allDates).sort(
          (a, b) => new Date(a).getTime() - new Date(b).getTime()
        );

        datasets.push({
          type: "bar",
          label: "Consumption (kWh)",
          data: orderedDates.map((date) => consumptionMap.get(date) || 0),
          backgroundColor: "rgba(239, 68, 68, 0.5)",
          borderColor: "rgb(239, 68, 68)",
          borderWidth: 1,
          order: 2, // Higher order renders below
          yAxisID: "y",
        });
      }

      if (generationData.length > 0) {
        const generationMap = new Map(
          generationData.map((item) => [
            getDateField(item),
            getValueField(item),
          ])
        );

        const orderedDates = Array.from(allDates).sort(
          (a, b) => new Date(a).getTime() - new Date(b).getTime()
        );

        datasets.push({
          type: "line",
          label: "Generation (kWh)",
          data: orderedDates.map((date) => generationMap.get(date) || 0),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          borderWidth: 2,
          tension: 0.4, // Make it more of a smooth spline
          pointRadius: 2,
          pointHoverRadius: 5,
          fill: false,
          order: 1, // Lower order renders on top
          yAxisID: "y",
        });
      }
    } else {
      // Standard chart types
      if (consumptionData.length > 0) {
        const consumptionMap = new Map(
          consumptionData.map((item) => [
            getDateField(item),
            getValueField(item),
          ])
        );

        datasets.push({
          label: "Consumption (kWh)",
          data: Array.from(allDates).map(
            (date) => consumptionMap.get(date) || 0
          ),
          borderColor: "rgb(239, 68, 68)", // Red
          backgroundColor: "rgba(239, 68, 68, 0.2)",
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 5,
          fill: chartType === "line" ? false : undefined,
          type: chartType === "mixed" ? "bar" : undefined,
          borderDash: chartType === "line" ? [] : undefined,
        });
      }

      if (generationData.length > 0) {
        const generationMap = new Map(
          generationData.map((item) => [
            getDateField(item),
            getValueField(item),
          ])
        );

        datasets.push({
          label: "Generation (kWh)",
          data: Array.from(allDates).map(
            (date) => generationMap.get(date) || 0
          ),
          borderColor: "rgb(34, 197, 94)", // Green
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 5,
          fill: chartType === "line" ? false : undefined,
          type: chartType === "mixed" ? "line" : undefined,
        });
      }
    }

    return {
      labels,
      datasets,
    };
  }, [consumptionData, generationData, chartType, timeFrame]);

  // Chart options
  const options: ChartOptions<"line" | "bar"> = {
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
        mode: "index",
        intersect: false,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || "";
            const value =
              typeof context.raw === "number" ? context.raw.toFixed(2) : "0.00";
            return `${label}: ${value} kWh`;
          },
          title: (items: any) => {
            if (timeFrame === "hourly" && items.length > 0) {
              // Try to find the original date from the datasets
              const itemIndex = items[0].dataIndex;
              if (itemIndex !== undefined) {
                const dataset = items[0].dataset;
                if (dataset) {
                  const allDatesArray = [
                    ...consumptionData.map((item) => getDateField(item)),
                    ...generationData.map((item) => getDateField(item)),
                  ].sort(
                    (a, b) => new Date(a).getTime() - new Date(b).getTime()
                  );

                  if (allDatesArray[itemIndex]) {
                    const date = parseISO(allDatesArray[itemIndex]);
                    return format(date, "MMM dd, yyyy HH:mm");
                  }
                }
              }
            }
            // Fallback to default formatting
            return items[0].label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Energy (kWh)",
        },
        grid: {
          color: "rgba(200, 200, 200, 0.2)",
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: timeFrame === "hourly" ? 12 : 20, // Show fewer labels for hourly data
          font: {
            size: 10, // Smaller font for better fit
          },
        },
        grid: {
          display: false, // Hide vertical grid lines to reduce clutter
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  // Default chart rendering based on chart type
  return (
    <div style={{ height }}>
      <div className="mb-2 flex justify-between items-center text-gray-700">
        {title && (
          <h3
            className="text-lg font-semibold"
            style={{ color: "var(--color-text-light)" }}
          >
            {title}
          </h3>
        )}
        {resolutionControls}
      </div>
      {chartType === "line" ? (
        <Line
          data={chartData as ChartData<"line">}
          options={{
            ...options,
            plugins: {
              ...options.plugins,
              title: {
                ...options.plugins?.title,
                display: false,
              },
            },
          }}
        />
      ) : chartType === "bar" ? (
        <Bar
          data={chartData as ChartData<"bar">}
          options={{
            ...options,
            plugins: {
              ...options.plugins,
              title: {
                ...options.plugins?.title,
                display: false,
              },
            },
          }}
        />
      ) : (
        // Mixed chart type (consumption as bars, generation as line)
        <Bar
          data={chartData as ChartData<"bar">}
          options={{
            ...options,
            plugins: {
              ...options.plugins,
              title: {
                ...options.plugins?.title,
                display: false,
              },
            },
          }}
        />
      )}
    </div>
  );
};

export default EnergyChart;
