import { describe, expect, it } from "vitest";
import { normalizeDiagramProject, projectFileBaseName } from "./importExportJson";

describe("normalizeDiagramProject", () => {
  it("wraps legacy diagram JSON into a project", () => {
    const project = normalizeDiagramProject({
      nodes: [{ id: "n1", kind: "party", text: "主体", x: 1, y: 2 }],
      edges: [{ id: "e1", from: "n1", to: "n2" }],
    });

    expect(project.schemaVersion).toBe(1);
    expect(project.title).toBe("未命名法律关系图");
    expect(project.data.nodes[0]).toMatchObject({
      id: "n1",
      type: "subject",
      width: 220,
      height: 90,
    });
  });

  it("normalizes project JSON and preserves project metadata", () => {
    const project = normalizeDiagramProject({
      schemaVersion: 1,
      title: "货权争议图",
      diagramType: "dispute",
      canvas: { width: 1600, height: 900, pagePreset: "16:9" },
      data: {
        nodes: [],
        edges: [],
        sections: [],
        timelineItems: [],
        legendItems: [],
      },
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    });

    expect(project.title).toBe("货权争议图");
    expect(project.diagramType).toBe("dispute");
    expect(project.canvas).toMatchObject({ width: 1600, height: 900 });
    expect(project.createdAt).toBe("2026-01-01T00:00:00.000Z");
  });
});

describe("projectFileBaseName", () => {
  it("returns a filesystem-safe name from project title", () => {
    expect(projectFileBaseName("货权/争议:关系图?")).toBe("货权-争议-关系图");
  });
});
