import { useState, useEffect } from 'react';
import { 
  SavedVisualization, 
  VISUALIZATIONS_STORAGE_KEY, 
  getVisualizationsForProject 
} from '../types';
import { useLocalStorage } from './useLocalStorage';

interface UseVisualizationsProps {
  projectId: string | undefined;
}

interface VisualizationSettings {
  chartView: "graph" | "pie";
  sourceFilters: any[];
  chartResolution: "hourly" | "daily" | "weekly";
  startDate: string;
  endDate: string;
  dataType: "consumption" | "generation" | "both";
}

interface UseVisualizationsReturn {
  savedVisualizations: SavedVisualization[];
  saveVisualization: (name: string, isGlobal: boolean) => void;
  loadVisualization: (visualization: SavedVisualization) => void;
  deleteVisualization: (id: string) => void;
}

export function useVisualizations(
  props: UseVisualizationsProps, 
  settings: VisualizationSettings,
  setSettings: (settings: Partial<VisualizationSettings>) => void
): UseVisualizationsReturn {
  const { projectId } = props;
  const [allVisualizations, setAllVisualizations] = useLocalStorage<SavedVisualization[]>(VISUALIZATIONS_STORAGE_KEY, []);
  const [projectVisualizations, setProjectVisualizations] = useState<SavedVisualization[]>([]);

  // Filter visualizations for current project
  useEffect(() => {
    if (projectId) {
      const visualizations = getVisualizationsForProject(allVisualizations, Number(projectId));
      setProjectVisualizations(visualizations);
    } else {
      setProjectVisualizations([]);
    }
  }, [projectId, allVisualizations]);

  // Save current visualization
  const saveVisualization = (name: string, isGlobal: boolean) => {
    if (!projectId) return;
    
    const { chartView, sourceFilters, chartResolution, startDate, endDate, dataType } = settings;
    
    const newVisualization: SavedVisualization = {
      id: Date.now().toString(),
      name,
      chartView,
      dataType,
      sourceFilters,
      timeFrame: chartResolution,
      startDate,
      endDate,
      global: isGlobal,
      project_id: Number(projectId),
    };

    setAllVisualizations([...allVisualizations, newVisualization]);
  };

  // Load saved visualization
  const loadVisualization = (visualization: SavedVisualization) => {
    setSettings({
      chartView: visualization.chartView,
      sourceFilters: visualization.sourceFilters,
      chartResolution: visualization.timeFrame,
      startDate: visualization.startDate,
      endDate: visualization.endDate,
    });
  };

  // Delete visualization
  const deleteVisualization = (id: string) => {
    const filteredVisualizations = allVisualizations.filter(v => v.id !== id);
    setAllVisualizations(filteredVisualizations);
  };

  return {
    savedVisualizations: projectVisualizations,
    saveVisualization,
    loadVisualization,
    deleteVisualization
  };
}