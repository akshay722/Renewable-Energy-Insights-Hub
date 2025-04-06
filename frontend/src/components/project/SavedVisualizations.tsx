import React, { useState } from "react";
import { SavedVisualization } from "../../types";
import Modal from "../Modal";

interface SavedVisualizationsProps {
  savedVisualizations: SavedVisualization[];
  loadVisualization: (visualization: SavedVisualization) => void;
  deleteVisualization: (id: string) => void;
  saveVisualization: (name: string, isGlobal: boolean) => void;
}

const SavedVisualizations: React.FC<SavedVisualizationsProps> = ({
  savedVisualizations,
  loadVisualization,
  deleteVisualization,
  saveVisualization,
}) => {
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [newVisualizationName, setNewVisualizationName] = useState("");
  const [isGlobalVisualization, setIsGlobalVisualization] = useState(false);

  const handleSave = () => {
    if (newVisualizationName.trim()) {
      saveVisualization(newVisualizationName, isGlobalVisualization);
      setShowSaveForm(false);
      setNewVisualizationName("");
      setIsGlobalVisualization(false);
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Saved Visualizations
        </h2>
        <button
          onClick={() => setShowSaveForm(true)}
          className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md text-sm font-medium"
        >
          Save Current View
        </button>
      </div>

      {savedVisualizations.length > 0 ? (
        <div className="space-y-3">
          {savedVisualizations.map((viz) => (
            <div
              key={viz.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                viz.global ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
              }`}
            >
              <div>
                <h3 className="font-medium">
                  {viz.name}
                  {viz.global && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Global
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-500">
                  {viz.chartView === "graph" ? "Graph" : "Pie"} ·
                  {viz.dataType === "consumption"
                    ? " Consumption"
                    : viz.dataType === "generation"
                    ? " Generation"
                    : " Both (Consumption & Generation)"}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => loadVisualization(viz)}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                >
                  Load
                </button>
                <button
                  onClick={() => deleteVisualization(viz.id)}
                  className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">
          No saved visualizations yet. Create one by clicking "Save
          Visualization".
        </p>
      )}

      {/* Save Visualization Modal */}
      <Modal
        isOpen={showSaveForm}
        onClose={() => setShowSaveForm(false)}
        title="Save Current View"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="viz-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Visualization Name
            </label>
            <input
              type="text"
              id="viz-name"
              value={newVisualizationName}
              onChange={(e) => setNewVisualizationName(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter a name for this visualization"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="global-viz"
              checked={isGlobalVisualization}
              onChange={(e) => setIsGlobalVisualization(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="global-viz"
              className="ml-2 block text-sm text-gray-700"
            >
              Make this visualization available globally (across all projects)
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              onClick={() => setShowSaveForm(false)}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm"
              disabled={!newVisualizationName.trim()}
            >
              Save Visualization
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SavedVisualizations;
