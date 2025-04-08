import { useState, useEffect } from 'react';
import { Alert, ALERTS_STORAGE_KEY, getAlertsForProject } from '../types';
import { useLocalStorage } from './useLocalStorage';

interface UseAlertsProps {
  projectId: string | undefined;
  totalConsumption: number;
  totalGeneration: number;
}

interface UseAlertsReturn {
  alerts: Alert[];
  triggeredAlerts: string[];
  showTriggeredAlerts: boolean;
  setShowTriggeredAlerts: (show: boolean) => void;
  saveAlert: (
    name: string,
    type: "consumption" | "generation",
    threshold: number,
    condition: "above" | "below",
    isGlobal: boolean
  ) => void;
  toggleAlertStatus: (id: string) => void;
  deleteAlert: (id: string) => void;
}

export function useAlerts({ 
  projectId, 
  totalConsumption, 
  totalGeneration 
}: UseAlertsProps): UseAlertsReturn {
  const [allAlerts, setAllAlerts] = useLocalStorage<Alert[]>(ALERTS_STORAGE_KEY, []);
  const [projectAlerts, setProjectAlerts] = useState<Alert[]>([]);
  const [triggeredAlerts, setTriggeredAlerts] = useState<string[]>([]);
  const [showTriggeredAlerts, setShowTriggeredAlerts] = useState(false);

  // Filter alerts for current project
  useEffect(() => {
    if (projectId) {
      const alerts = getAlertsForProject(allAlerts, Number(projectId));
      setProjectAlerts(alerts);
    } else {
      setProjectAlerts([]);
    }
  }, [projectId, allAlerts]);

  // Check for triggered alerts
  useEffect(() => {
    if (projectAlerts.length === 0) return;

    const activeAlerts = projectAlerts.filter(alert => alert.active);
    if (activeAlerts.length === 0) return;

    const triggered: string[] = [];

    activeAlerts.forEach(alert => {
      const value = alert.type === "consumption" ? totalConsumption : totalGeneration;
      const triggerCondition =
        (alert.condition === "above" && value > alert.threshold) ||
        (alert.condition === "below" && value < alert.threshold);

      if (triggerCondition) {
        triggered.push(
          `${alert.name}: ${alert.type} is ${
            alert.condition === "above" ? "above" : "below"
          } threshold of ${alert.threshold} kWh (Current: ${value.toFixed(1)} kWh)`
        );
      }
    });

    if (triggered.length > 0) {
      setTriggeredAlerts(triggered);
      setShowTriggeredAlerts(true);
    }
  }, [projectAlerts, totalConsumption, totalGeneration]);

  // Save new alert
  const saveAlert = (
    name: string,
    type: "consumption" | "generation",
    threshold: number,
    condition: "above" | "below",
    isGlobal: boolean
  ) => {
    if (!projectId) return;
    
    const newAlert: Alert = {
      id: Date.now().toString(),
      name,
      type,
      threshold,
      condition,
      active: true,
      global: isGlobal,
      project_id: Number(projectId),
    };

    setAllAlerts([...allAlerts, newAlert]);
  };

  // Toggle alert active status
  const toggleAlertStatus = (id: string) => {
    const updatedAlerts = allAlerts.map(alert =>
      alert.id === id ? { ...alert, active: !alert.active } : alert
    );
    
    setAllAlerts(updatedAlerts);
  };

  // Delete alert
  const deleteAlert = (id: string) => {
    const filteredAlerts = allAlerts.filter(alert => alert.id !== id);
    setAllAlerts(filteredAlerts);
  };

  return {
    alerts: projectAlerts,
    triggeredAlerts,
    showTriggeredAlerts,
    setShowTriggeredAlerts,
    saveAlert,
    toggleAlertStatus,
    deleteAlert
  };
}