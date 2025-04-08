import React, { useState } from "react";
import { SavedVisualization } from "../../types";
import Modal from "../Modal";
import { useTheme } from "../../context/ThemeContext";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [newVisualizationName, setNewVisualizationName] = useState("");
  const [isGlobalVisualization, setIsGlobalVisualization] = useState(false);

  // Theme-aware styles
  const secondaryButtonStyle = {
    backgroundColor: isDark ? 'rgba(14, 165, 233, 0.2)' : 'rgba(14, 165, 233, 0.1)',
    color: isDark ? 'rgba(56, 189, 248, 0.9)' : 'rgba(2, 132, 199, 1)'
  };

  const itemBackgroundStyle = (isGlobal: boolean) => ({
    backgroundColor: isDark
      ? isGlobal ? 'rgba(14, 165, 233, 0.2)' : 'var(--color-background-dark)' 
      : isGlobal ? 'rgba(224, 242, 254, 0.8)' : 'var(--color-background-dark)',
    borderColor: isDark
      ? isGlobal ? 'rgba(14, 165, 233, 0.5)' : 'var(--color-card-border)'
      : isGlobal ? 'rgba(186, 230, 253, 1)' : 'var(--color-card-border)'
  });

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
        <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
          Saved Visualizations
        </h2>
        <button
          onClick={() => setShowSaveForm(true)}
          className="px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-80 transition"
          style={secondaryButtonStyle}
        >
          Save Current View
        </button>
      </div>

      {savedVisualizations.length > 0 ? (
        <div className="space-y-3">
          {savedVisualizations.map((viz) => (
            <div
              key={viz.id}
              className="flex items-center justify-between p-3 rounded-lg border"
              style={itemBackgroundStyle(viz.global)}
            >
              <div>
                <h3 className="font-medium" style={{ color: 'var(--color-text)' }}>
                  {viz.name}
                  {viz.global && (
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
                  className="px-2 py-1 text-xs rounded"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(14, 165, 233, 0.2)' : 'rgba(224, 242, 254, 0.8)',
                    color: isDark ? 'rgba(56, 189, 248, 0.9)' : 'rgba(2, 132, 199, 1)' 
                  }}
                >
                  Load
                </button>
                <button
                  onClick={() => deleteVisualization(viz.id)}
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
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--color-text-light)' }}>
          No saved visualizations yet. Create one by clicking "Save Current View".
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
              className="form-label"
            >
              Visualization Name
            </label>
            <input
              type="text"
              id="viz-name"
              value={newVisualizationName}
              onChange={(e) => setNewVisualizationName(e.target.value)}
              className="form-input"
              placeholder="Enter a name for this visualization"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="global-viz"
              checked={isGlobalVisualization}
              onChange={(e) => setIsGlobalVisualization(e.target.checked)}
              className="h-4 w-4 border-gray-300 rounded accent-secondary"
              style={{ 
                backgroundColor: isDark ? 'var(--color-background-dark)' : 'var(--color-input-bg)'
              }}
            />
            <label
              htmlFor="global-viz"
              className="ml-2 block text-sm"
              style={{ color: 'var(--color-text)' }}
            >
              Make this visualization available globally (across all projects)
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              onClick={() => setShowSaveForm(false)}
              className="px-3 py-1.5 rounded-md text-sm"
              style={{ 
                backgroundColor: 'var(--color-background-dark)', 
                color: 'var(--color-text)' 
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-secondary text-white rounded-md text-sm"
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
