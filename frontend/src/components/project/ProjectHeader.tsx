import React from "react";
import { Project } from "../../types";

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
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
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
      <span className="text-2xl font-bold text-gray-900">{project.name}</span>
      <span className="ml-2">{project.location}</span>
    </div>
  );
};

export default ProjectHeader;
