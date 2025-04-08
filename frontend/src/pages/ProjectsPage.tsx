import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { projectsApi } from "../services/api";
import { Project } from "../types";

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectLocation, setNewProjectLocation] = useState("");

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Load projects when component mounts
  useEffect(() => {
    // Add a small delay to ensure auth context is ready
    const timer = setTimeout(() => {
      loadProjects();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Load projects from API
  const loadProjects = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await projectsApi.getAll();
      setProjects(data || []);
    } catch (error) {
      console.error("Error loading projects:", error);
      setError("Failed to load projects. Please try again later.");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new project
  const createProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      const createdProject = await projectsApi.create({
        name: newProjectName,
        description: newProjectDescription || undefined,
        location: newProjectLocation || undefined,
      });

      setProjects([...projects, createdProject]);
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  // Reset the form fields
  const resetForm = () => {
    setNewProjectName("");
    setNewProjectDescription("");
    setNewProjectLocation("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Projects</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
        >
          Add Project
        </button>
      </div>

      {/* Create Project Form */}
      {showCreateForm && (
        <div className="card" style={{ backgroundColor: 'var(--color-primary-light)', opacity: 0.1 }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>
            Create New Project
          </h2>
          <div className="space-y-4">
            <div>
              <label className="form-label">
                Project Name*
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="form-input"
                placeholder="Enter project name"
                required
              />
            </div>
            <div>
              <label className="form-label">
                Description
              </label>
              <textarea
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                className="form-input"
                placeholder="Enter project description"
                rows={3}
              />
            </div>
            <div>
              <label className="form-label">
                Location
              </label>
              <input
                type="text"
                value={newProjectLocation}
                onChange={(e) => setNewProjectLocation(e.target.value)}
                className="form-input"
                placeholder="Enter project location"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="px-3 py-1.5 rounded-md text-sm"
                style={{ 
                  backgroundColor: 'var(--color-background-dark)', 
                  color: 'var(--color-text)' 
                }}
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                className="px-3 py-1.5 bg-primary text-white rounded-md text-sm"
                disabled={!newProjectName.trim()}
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="border-l-4 border-red-500 p-4 rounded mb-6" 
             style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
          <div className="flex">
            <div className="flex-shrink-0 text-red-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Projects List */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="animate-pulse h-20 rounded" style={{ backgroundColor: 'var(--color-card-border)' }}></div>
          <div className="animate-pulse h-20 rounded" style={{ backgroundColor: 'var(--color-card-border)' }}></div>
          <div className="animate-pulse h-20 rounded" style={{ backgroundColor: 'var(--color-card-border)' }}></div>
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="card hover:shadow-md transition"
            >
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                    {project.name}
                  </h3>
                  {project.location && (
                    <p className="text-sm mb-2" style={{ color: 'var(--color-text-light)' }}>
                      📍 {project.location}
                    </p>
                  )}
                  {project.description && (
                    <p className="mt-2" style={{ color: 'var(--color-text)' }}>{project.description}</p>
                  )}
                </div>
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-card-border)' }}>
                  <span className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                    Created: {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card text-center py-10" style={{ backgroundColor: 'var(--color-background-dark)' }}>
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-light)' }}>
            No projects yet
          </h3>
          <p style={{ color: 'var(--color-text-light)' }}>
            Click "Add Project" to create your first project
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
