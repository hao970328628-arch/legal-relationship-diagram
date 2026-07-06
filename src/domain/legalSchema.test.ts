import { describe, expect, it } from "vitest";
import { deriveEdgeStyle } from "./legalSchema";
import type { DiagramEdge } from "./types";

describe("deriveEdgeStyle", () => {
  it("derives disputed ownership claims as dashed purple lines", () => {
    const edge: DiagramEdge = {
      id: "edge-1",
      from: "a",
      to: "b",
      relationKind: "ownership-claim",
      legalStatus: "disputed",
    };

    expect(deriveEdgeStyle(edge)).toMatchObject({
      stroke: "#7C3AED",
      dashed: true,
      strokeWidth: 2.3,
    });
  });

  it("keeps manual stroke, width, and dashed overrides", () => {
    const edge: DiagramEdge = {
      id: "edge-2",
      from: "a",
      to: "b",
      relationKind: "contract",
      legalStatus: "confirmed",
      stroke: "#111111",
      strokeWidth: 5,
      dashed: true,
    };

    expect(deriveEdgeStyle(edge)).toMatchObject({
      stroke: "#111111",
      dashed: true,
      strokeWidth: 5,
    });
  });
});
