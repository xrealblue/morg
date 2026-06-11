"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "~/trpc/react";

type ProjectContextType = {
  projectId: string;
  setProjectId: (id: string) => void;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projectId, setProjectIdState] = useState<string>("");

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem("morg.projectId") || ""
        : "";
    setProjectIdState(saved);
  }, []);

  const setProjectId = (id: string) => {
    setProjectIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("morg.projectId", id);
    }
  };

  return (
    <ProjectContext.Provider value={{ projectId, setProjectId }}>
      {children}
    </ProjectContext.Provider>
  );
}

export default function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  const { projectId, setProjectId } = context;
  const { data: projects } = api.project.getProjects.useQuery();
  const project = projects?.find((p) => p.id === projectId);

  return {
    projects,
    project,
    projectId,
    setProjectId,
  };
}
