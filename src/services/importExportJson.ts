import type {
  AnchorSide,
  DiagramData,
  DiagramEdge,
  DiagramNode,
  DiagramProject,
  DiagramType,
  LegendItem,
  LegalRelationKind,
  LegalStatus,
  NodeKind,
  PagePreset,
  Point,
} from "../domain/types";

export const CURRENT_SCHEMA_VERSION = 1;

const fallbackCanvas = {
  width: 2200,
  height: 1600,
  pagePreset: "custom" as PagePreset,
};

export function cloneDiagramData(data: DiagramData): DiagramData {
  return JSON.parse(JSON.stringify(data)) as DiagramData;
}

export function cloneDiagramProject(project: DiagramProject): DiagramProject {
  return JSON.parse(JSON.stringify(project)) as DiagramProject;
}

function normalizeKind(value: unknown): NodeKind {
  if (value === "party" || value === "subject") return "subject";
  if (value === "asset" || value === "object") return "object";
  if (
    value === "dispute" ||
    value === "case" ||
    value === "evidence" ||
    value === "note"
  ) {
    return value;
  }
  return "note";
}

function normalizeDiagramType(value: unknown): DiagramType {
  if (
    value === "legal-relationship" ||
    value === "transaction" ||
    value === "case-path" ||
    value === "dispute" ||
    value === "evidence-chain"
  ) {
    return value;
  }
  return "legal-relationship";
}

function normalizeRelationKind(value: unknown): LegalRelationKind | undefined {
  if (
    value === "contract" ||
    value === "ownership-claim" ||
    value === "warehouse" ||
    value === "payment" ||
    value === "guarantee" ||
    value === "tort" ||
    value === "dispute" ||
    value === "procedure" ||
    value === "evidence" ||
    value === "risk"
  ) {
    return value;
  }
  return undefined;
}

function normalizeLegalStatus(value: unknown): LegalStatus | undefined {
  if (
    value === "confirmed" ||
    value === "claimed" ||
    value === "disputed" ||
    value === "pending" ||
    value === "invalidated"
  ) {
    return value;
  }
  return undefined;
}

function normalizePagePreset(value: unknown): PagePreset {
  if (value === "A4" || value === "A3" || value === "16:9" || value === "custom") {
    return value;
  }
  return "custom";
}

function normalizeAnchorSide(value: unknown): AnchorSide | undefined {
  if (
    value === "top" ||
    value === "right" ||
    value === "bottom" ||
    value === "left" ||
    value === "center"
  ) {
    return value;
  }
  return undefined;
}

function numberOr(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function stringOrUndefined(value: unknown): string | undefined {
  return value === undefined || value === null ? undefined : String(value);
}

function normalizePoint(value: unknown): Point | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const x = Number(record.x);
  const y = Number(record.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x, y };
}

export function normalizeDiagramData(input: unknown): DiagramData {
  if (!input || typeof input !== "object") {
    throw new Error("JSON 根对象无效");
  }

  const record = input as Record<string, unknown>;
  if (!Array.isArray(record.nodes) || !Array.isArray(record.edges)) {
    throw new Error("JSON 必须包含 nodes 和 edges 数组");
  }

  const nodes = record.nodes.map((raw, index): DiagramNode => {
    const node = raw as Record<string, unknown>;
    const id = String(node.id ?? `node-${index}`);
    return {
      id,
      type: normalizeKind(node.type ?? node.kind),
      x: numberOr(node.x, 0),
      y: numberOr(node.y, 0),
      width: numberOr(node.width ?? node.w, 220),
      height: numberOr(node.height ?? node.h, 90),
      text: String(node.text ?? id),
      titleFontSize:
        node.titleFontSize === undefined ? undefined : numberOr(node.titleFontSize, 18),
      bodyFontSize:
        node.bodyFontSize === undefined ? undefined : numberOr(node.bodyFontSize, 16),
      textAlign: node.textAlign === "left" ? "left" : "center",
      boldTitle: node.boldTitle === undefined ? undefined : Boolean(node.boldTitle),
      role: stringOrUndefined(node.role),
      note: stringOrUndefined(node.note),
      locked: node.locked === undefined ? undefined : Boolean(node.locked),
      visible: node.visible === undefined ? undefined : Boolean(node.visible),
    };
  });

  const edges = record.edges.map((raw, index): DiagramEdge => {
    const edge = raw as Record<string, unknown>;
    const labelPositionRaw = edge.labelPosition as Record<string, unknown> | undefined;
    const points = Array.isArray(edge.points)
      ? edge.points.map(normalizePoint).filter((point): point is Point => Boolean(point))
      : undefined;
    const waypoints = Array.isArray(edge.waypoints)
      ? edge.waypoints.map(normalizePoint).filter((point): point is Point => Boolean(point))
      : undefined;
    const visible =
      edge.visible === undefined && edge.opacity === 0 ? false : edge.visible;

    return {
      id: String(edge.id ?? `edge-${index}`),
      from: stringOrUndefined(edge.from),
      to: stringOrUndefined(edge.to),
      fromSide: normalizeAnchorSide(edge.fromSide),
      toSide: normalizeAnchorSide(edge.toSide),
      points,
      path: stringOrUndefined(edge.path),
      waypoints,
      dashed: edge.dashed === undefined ? undefined : Boolean(edge.dashed),
      label: stringOrUndefined(edge.label),
      labelX: edge.labelX === undefined ? undefined : numberOr(edge.labelX, 0),
      labelY: edge.labelY === undefined ? undefined : numberOr(edge.labelY, 0),
      labelW: edge.labelW === undefined ? undefined : numberOr(edge.labelW, 180),
      labelH: edge.labelH === undefined ? undefined : numberOr(edge.labelH, 34),
      labelPosition: labelPositionRaw
        ? {
            x: numberOr(labelPositionRaw.x, 0),
            y: numberOr(labelPositionRaw.y, 0),
            width:
              labelPositionRaw.width === undefined
                ? undefined
                : numberOr(labelPositionRaw.width, 180),
          }
        : undefined,
      labelMaxWidth:
        edge.labelMaxWidth === undefined ? undefined : numberOr(edge.labelMaxWidth, 160),
      opacity: edge.opacity === undefined ? undefined : numberOr(edge.opacity, 0.85),
      stroke: stringOrUndefined(edge.stroke),
      strokeWidth:
        edge.strokeWidth === undefined ? undefined : numberOr(edge.strokeWidth, 1.9),
      marker: edge.marker === undefined ? undefined : Boolean(edge.marker),
      relationKind: normalizeRelationKind(edge.relationKind),
      legalStatus: normalizeLegalStatus(edge.legalStatus),
      basis: stringOrUndefined(edge.basis),
      amount: stringOrUndefined(edge.amount),
      date: stringOrUndefined(edge.date),
      sourceDocument: stringOrUndefined(edge.sourceDocument),
      visible: visible === undefined ? undefined : Boolean(visible),
      editorOnly: edge.editorOnly === undefined ? undefined : Boolean(edge.editorOnly),
    };
  });

  const sections = Array.isArray(record.sections)
    ? record.sections.map((raw, index) => {
        const section = raw as Record<string, unknown>;
        return {
          id: String(section.id ?? `section-${index}`),
          title: String(section.title ?? ""),
          x: numberOr(section.x, 0),
          y: numberOr(section.y, 0),
          width: numberOr(section.width ?? section.w, 300),
          height: numberOr(section.height ?? section.h, 160),
        };
      })
    : [];

  const timelineItems = Array.isArray(record.timelineItems)
    ? record.timelineItems.map((raw) => {
        const item = raw as Record<string, unknown>;
        return {
          date: String(item.date ?? ""),
          event: String(item.event ?? ""),
        };
      })
    : [];

  const legendItems = Array.isArray(record.legendItems)
    ? record.legendItems.map((raw, index): LegendItem => {
        const item = raw as Record<string, unknown>;
        const kind = item.kind;
        return {
          id: String(item.id ?? `legend-${index}`),
          label: String(item.label ?? ""),
          kind:
            kind === "label" || kind === "solid" || kind === "dashed"
              ? kind
              : normalizeKind(kind),
        };
      })
    : [];

  return { nodes, edges, sections, timelineItems, legendItems };
}

export function normalizeDiagramProject(input: unknown): DiagramProject {
  if (!input || typeof input !== "object") {
    throw new Error("JSON 根对象无效");
  }

  const record = input as Record<string, unknown>;
  const hasProjectEnvelope = Boolean(record.data && typeof record.data === "object");
  const now = new Date().toISOString();
  const data = normalizeDiagramData(hasProjectEnvelope ? record.data : input);
  const canvasRaw =
    hasProjectEnvelope && record.canvas && typeof record.canvas === "object"
      ? (record.canvas as Record<string, unknown>)
      : {};

  return {
    id: String(record.id ?? `project-${Date.now()}`),
    title: String(record.title ?? "未命名法律关系图"),
    description: stringOrUndefined(record.description),
    diagramType: normalizeDiagramType(record.diagramType),
    canvas: {
      width: numberOr(canvasRaw.width, fallbackCanvas.width),
      height: numberOr(canvasRaw.height, fallbackCanvas.height),
      pagePreset: normalizePagePreset(canvasRaw.pagePreset),
    },
    data,
    createdAt: String(record.createdAt ?? now),
    updatedAt: String(record.updatedAt ?? now),
    schemaVersion: numberOr(record.schemaVersion, CURRENT_SCHEMA_VERSION),
  };
}

export function projectFileBaseName(title: string): string {
  const cleaned = title
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || "legal-diagram";
}
