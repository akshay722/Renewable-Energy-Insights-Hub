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
  // Create a pattern for the deficit area
  const createPattern = (): string => {
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 10;
    patternCanvas.height = 10;
    const pctx = patternCanvas.getContext('2d');
    
    if (pctx) {
      // Fill with transparent yellow
      pctx.fillStyle = 'rgba(255, 234, 0, 0.2)';
      pctx.fillRect(0, 0, 10, 10);
      
      // Add diagonal lines for the dotted effect
      pctx.strokeStyle = 'rgba(234, 179, 8, 0.8)';
      pctx.lineWidth = 1;
      pctx.beginPath();
      pctx.moveTo(0, 0);
      pctx.lineTo(10, 10);
      pctx.moveTo(5, 0);
      pctx.lineTo(10, 5);
      pctx.moveTo(0, 5);
      pctx.lineTo(5, 10);
      pctx.stroke();
    }
    
    return patternCanvas.toDataURL();
  };
  
  // Create the pattern once on component render
  const patternImage = React.useMemo(() => {
    if (typeof document !== 'undefined') {
      return createPattern();
    }
    return '';
  }, []);
  // Calculate renewable and non-renewable consumption
  const { renewableConsumption, gridConsumption, totalGeneration, deficit, hasSurplus } =
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

      // Calculate deficit or surplus
      const totalConsumption = renewableConsumption + gridConsumption;
      const deficit = Math.max(0, totalConsumption - totalGeneration);
      const hasSurplus = totalGeneration > totalConsumption;

      return { renewableConsumption, gridConsumption, totalGeneration, deficit, hasSurplus };
    }, [consumptionBySource, generationBySource]);

  // Calculate totals for consumption and generation
  const totalConsumption = gridConsumption + renewableConsumption;
  
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
      // Show deficit as an extension to the generation bar with pattern
      ...(deficit > 0 ? [{
        label: "Energy Deficit",
        data: [deficit],
        // Use the pattern image for the background
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          if (patternImage) {
            const pattern = ctx.createPattern(
              (() => {
                const img = new Image();
                img.src = patternImage;
                return img;
              })(),
              'repeat'
            );
            return pattern || "rgba(255, 234, 0, 0.2)";
          }
          return "rgba(255, 234, 0, 0.2)";
        },
        borderColor: "rgba(234, 179, 8, 0.8)", // Yellow border
        borderWidth: 2,
        stack: "generation", // Add to generation stack to extend it
      }] : []),
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
            
            // For deficit, add explanation text
            if (label === "Energy Deficit") {
              return `${label}: ${value.toFixed(1)} kWh (Generation needed to match consumption)`;
            }
            
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
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: "Energy (kWh)",
        },
        // This stacks bars with the same 'stack' property and separates those with different 'stack' properties
        stacked: true,
      },
    },
  };

  return (
    <div style={{ height }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ConsumptionGenerationBarChart;
