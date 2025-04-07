import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { EnergySourceType } from "../../types";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ConsumptionGenerationBarChartProps {
  consumptionBySource: Record<string, number>;
  generationBySource: Record<string, number>;
  height?: number;
  title?: string;
}

const ConsumptionGenerationBarChart: React.FC<
  ConsumptionGenerationBarChartProps
> = ({
  consumptionBySource,
  generationBySource,
  height = 300,
  title = "Energy Production & Consumption",
}) => {
  // Calculate renewable and non-renewable consumption
  const { renewableConsumption, gridConsumption, totalGeneration } =
    useMemo(() => {
      let renewableConsumption = 0;
      let gridConsumption = 0;
      let totalGeneration = 0;

      // Calculate consumption by source type
      Object.entries(consumptionBySource).forEach(([source, value]) => {
        if (source === EnergySourceType.GRID) {
          gridConsumption += value;
        } else {
          renewableConsumption += value;
        }
      });

      // Calculate total generation
      Object.values(generationBySource).forEach((value) => {
        totalGeneration += value;
      });

      return { renewableConsumption, gridConsumption, totalGeneration };
    }, [consumptionBySource, generationBySource]);

  // Prepare chart data
  const chartData: ChartData<"bar"> = {
    labels: ["Energy Overview"],
    datasets: [
      {
        label: "Grid Consumption",
        data: [gridConsumption],
        backgroundColor: "rgba(100, 116, 139, 0.7)", // Slate color for grid
        borderColor: "rgb(71, 85, 105)",
        borderWidth: 1,
        stack: "consumption",
      },
      {
        label: "Renewable Consumption",
        data: [renewableConsumption],
        backgroundColor: "rgba(59, 130, 246, 0.7)", // Blue for renewable consumption
        borderColor: "rgb(37, 99, 235)",
        borderWidth: 1,
        stack: "consumption",
      },
      {
        label: "Generation",
        data: [totalGeneration],
        backgroundColor: "rgba(34, 197, 94, 0.7)", // Green for generation
        borderColor: "rgb(22, 163, 74)",
        borderWidth: 1,
        stack: "generation",
      },
    ],
  };

  // Chart options
  const options: ChartOptions<"bar"> = {
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
          label: (context) => {
            const label = context.dataset.label || "";
            const value = context.raw as number;
            return `${label}: ${value.toFixed(1)} kWh`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: false,
        beginAtZero: true,
        title: {
          display: true,
          text: "Energy (kWh)",
        },
      },
    },
  };

  return (
    <div style={{ height }}>
      <div className="mb-2 flex justify-between items-center">
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
      </div>

      <Bar data={chartData} options={options} />

      {/* Legend explanation */}
      <div className="mt-4 text-sm text-gray-600">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 opacity-70 rounded mr-2"></div>
            <span>
              Renewable Consumption: {renewableConsumption.toFixed(1)} kWh
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-slate-500 opacity-70 rounded mr-2"></div>
            <span>Grid Consumption: {gridConsumption.toFixed(1)} kWh</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 opacity-70 rounded mr-2"></div>
            <span>Total Generation: {totalGeneration.toFixed(1)} kWh</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumptionGenerationBarChart;
