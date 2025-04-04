import React, { useMemo } from 'react';
import { EnergyConsumption, isRenewableSource } from '../../types';

interface GreenPowerHeatmapProps {
  consumptionData: EnergyConsumption[];
  viewMode?: 'day' | 'week';
  title?: string;
}

interface HeatmapCell {
  hour: number;
  day: number;
  greenPercentage: number;
  totalConsumption: number;
  greenConsumption: number;
}

const GreenPowerHeatmap: React.FC<GreenPowerHeatmapProps> = ({
  consumptionData,
  viewMode = 'day',
  title = '24/7 Green Power Coverage'
}) => {
  // Process data for heatmap
  const heatmapData = useMemo(() => {
    if (!consumptionData.length) return [];

    const hourlyData: Map<string, HeatmapCell> = new Map();
    
    // Prepare a grid of 24 hours x 7 days (for week view) or 24 hours (for day view)
    const days = viewMode === 'week' ? 7 : 1;
    
    // Initialize grid with zero values
    for (let day = 0; day < days; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}-${hour}`;
        hourlyData.set(key, {
          hour,
          day,
          greenPercentage: 0,
          totalConsumption: 0,
          greenConsumption: 0
        });
      }
    }
    
    // Aggregate consumption data
    consumptionData.forEach(item => {
      const date = new Date(item.timestamp);
      const hour = date.getHours();
      const day = viewMode === 'week' ? date.getDay() : 0; // Use day of week for week view
      
      const key = `${day}-${hour}`;
      
      // Skip if this combination doesn't exist in our grid
      if (!hourlyData.has(key)) return;
      
      const cell = hourlyData.get(key)!;
      
      // Add consumption value
      cell.totalConsumption += item.value_kwh;
      
      // If it's from a renewable source, add to green consumption
      if (isRenewableSource(item.source_type)) {
        cell.greenConsumption += item.value_kwh;
      }
      
      // Update the cell
      hourlyData.set(key, cell);
    });
    
    // Calculate green percentage for each cell
    hourlyData.forEach((cell, key) => {
      if (cell.totalConsumption > 0) {
        cell.greenPercentage = (cell.greenConsumption / cell.totalConsumption) * 100;
      }
      hourlyData.set(key, cell);
    });
    
    // Convert to array for easier rendering
    return Array.from(hourlyData.values());
  }, [consumptionData, viewMode]);
  
  // Color scale function - returns color based on percentage
  const getColorForPercentage = (percentage: number): string => {
    // Red (0%) to Yellow (50%) to Green (100%) gradient
    if (percentage <= 50) {
      // Red to Yellow gradient (map 0-50% to 0-120 hue)
      const hue = (percentage / 50) * 60;
      return `hsl(${hue}, 90%, 60%)`;
    } else {
      // Yellow to Green gradient (map 50-100% to 60-120 hue)
      const hue = 60 + ((percentage - 50) / 50) * 60;
      return `hsl(${hue}, 90%, 45%)`;
    }
  };
  
  // Get day name for week view
  const getDayName = (day: number): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day];
  };
  
  // Format hour for display
  const formatHour = (hour: number): string => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };
  
  return (
    <div className="flex flex-col">
      <h3 className="text-lg font-medium mb-2 text-center">{title}</h3>
      
      <div className="flex">
        {/* Hour labels (left side) */}
        <div className="flex flex-col mr-2 pt-6 text-xs">
          {Array.from({ length: 24 }, (_, i) => (
            <div key={`hour-${i}`} className="h-6 flex items-center justify-end pr-1">
              {i % 2 === 0 && formatHour(i)}
            </div>
          ))}
        </div>
        
        {/* Day columns */}
        <div className="flex flex-1">
          {viewMode === 'week' ? (
            // Week view - 7 columns for each day
            Array.from({ length: 7 }, (_, day) => (
              <div key={`day-${day}`} className="flex-1">
                {/* Day header */}
                <div className="h-6 text-center text-xs font-medium">{getDayName(day)}</div>
                
                {/* Hours for this day */}
                <div className="flex flex-col">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const cell = heatmapData.find(d => d.day === day && d.hour === hour);
                    const percentage = cell?.greenPercentage || 0;
                    
                    return (
                      <div
                        key={`cell-${day}-${hour}`}
                        className="h-6 mx-0.5 rounded-sm flex items-center justify-center text-xs relative"
                        style={{ 
                          backgroundColor: getColorForPercentage(percentage),
                          color: percentage > 50 ? 'black' : 'white',
                        }}
                        title={`Day: ${getDayName(day)}, Hour: ${formatHour(hour)}
Green Energy: ${percentage.toFixed(1)}%
Green: ${cell?.greenConsumption.toFixed(2) || 0} kWh
Total: ${cell?.totalConsumption.toFixed(2) || 0} kWh`}
                      >
                        {/* Only show percentage if there's consumption */}
                        {cell?.totalConsumption > 0 && (
                          <span className="text-xs">{Math.round(percentage)}%</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            // Day view - single column
            <div className="flex-1">
              <div className="h-6 text-center text-xs font-medium">Average Day</div>
              
              {/* Hours for the day */}
              <div className="flex flex-col">
                {Array.from({ length: 24 }, (_, hour) => {
                  const cell = heatmapData.find(d => d.hour === hour);
                  const percentage = cell?.greenPercentage || 0;
                  
                  return (
                    <div
                      key={`cell-${hour}`}
                      className="h-6 mx-0.5 rounded-sm flex items-center justify-center text-sm relative"
                      style={{ 
                        backgroundColor: getColorForPercentage(percentage),
                        color: percentage > 50 ? 'black' : 'white',
                      }}
                      title={`Hour: ${formatHour(hour)}
Green Energy: ${percentage.toFixed(1)}%
Green: ${cell?.greenConsumption.toFixed(2) || 0} kWh
Total: ${cell?.totalConsumption.toFixed(2) || 0} kWh`}
                    >
                      {Math.round(percentage)}%
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center items-center mt-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs">0% Green</span>
          <div className="flex h-4 w-40">
            {Array.from({ length: 10 }, (_, i) => (
              <div 
                key={`legend-${i}`}
                className="flex-1 h-full" 
                style={{ backgroundColor: getColorForPercentage(i * 10) }}
              />
            ))}
          </div>
          <span className="text-xs">100% Green</span>
        </div>
      </div>
    </div>
  );
};

export default GreenPowerHeatmap;