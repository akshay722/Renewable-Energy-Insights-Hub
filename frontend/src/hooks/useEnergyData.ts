import { useState, useEffect } from 'react';
import {
  projectsApi,
  insightsApi,
  consumptionApi,
  generationApi,
} from "../services/api";
import {
  Project,
  EnergySummary,
  EnergySourceType,
  DailyAggregateData,
  EnergyConsumption,
  EnergyGeneration,
  WeeklyAggregateData,
} from '../types';

interface EnergyDataState {
  project: Project | null;
  summary: EnergySummary | null;
  consumptionData: EnergyConsumption[];
  generationData: EnergyGeneration[];
  dailyConsumptionData: DailyAggregateData[];
  dailyGenerationData: DailyAggregateData[];
  weeklyConsumptionData: WeeklyAggregateData[];
  weeklyGenerationData: WeeklyAggregateData[];
  consumptionBySource: Record<string, number>;
  generationBySource: Record<string, number>;
  totalConsumption: number;
  totalGeneration: number;
  isLoading: boolean;
}

interface EnergyDataFilters {
  projectId: string | undefined;
  startDate: string;
  endDate: string;
  sourceFilters: EnergySourceType[];
}

export function useEnergyData(filters: EnergyDataFilters) {
  const [state, setState] = useState<EnergyDataState>({
    project: null,
    summary: null,
    consumptionData: [],
    generationData: [],
    dailyConsumptionData: [],
    dailyGenerationData: [],
    weeklyConsumptionData: [],
    weeklyGenerationData: [],
    consumptionBySource: {},
    generationBySource: {},
    totalConsumption: 0,
    totalGeneration: 0,
    isLoading: true,
  });

  const { projectId, startDate, endDate, sourceFilters } = filters;

  // Load project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) return;

      try {
        const projectData = await projectsApi.getById(Number(projectId));
        setState(prevState => ({ ...prevState, project: projectData }));
      } catch (error) {
        console.error("Error loading project details:", error);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  // Load energy data
  useEffect(() => {
    const loadEnergyData = async () => {
      if (!projectId) return;

      setState(prevState => ({ ...prevState, isLoading: true }));
      try {
        // Prepare filter params
        const filters = {
          start_date: startDate,
          end_date: endDate,
          source_type: sourceFilters.length > 0 ? sourceFilters : [],
          project_id: Number(projectId),
        };
        
        // Fetch all relevant data in parallel
        const [
          summaryData,
          consumptionResponse,
          generationResponse,
          dailyConsumptionResponse,
          dailyGenerationResponse,
          weeklyConsumptionResponse,
          weeklyGenerationResponse,
        ] = await Promise.all([
          insightsApi.getSummary(startDate, endDate, Number(projectId)),
          consumptionApi.getAll(filters),
          generationApi.getAll(filters),
          consumptionApi.getDailyAggregate(filters),
          generationApi.getDailyAggregate(filters),
          consumptionApi.getWeeklyAggregate(filters),
          generationApi.getWeeklyAggregate(filters),
        ]);

        setState(prevState => ({
          ...prevState,
          summary: summaryData,
          totalConsumption: summaryData?.total_consumption || 0,
          totalGeneration: summaryData?.total_generation || 0,
          consumptionData: consumptionResponse || [],
          generationData: generationResponse || [],
          consumptionBySource: dailyConsumptionResponse?.by_source || {},
          dailyConsumptionData: dailyConsumptionResponse?.daily_consumption || [],
          generationBySource: dailyGenerationResponse?.by_source || {},
          dailyGenerationData: dailyGenerationResponse?.daily_generation || [],
          weeklyConsumptionData: weeklyConsumptionResponse?.weekly_consumption || [],
          weeklyGenerationData: weeklyGenerationResponse?.weekly_generation || [],
          isLoading: false,
        }));
      } catch (error) {
        console.error("Error loading energy data:", error);
        setState(prevState => ({ ...prevState, isLoading: false }));
      }
    };

    loadEnergyData();
  }, [projectId, startDate, endDate, sourceFilters.join(',')]);

  return state;
}