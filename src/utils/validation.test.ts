import { describe, expect, it } from "vitest";
import { validateDiagramProject } from "./validation";
import type { DiagramProject } from "../domain/types";

function makeProject(overrides: Partial<DiagramProject> = {}): DiagramProject {
  return {
    id: "project-1",
    title: "测试项目",
    diagramType: "legal-relationship",
    canvas: { width: 1200, height: 800, pagePreset: "custom" },
    schemaVersion: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    data: {
      nodes: [],
      edges: [],
      sections: [],
      timelineItems: [],
      legendItems: [],
    },
    ...overrides,
  };
}

describe("validateDiagramProject", () => {
  it("reports duplicate ids, dangling edges, isolated nodes, long text, and hidden edges", () => {
    const project = makeProject({
      data: {
        nodes: [
          { id: "n1", type: "subject", x: 0, y: 0, width: 220, height: 90, text: "主体" },
          { id: "n1", type: "subject", x: 0, y: 0, width: 220, height: 90, text: "重复" },
          {
            id: "long",
            type: "note",
            x: 0,
            y: 0,
            width: 220,
            height: 90,
            text: "这是一段非常长的节点文字".repeat(20),
          },
        ],
        edges: [
          { id: "e1", from: "n1", to: "missing", opacity: 0 },
          { id: "e1", from: "missing", to: "n1", visible: false },
        ],
        sections: [],
        timelineItems: [],
        legendItems: [],
      },
    });

    const codes = validateDiagramProject(project).map((issue) => issue.code);

    expect(codes).toContain("duplicate-node-id");
    expect(codes).toContain("duplicate-edge-id");
    expect(codes).toContain("dangling-edge-target");
    expect(codes).toContain("dangling-edge-source");
    expect(codes).toContain("isolated-node");
    expect(codes).toContain("long-node-text");
    expect(codes).toContain("hidden-edge");
  });
});
