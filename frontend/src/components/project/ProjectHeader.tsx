import React from "react";
import { Link } from "react-router-dom";
import { Project } from "../../types";
import Icon from "../icons/Icon";

interface ProjectHeaderProps {
  project: Project | null;
  isLoading: boolean;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 rounded w-1/3 mb-2" style={{ backgroundColor: 'var(--color-card-border)' }}></div>
        <div className="h-4 rounded w-1/4" style={{ backgroundColor: 'var(--color-card-border)' }}></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-red-500">
        Project not found or error loading project details
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
        <Link
          to="/projects"
          className="inline-flex items-center hover:opacity-80 transition duration-150 w-max"
          style={{ color: 'var(--color-primary)' }}
        >
          <Icon name="back" className="h-4 w-4 mr-1" />
          Back to Projects
        </Link>
      </div>

      <div>
        <span className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          {project.name}
        </span>
        {project.location && (
          <span className="ml-2" style={{ color: 'var(--color-text-light)' }}>
            {project.location}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProjectHeader;
