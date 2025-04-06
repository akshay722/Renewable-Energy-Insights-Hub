import React, { useState } from "react";
import { Alert } from "../../types";
import Modal from "../Modal";

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
        <h2 className="text-xl font-semibold text-gray-800">Alerts</h2>
        <button
          onClick={() => setShowAlertForm(true)}
          className="px-3 py-1.5 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-md text-sm font-medium"
        >
          Create New Alert
        </button>
      </div>

      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border ${
                alert.active
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-gray-50 border-gray-200"
              } ${alert.global ? "border-l-4 border-l-blue-500" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">
                    {alert.name}
                    {alert.global && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Global
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Alert when {alert.type}{" "}
                    {alert.condition === "above" ? "exceeds" : "falls below"}{" "}
                    {alert.threshold} kWh
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleAlertStatus(alert.id)}
                    className={`px-2 py-1 text-xs rounded ${
                      alert.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {alert.active ? "Enabled" : "Disabled"}
                  </button>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">
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
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Alert Name
            </label>
            <input
              type="text"
              id="alert-name"
              value={newAlertName}
              onChange={(e) => setNewAlertName(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter a name for this alert"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alert Type
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setNewAlertType("consumption")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex-1 ${
                  newAlertType === "consumption"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Consumption
              </button>
              <button
                onClick={() => setNewAlertType("generation")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex-1 ${
                  newAlertType === "generation"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Generation
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alert Condition
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setNewAlertCondition("above")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex-1 ${
                  newAlertCondition === "above"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Above Threshold
              </button>
              <button
                onClick={() => setNewAlertCondition("below")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex-1 ${
                  newAlertCondition === "below"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Below Threshold
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="alert-threshold"
              className="block text-sm font-medium text-gray-700 mb-1"
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
              className="w-full p-2 border rounded-md"
              min="0"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="global-alert"
              checked={isGlobalAlert}
              onChange={(e) => setIsGlobalAlert(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="global-alert"
              className="ml-2 block text-sm text-gray-700"
            >
              Make this alert available globally (across all projects)
            </label>
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Alert Preview
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              {newAlertType === "consumption" ? (
                totalConsumption > 0 ? (
                  <span
                    className={
                      (newAlertCondition === "above" &&
                        totalConsumption > newAlertThreshold) ||
                      (newAlertCondition === "below" &&
                        totalConsumption < newAlertThreshold)
                        ? "text-red-600 font-medium"
                        : "text-green-600"
                    }
                  >
                    {(newAlertCondition === "above" &&
                      totalConsumption > newAlertThreshold) ||
                    (newAlertCondition === "below" &&
                      totalConsumption < newAlertThreshold)
                      ? "Would trigger now"
                      : "Would not trigger now"}{" "}
                    (Current: {totalConsumption.toFixed(1)} kWh)
                  </span>
                ) : (
                  <span className="text-gray-500">
                    No consumption data available
                  </span>
                )
              ) : totalGeneration > 0 ? (
                <span
                  className={
                    (newAlertCondition === "above" &&
                      totalGeneration > newAlertThreshold) ||
                    (newAlertCondition === "below" &&
                      totalGeneration < newAlertThreshold)
                      ? "text-red-600 font-medium"
                      : "text-green-600"
                  }
                >
                  {(newAlertCondition === "above" &&
                    totalGeneration > newAlertThreshold) ||
                  (newAlertCondition === "below" &&
                    totalGeneration < newAlertThreshold)
                    ? "Would trigger now"
                    : "Would not trigger now"}{" "}
                  (Current: {totalGeneration.toFixed(1)} kWh)
                </span>
              ) : (
                <span className="text-gray-500">
                  No generation data available
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              onClick={() => setShowAlertForm(false)}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAlert}
              className="px-3 py-1.5 bg-yellow-500 text-white rounded-md text-sm"
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
