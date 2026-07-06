import type { DiagramData, DiagramProject, DiagramType } from "./types";

export const sampleProjectTitle = "华贺库粮食短缺及多方权利主张关系图";

export const emptyDiagramData: DiagramData = {
  nodes: [],
  edges: [],
  sections: [],
  timelineItems: [],
  legendItems: [],
};

export function createSampleProject(
  data: DiagramData = emptyDiagramData,
  timestamp = new Date().toISOString(),
): DiagramProject {
  return {
    id: "sample-huahe-warehouse-dispute",
    title: sampleProjectTitle,
    description: "围绕粮食库存短缺、货权主张和案件路径的示例法律关系图。",
    diagramType: "legal-relationship",
    canvas: {
      width: 2200,
      height: 1600,
      pagePreset: "custom",
    },
    data,
    createdAt: timestamp,
    updatedAt: timestamp,
    schemaVersion: 1,
  };
}

export function createBlankProject(
  title = "未命名法律关系图",
  diagramType: DiagramType = "legal-relationship",
  timestamp = new Date().toISOString(),
): DiagramProject {
  return {
    id: `project-${Date.now()}`,
    title,
    diagramType,
    canvas: {
      width: 1600,
      height: 1000,
      pagePreset: "custom",
    },
    data: {
      nodes: [],
      edges: [],
      sections: [],
      timelineItems: [],
      legendItems: [],
    },
    createdAt: timestamp,
    updatedAt: timestamp,
    schemaVersion: 1,
  };
}
