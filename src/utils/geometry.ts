import type { AnchorSide, DiagramEdge, DiagramNode, Point } from "../domain/types";

export function anchor(node: DiagramNode, side: AnchorSide = "center"): Point {
  switch (side) {
    case "top":
      return { x: node.x + node.width / 2, y: node.y };
    case "right":
      return { x: node.x + node.width, y: node.y + node.height / 2 };
    case "bottom":
      return { x: node.x + node.width / 2, y: node.y + node.height };
    case "left":
      return { x: node.x, y: node.y + node.height / 2 };
    case "center":
    default:
      return { x: node.x + node.width / 2, y: node.y + node.height / 2 };
  }
}

export function edgePoints(edge: DiagramEdge, nodeMap: Map<string, DiagramNode>): Point[] {
  if (edge.points?.length) return edge.points;
  if (!edge.from || !edge.to) return [];
  const from = nodeMap.get(edge.from);
  const to = nodeMap.get(edge.to);
  if (!from || !to) return [];
  const fromPoint = anchor(from, edge.fromSide);
  const toPoint = anchor(to, edge.toSide);
  if (edge.waypoints?.length) return [fromPoint, ...edge.waypoints, toPoint];
  return [fromPoint, toPoint];
}

export function makePath(points: Point[]): string {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

export function parseSimplePath(path?: string): Point[] {
  if (!path?.trim()) return [];
  const matches = path.matchAll(/[ML]\s*(-?\d+(?:\.\d+)?)\s*,?\s*(-?\d+(?:\.\d+)?)/gi);
  return Array.from(matches).map((match) => ({
    x: Number(match[1]),
    y: Number(match[2]),
  }));
}
