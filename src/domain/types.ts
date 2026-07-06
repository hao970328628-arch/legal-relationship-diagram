export type NodeKind = "subject" | "object" | "dispute" | "case" | "evidence" | "note";
export type AnchorSide = "top" | "right" | "bottom" | "left" | "center";
export type DiagramType =
  | "legal-relationship"
  | "transaction"
  | "case-path"
  | "dispute"
  | "evidence-chain";
export type PagePreset = "A4" | "A3" | "16:9" | "custom";

export type LegalRelationKind =
  | "contract"
  | "ownership-claim"
  | "warehouse"
  | "payment"
  | "guarantee"
  | "tort"
  | "dispute"
  | "procedure"
  | "evidence"
  | "risk";

export type LegalStatus =
  | "confirmed"
  | "claimed"
  | "disputed"
  | "pending"
  | "invalidated";

export type Point = { x: number; y: number };

export type DiagramCanvasConfig = {
  width: number;
  height: number;
  pagePreset?: PagePreset;
};

export type DiagramSectionData = {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DiagramNode = {
  id: string;
  type: NodeKind;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  titleFontSize?: number;
  bodyFontSize?: number;
  textAlign?: "center" | "left";
  boldTitle?: boolean;
  role?: string;
  note?: string;
  locked?: boolean;
  visible?: boolean;
};

export type DiagramEdge = {
  id: string;
  from?: string;
  to?: string;
  fromSide?: AnchorSide;
  toSide?: AnchorSide;
  points?: Point[];
  path?: string;
  waypoints?: Point[];
  dashed?: boolean;
  label?: string;
  labelX?: number;
  labelY?: number;
  labelW?: number;
  labelH?: number;
  labelPosition?: {
    x: number;
    y: number;
    width?: number;
  };
  labelMaxWidth?: number;
  opacity?: number;
  stroke?: string;
  strokeWidth?: number;
  marker?: boolean;
  relationKind?: LegalRelationKind;
  legalStatus?: LegalStatus;
  basis?: string;
  amount?: string;
  date?: string;
  sourceDocument?: string;
  visible?: boolean;
  editorOnly?: boolean;
};

export type TimelineItem = {
  date: string;
  event: string;
};

export type LegendItem = {
  id: string;
  label: string;
  kind: NodeKind | "label" | "solid" | "dashed";
};

export type DiagramData = {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  sections: DiagramSectionData[];
  timelineItems: TimelineItem[];
  legendItems: LegendItem[];
};

export type DiagramProject = {
  id: string;
  title: string;
  description?: string;
  diagramType: DiagramType;
  canvas: DiagramCanvasConfig;
  data: DiagramData;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
};

export type ValidationSeverity = "error" | "warning" | "info";

export type ValidationIssue = {
  id: string;
  code: string;
  severity: ValidationSeverity;
  title: string;
  message: string;
  targetType?: "project" | "node" | "edge";
  targetId?: string;
};
