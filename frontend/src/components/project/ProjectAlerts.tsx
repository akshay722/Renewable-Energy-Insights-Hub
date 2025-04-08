import React, { useState } from "react";
import { Alert } from "../../types";
import Modal from "../Modal";
import { useTheme } from "../../context/ThemeContext";

interface ProjectAlertsProps {
  alerts: Alert[];
  toggleAlertStatus: (id: string) => void;
  deleteAlert: (id: string) => void;
  saveAlert: (
    name: string,
    type: "consumption" | "generation",
    threshold: number,
    condition: "above" | "below",
    isGlobal: boolean
  ) => void;
  totalConsumption: number;
  totalGeneration: number;
}

const ProjectAlerts: React.FC<ProjectAlertsProps> = ({
  alerts,
  toggleAlertStatus,
  deleteAlert,
  saveAlert,
  totalConsumption,
  totalGeneration,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [newAlertName, setNewAlertName] = useState("");
  const [newAlertType, setNewAlertType] = useState<
    "consumption" | "generation"
  >("consumption");
  const [newAlertThreshold, setNewAlertThreshold] = useState(100);
  const [newAlertCondition, setNewAlertCondition] = useState<"above" | "below">(
    "above"
  );
  const [isGlobalAlert, setIsGlobalAlert] = useState(false);

  // Theme-aware styles
  const alertButtonStyle = {
    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(254, 240, 138, 0.7)',
    color: isDark ? 'rgba(252, 211, 77, 0.9)' : 'rgba(180, 83, 9, 1)'
  };
  
  const alertItemStyle = (isActive: boolean, isGlobal: boolean) => ({
    backgroundColor: isDark
      ? isActive ? 'rgba(245, 158, 11, 0.2)' : 'var(--color-background-dark)'
      : isActive ? 'rgba(254, 240, 138, 0.2)' : 'var(--color-background-dark)',
    borderColor: isDark 
      ? isActive ? 'rgba(245, 158, 11, 0.4)' : 'var(--color-card-border)'
      : isActive ? 'rgba(251, 191, 36, 0.5)' : 'var(--color-card-border)',
    borderLeftColor: isGlobal ? 'var(--color-secondary)' : undefined,
    borderLeftWidth: isGlobal ? '4px' : undefined
  });

  const handleSaveAlert = () => {
    if (newAlertName.trim()) {
      saveAlert(
        newAlertName,
        newAlertType,
        newAlertThreshold,
        newAlertCondition,
        isGlobalAlert
      );
      setShowAlertForm(false);
      setNewAlertName("");
      setNewAlertType("consumption");
      setNewAlertThreshold(100);
      setNewAlertCondition("above");
      setIsGlobalAlert(false);
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>Alerts</h2>
        <button
          onClick={() => setShowAlertForm(true)}
          className="px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-80 transition"
          style={alertButtonStyle}
        >
          Create New Alert
        </button>
      </div>

      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3 rounded-lg border"
              style={alertItemStyle(alert.active, alert.global)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium" style={{ color: 'var(--color-text)' }}>
                    {alert.name}
                    {alert.global && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: isDark ? 'rgba(14, 165, 233, 0.3)' : 'rgba(224, 242, 254, 1)',
                              color: isDark ? 'rgba(56, 189, 248, 1)' : 'rgba(2, 132, 199, 1)'
                            }}>
                        Global
                      </span>
                    )}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                    Alert when {alert.type}{" "}
                    {alert.condition === "above" ? "exceeds" : "falls below"}{" "}
                    {alert.threshold} kWh
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleAlertStatus(alert.id)}
                    className="px-2 py-1 text-xs rounded"
                    style={alert.active
                      ? { 
                          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(209, 250, 229, 0.8)',
                          color: isDark ? 'rgba(52, 211, 153, 0.9)' : 'rgba(6, 95, 70, 1)'
                        }
                      : { 
                          backgroundColor: isDark ? 'rgba(156, 163, 175, 0.2)' : 'rgba(243, 244, 246, 0.8)',
                          color: isDark ? 'rgba(209, 213, 219, 0.9)' : 'rgba(75, 85, 99, 1)'
                        }
                    }
                  >
                    {alert.active ? "Enabled" : "Disabled"}
                  </button>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="px-2 py-1 text-xs rounded"
                    style={{ 
                      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(254, 226, 226, 0.8)',
                      color: isDark ? 'rgba(252, 165, 165, 0.9)' : 'rgba(185, 28, 28, 1)' 
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--color-text-light)' }}>
          No alerts configured yet. Create one by clicking "Create New Alert".
        </p>
      )}

      {/* Create Alert Modal */}
      <Modal
        isOpen={showAlertForm}
        onClose={() => setShowAlertForm(false)}
        title="Create New Alert"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="alert-name"
              className="form-label"
            >
              Alert Name
            </label>
            <input
              type="text"
              id="alert-name"
              value={newAlertName}
              onChange={(e) => setNewAlertName(e.target.value)}
              className="form-input"
              placeholder="Enter a name for this alert"
            />
          </div>

          <div>
            <label className="form-label">
              Alert Type
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setNewAlertType("consumption")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex-1 ${
                  newAlertType === "consumption"
                    ? "bg-secondary text-white"
                    : ""
                }`}
                style={newAlertType !== "consumption" ? { 
                  backgroundColor: 'var(--color-background-dark)', 
                  color: 'var(--color-text)' 
                } : {}}
              >
                Consumption
              </button>
              <button
                onClick={() => setNewAlertType("generation")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex-1 ${
                  newAlertType === "generation"
                    ? "bg-primary text-white"
                    : ""
                }`}
                style={newAlertType !== "generation" ? { 
                  backgroundColor: 'var(--color-background-dark)', 
                  color: 'var(--color-text)' 
                } : {}}
              >
                Generation
              </button>
            </div>
          </div>

          <div>
            <label className="form-label">
              Alert Condition
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setNewAlertCondition("above")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex-1 transition-colors ${
                  newAlertCondition === "above"
                    ? ""
                    : ""
                }`}
                style={newAlertCondition === "above"
                  ? alertButtonStyle
                  : { backgroundColor: 'var(--color-background-dark)', color: 'var(--color-text)' }
                }
              >
                Above Threshold
              </button>
              <button
                onClick={() => setNewAlertCondition("below")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex-1 transition-colors ${
                  newAlertCondition === "below"
                    ? ""
                    : ""
                }`}
                style={newAlertCondition === "below"
                  ? alertButtonStyle
                  : { backgroundColor: 'var(--color-background-dark)', color: 'var(--color-text)' }
                }
              >
                Below Threshold
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="alert-threshold"
              className="form-label"
            >
              Threshold (kWh)
            </label>
            <input
              type="number"
              id="alert-threshold"
              value={newAlertThreshold}
              onChange={(e) =>
                setNewAlertThreshold(Math.max(0, parseInt(e.target.value) || 0))
              }
              className="form-input"
              min="0"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="global-alert"
              checked={isGlobalAlert}
              onChange={(e) => setIsGlobalAlert(e.target.checked)}
              className="h-4 w-4 border-gray-300 rounded accent-secondary"
              style={{ backgroundColor: isDark ? 'var(--color-background-dark)' : 'var(--color-input-bg)' }}
            />
            <label
              htmlFor="global-alert"
              className="ml-2 block text-sm"
              style={{ color: 'var(--color-text)' }}
            >
              Make this alert available globally (across all projects)
            </label>
          </div>

          <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--color-card-border)' }}>
            <div className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              Alert Preview
            </div>
            <div className="p-3 rounded-md" style={{ backgroundColor: 'var(--color-background-dark)' }}>
              {newAlertType === "consumption" ? (
                totalConsumption > 0 ? (
                  <span
                    style={{
                      color: ((newAlertCondition === "above" && totalConsumption > newAlertThreshold) ||
                             (newAlertCondition === "below" && totalConsumption < newAlertThreshold))
                        ? isDark ? 'rgba(252, 165, 165, 1)' : 'rgba(220, 38, 38, 1)'
                        : isDark ? 'rgba(52, 211, 153, 1)' : 'rgba(5, 150, 105, 1)',
                      fontWeight: ((newAlertCondition === "above" && totalConsumption > newAlertThreshold) ||
                                  (newAlertCondition === "below" && totalConsumption < newAlertThreshold))
                        ? 500
                        : 400
                    }}
                  >
                    {(newAlertCondition === "above" && totalConsumption > newAlertThreshold) ||
                    (newAlertCondition === "below" && totalConsumption < newAlertThreshold)
                      ? "Would trigger now"
                      : "Would not trigger now"}{" "}
                    (Current: {totalConsumption.toFixed(1)} kWh)
                  </span>
                ) : (
                  <span style={{ color: 'var(--color-text-light)' }}>
                    No consumption data available
                  </span>
                )
              ) : totalGeneration > 0 ? (
                <span
                  style={{
                    color: ((newAlertCondition === "above" && totalGeneration > newAlertThreshold) ||
                           (newAlertCondition === "below" && totalGeneration < newAlertThreshold))
                      ? isDark ? 'rgba(252, 165, 165, 1)' : 'rgba(220, 38, 38, 1)'
                      : isDark ? 'rgba(52, 211, 153, 1)' : 'rgba(5, 150, 105, 1)',
                    fontWeight: ((newAlertCondition === "above" && totalGeneration > newAlertThreshold) ||
                                (newAlertCondition === "below" && totalGeneration < newAlertThreshold))
                      ? 500
                      : 400
                  }}
                >
                  {(newAlertCondition === "above" && totalGeneration > newAlertThreshold) ||
                  (newAlertCondition === "below" && totalGeneration < newAlertThreshold)
                    ? "Would trigger now"
                    : "Would not trigger now"}{" "}
                  (Current: {totalGeneration.toFixed(1)} kWh)
                </span>
              ) : (
                <span style={{ color: 'var(--color-text-light)' }}>
                  No generation data available
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              onClick={() => setShowAlertForm(false)}
              className="px-3 py-1.5 rounded-md text-sm"
              style={{ 
                backgroundColor: 'var(--color-background-dark)', 
                color: 'var(--color-text)' 
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAlert}
              className="px-3 py-1.5 rounded-md text-sm text-white"
              style={alertButtonStyle}
              disabled={!newAlertName.trim()}
            >
              Create Alert
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectAlerts;
