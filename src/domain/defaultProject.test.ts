import { describe, expect, it } from "vitest";
import { createSampleProject } from "./defaultProject";
import type { DiagramData } from "./types";

const data: DiagramData = {
  nodes: [],
  edges: [],
  sections: [],
  timelineItems: [],
  legendItems: [],
};

describe("createSampleProject", () => {
  it("wraps diagram data with the sample project metadata", () => {
    const project = createSampleProject(data, "2026-01-01T00:00:00.000Z");

    expect(project.title).toBe("华贺库粮食短缺及多方权利主张关系图");
    expect(project.diagramType).toBe("legal-relationship");
    expect(project.canvas).toMatchObject({ width: 2200, height: 1600 });
    expect(project.data).toEqual(data);
  });
});
