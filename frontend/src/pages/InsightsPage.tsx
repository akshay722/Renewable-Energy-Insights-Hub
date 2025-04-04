import { useState, useEffect } from "react";
// import { format, subDays } from "date-fns";
import { insightsApi } from "../services/api";
import { InsightRecommendation, EnergyTrends } from "../types";

// import DateRangePicker from '../components/DateRangePicker'
import RecommendationCard from "../components/RecommendationCard";
import { Line, Bar } from "react-chartjs-2";
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
  ChartOptions,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const InsightsPage = () => {
  // Set default date range to last 90 days
  // const today = new Date();
  // const ninetyDaysAgo = subDays(today, 90);
  // const [startDate, setStartDate] = useState(
  //   format(ninetyDaysAgo, "yyyy-MM-dd")
  // );
  // const [endDate, setEndDate] = useState(format(today, "yyyy-MM-dd"));

  // State for API data
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<
    InsightRecommendation[]
  >([]);
  const [trends, setTrends] = useState<EnergyTrends | null>(null);
  const [months, setMonths] = useState(3); // Default to 3 months of trend data

  // Handle date range changes
  // const handleDateChange = (newStartDate: string, newEndDate: string) => {
  //   setStartDate(newStartDate);
  //   setEndDate(newEndDate);
  // };

  // Change trend timeframe
  const handleTrendTimeframeChange = (newMonths: number) => {
    setMonths(newMonths);
  };

  // Load insights data from API
  const loadInsightsData = async () => {
    setIsLoading(true);

    try {
      // Fetch data
      const [recommendationsData, trendsData] = await Promise.all([
        insightsApi.getRecommendations(),
        insightsApi.getTrends(months),
      ]);

      setRecommendations(recommendationsData || []);
      setTrends(trendsData || null);
    } catch (error) {
      console.error("Error loading insights data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare monthly trends chart data
  const getMonthlyTrendsChartData = () => {
    if (
      !trends ||
      !trends.monthly_trends ||
      trends.monthly_trends.length === 0
    ) {
      return {
        labels: [],
        datasets: [],
      };
    }

    return {
      labels: trends.monthly_trends.map((item) => item.month),
      datasets: [
        {
          label: "Generation (kWh)",
          data: trends.monthly_trends.map((item) => item.generation),
          borderColor: "rgb(34, 197, 94)", // Green
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          borderWidth: 2,
          tension: 0.3,
        },
        {
          label: "Consumption (kWh)",
          data: trends.monthly_trends.map((item) => item.consumption),
          borderColor: "rgb(239, 68, 68)", // Red
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          borderWidth: 2,
          tension: 0.3,
        },
        {
          label: "Net Usage (kWh)",
          data: trends.monthly_trends.map((item) => item.net_usage),
          borderColor: "rgb(59, 130, 246)", // Blue
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderWidth: 2,
          tension: 0.3,
        },
      ],
    };
  };

  // Prepare source distribution chart data
  const getSourceDistributionChartData = (
    type: "consumption" | "generation"
  ) => {
    if (!trends) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const data =
      type === "consumption"
        ? trends.consumption_by_source
        : trends.generation_by_source;

    const sourceColors: Record<string, { bg: string; border: string }> = {
      solar: {
        bg: "rgba(250, 204, 21, 0.7)", // Yellow
        border: "rgb(250, 204, 21)",
      },
      wind: {
        bg: "rgba(56, 189, 248, 0.7)", // Sky
        border: "rgb(56, 189, 248)",
      },
      hydro: {
        bg: "rgba(59, 130, 246, 0.7)", // Blue
        border: "rgb(59, 130, 246)",
      },
      geothermal: {
        bg: "rgba(217, 70, 239, 0.7)", // Purple
        border: "rgb(217, 70, 239)",
      },
      biomass: {
        bg: "rgba(132, 204, 22, 0.7)", // Lime
        border: "rgb(132, 204, 22)",
      },
      grid: {
        bg: "rgba(100, 116, 139, 0.7)", // Slate
        border: "rgb(100, 116, 139)",
      },
    };

    // Format source names
    const formatSourceName = (source: string) => {
      return source.charAt(0).toUpperCase() + source.slice(1);
    };

    return {
      labels: Object.keys(data).map(formatSourceName),
      datasets: [
        {
          data: Object.values(data),
          backgroundColor: Object.keys(data).map(
            (source) => sourceColors[source]?.bg || "rgba(156, 163, 175, 0.7)"
          ),
          borderColor: Object.keys(data).map(
            (source) => sourceColors[source]?.border || "rgb(156, 163, 175)"
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  // Chart options
  const lineChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Energy (kWh)",
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  const barChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            return `${value.toFixed(1)} kWh`;
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
      },
    },
  };

  // Initial data loading and reload when months change
  useEffect(() => {
    loadInsightsData();
  }, [months]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
          Energy Insights
        </h1>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleTrendTimeframeChange(3)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              months === 3
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            3 Months
          </button>
          <button
            onClick={() => handleTrendTimeframeChange(6)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              months === 6
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            6 Months
          </button>
          <button
            onClick={() => handleTrendTimeframeChange(12)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              months === 12
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            12 Months
          </button>
        </div>
      </div>

      {/* Monthly Energy Trends Chart */}
      <div className="card h-96">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Monthly Energy Trends
        </h2>
        {isLoading ? (
          <div className="animate-pulse h-80 bg-gray-200 rounded"></div>
        ) : trends &&
          trends.monthly_trends &&
          trends.monthly_trends.length > 0 ? (
          <div className="h-80">
            <Line
              data={getMonthlyTrendsChartData()}
              options={lineChartOptions}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-80 text-gray-400">
            No trend data available
          </div>
        )}
      </div>

      {/* Energy by Source Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Consumption by Source */}
        <div className="card h-80">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Consumption by Source
          </h2>
          {isLoading ? (
            <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
          ) : trends && Object.keys(trends.consumption_by_source).length > 0 ? (
            <div className="h-64">
              <Bar
                data={getSourceDistributionChartData("consumption")}
                options={barChartOptions}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              No consumption source data available
            </div>
          )}
        </div>

        {/* Generation by Source */}
        <div className="card h-80">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Generation by Source
          </h2>
          {isLoading ? (
            <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
          ) : trends && Object.keys(trends.generation_by_source).length > 0 ? (
            <div className="h-64">
              <Bar
                data={getSourceDistributionChartData("generation")}
                options={barChartOptions}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              No generation source data available
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Energy Recommendations
        </h2>
        {isLoading ? (
          <div className="space-y-4">
            <div className="animate-pulse h-20 bg-gray-200 rounded"></div>
            <div className="animate-pulse h-20 bg-gray-200 rounded"></div>
            <div className="animate-pulse h-20 bg-gray-200 rounded"></div>
          </div>
        ) : recommendations && recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <RecommendationCard key={index} recommendation={recommendation} />
            ))}
          </div>
        ) : (
          <div className="text-gray-500">
            No personalized recommendations available at this time.
          </div>
        )}
      </div>

      {/* Advanced Insights Overview */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Energy Insights Overview
        </h2>

        <div className="prose max-w-none text-gray-700">
          <p>
            Our advanced analytics provides key insights into your energy usage
            patterns and trends. Based on your historical data, we can help you
            identify opportunities for optimizing your energy consumption and
            maximizing renewable energy utilization.
          </p>

          <h3 className="text-lg font-medium text-gray-800 mt-4">
            Key Observations
          </h3>

          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Consumption Patterns:</strong> Monitor your daily and
              seasonal energy usage fluctuations.
            </li>
            <li>
              <strong>Generation Efficiency:</strong> Track the performance of
              your renewable energy sources.
            </li>
            <li>
              <strong>Source Distribution:</strong> Analyze the mix of energy
              sources you're using.
            </li>
            <li>
              <strong>Net Energy Balance:</strong> Understand your overall
              energy position (surplus or deficit).
            </li>
          </ul>

          <h3 className="text-lg font-medium text-gray-800 mt-4">
            Take Action
          </h3>

          <p>
            Review our recommendations to make informed decisions about your
            energy usage. Consider implementing suggested changes to improve
            efficiency and increase the percentage of renewable energy in your
            overall consumption.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;
