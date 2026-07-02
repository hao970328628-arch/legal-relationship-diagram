import React, { useEffect, useMemo, useRef, useState } from "react";

type NodeKind = "subject" | "object" | "dispute" | "case" | "note";
type AnchorSide = "top" | "right" | "bottom" | "left" | "center";
type Point = { x: number; y: number };

type DiagramSectionData = {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type DiagramNode = {
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
};

type DiagramEdge = {
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
};

type TimelineItem = {
  date: string;
  event: string;
};

type LegendItem = {
  id: string;
  label: string;
  kind: NodeKind | "label" | "solid" | "dashed";
};

type DiagramData = {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  sections: DiagramSectionData[];
  timelineItems: TimelineItem[];
  legendItems: LegendItem[];
};

type Selection =
  | { type: "node"; id: string }
  | { type: "edge"; id: string }
  | null;

type DragState =
  | {
      type: "node";
      id: string;
      offsetX: number;
      offsetY: number;
      originalData: DiagramData;
    }
  | {
      type: "label";
      id: string;
      offsetX: number;
      offsetY: number;
      originalData: DiagramData;
    }
  | {
      type: "edgePoint";
      id: string;
      pointIndex: number;
      offsetX: number;
      offsetY: number;
      originalPoints: Point[];
      originalData: DiagramData;
    }
  | {
      type: "labelResize";
      id: string;
      startX: number;
      startY: number;
      startWidth: number;
      startHeight: number;
      originalData: DiagramData;
    };

type RenderedEdge = DiagramEdge & { renderedPath: string; editablePoints: Point[] };

const CANVAS = {
  width: 2200,
  height: 1600,
};

const LOCAL_STORAGE_KEY = "legal-relationship-diagram-data";
const GRID_SIZE = 20;
const ALIGN_TOLERANCE = 12;

const fontFamily =
  "Microsoft YaHei, PingFang SC, Noto Sans CJK SC, sans-serif";

const styleMap = {
  page: {
    background: "#EAF0F7",
    text: "#1F2937",
    mutedText: "#4B5563",
  },
  section: {
    fill: "#F6F8FC",
    stroke: "#D8DFEA",
  },
  subject: {
    fill: "#F4F7FF",
    stroke: "#4B63FF",
  },
  object: {
    fill: "#FFF4CF",
    stroke: "#D99A00",
  },
  dispute: {
    fill: "#FFF0F0",
    stroke: "#FF3B30",
  },
  case: {
    fill: "#F0FFF8",
    stroke: "#00A86B",
  },
  label: {
    fill: "#F4D8FF",
    stroke: "transparent",
  },
  note: {
    fill: "#FFFFFF",
    stroke: "#C8D1DE",
  },
  edge: {
    stroke: "#8A96A8",
  },
  selected: {
    stroke: "#2563EB",
    fill: "rgba(37, 99, 235, 0.08)",
  },
};

const lineColorOptions = [
  { label: "默认灰", value: "#8A96A8" },
  { label: "蓝色强调", value: "#2563EB" },
  { label: "红色风险", value: "#FF3B30" },
  { label: "紫色争议", value: "#7C3AED" },
  { label: "绿色程序", value: "#00A86B" },
  { label: "橙色提示", value: "#D99A00" },
];

const defaultSections: DiagramSectionData[] = [
  { id: "base", title: "一、基础法律关系", x: 40, y: 40, width: 2120, height: 520 },
  { id: "disputes", title: "二、核心争议事实", x: 40, y: 600, width: 2120, height: 330 },
  { id: "cases", title: "三、案件路径", x: 40, y: 970, width: 2120, height: 210 },
  { id: "appendix", title: "四、关键时间线 + 图例", x: 40, y: 1220, width: 2120, height: 330 },
];

const defaultNodes: DiagramNode[] = [
  {
    id: "heLiangFurun",
    type: "subject",
    x: 90,
    y: 130,
    width: 300,
    height: 90,
    text: "贺亮 / 福润公司\n实控人及关联责任主体",
  },
  {
    id: "nongtou",
    type: "subject",
    x: 90,
    y: 390,
    width: 300,
    height: 90,
    text: "农投启润公司\n3号仓玉米权利主张方",
  },
  {
    id: "huahe",
    type: "subject",
    x: 500,
    y: 250,
    width: 360,
    height: 130,
    text: "华贺公司\n出租方 / 库房及作业方\n涉嫌重复确权或处分风险方",
  },
  {
    id: "supplier",
    type: "subject",
    x: 980,
    y: 80,
    width: 300,
    height: 80,
    text: "上游供应商\n严格数字农业 / 严格粮业",
  },
  {
    id: "shounong",
    type: "subject",
    x: 940,
    y: 220,
    width: 380,
    height: 120,
    text: "上海首农\n采购人 / 承租人 / 货权主张人\n下游销售方",
    titleFontSize: 19,
  },
  {
    id: "tianweikang",
    type: "subject",
    x: 760,
    y: 430,
    width: 240,
    height: 85,
    text: "天维康\n第三方监管",
  },
  {
    id: "warehouse",
    type: "object",
    x: 1060,
    y: 420,
    width: 340,
    height: 110,
    text: "华贺库\n1#、2#、3#仓\n涉案货物实际存放地",
  },
  {
    id: "wuhan",
    type: "subject",
    x: 1660,
    y: 270,
    width: 380,
    height: 120,
    text: "武汉长江国际\n双重身份：\n下游买方 + 另行货权主张方",
    titleFontSize: 19,
  },
  {
    id: "core",
    type: "dispute",
    x: 690,
    y: 625,
    width: 820,
    height: 120,
    text:
      "核心矛盾\n上海首农采购并入库的粮食，在华贺库内发生库存短缺；\n同时，华贺向农投启润、武汉长江国际形成相冲突的权利确认或权利主张。",
    titleFontSize: 20,
    bodyFontSize: 16,
  },
  {
    id: "dispute3",
    type: "dispute",
    x: 80,
    y: 780,
    width: 460,
    height: 130,
    text:
      "争议一：3号仓玉米\n农投依据华贺确认及调解书申请执行\n道里法院执行6724.4吨\n上海首农主张该货物属其采购库存",
    bodyFontSize: 15,
  },
  {
    id: "disputeShortage",
    type: "dispute",
    x: 600,
    y: 780,
    width: 460,
    height: 130,
    text:
      "争议三：剩余库存短缺\n2024.10目测短缺\n后续发现大豆差距较大\n华贺承认短缺并愿意赔偿",
    bodyFontSize: 15,
  },
  {
    id: "disputeWuhan",
    type: "dispute",
    x: 1120,
    y: 780,
    width: 460,
    height: 130,
    text:
      "争议二：1-2、2-1仓货物\n武汉依据与华贺仓储协议主张货权\n阻挠上海首农移库并报警\n上海首农主张系其库存 / 移库对象",
    bodyFontSize: 15,
  },
  {
    id: "warehouseTable",
    type: "dispute",
    x: 1640,
    y: 780,
    width: 460,
    height: 130,
    text:
      "争议货物分仓提示\n3号仓：农投执行风险\n1-2、2-1仓：武汉货权主张\n2-3仓：大豆短缺风险\n其他仓：短缺原因待查",
    bodyFontSize: 15,
  },
  {
    id: "case1",
    type: "case",
    x: 80,
    y: 1025,
    width: 360,
    height: 120,
    text: "2025.10\n3号仓执行救济\n执行异议 / 第三人撤销 / 再审\n状态：待裁定是否再审",
    bodyFontSize: 15,
  },
  {
    id: "case2",
    type: "case",
    x: 500,
    y: 1025,
    width: 360,
    height: 120,
    text:
      "2025.10\n诉华贺租赁合同纠纷\n确权 + 7359万元赔偿\n状态：赔偿未获支持，二审 / 调解中",
    bodyFontSize: 15,
  },
  {
    id: "case3",
    type: "case",
    x: 920,
    y: 1025,
    width: 360,
    height: 120,
    text:
      "2025.10 / 2026.01\n刑事控告\n盗窃 / 合同诈骗方向\n状态：盗窃不予立案，后续考虑合同诈骗",
    bodyFontSize: 15,
  },
  {
    id: "case4",
    type: "case",
    x: 1340,
    y: 1025,
    width: 360,
    height: 120,
    text:
      "2025.11\n诉武汉买卖合同纠纷\n解除合同、扣保证金、追究违约\n状态：2026.7普陀法院开庭",
    bodyFontSize: 15,
  },
  {
    id: "case5",
    type: "case",
    x: 1760,
    y: 1025,
    width: 360,
    height: 120,
    text:
      "2025.12\n武汉侵权案\n武汉诉华贺、上海首农、贺亮等\n状态：2026.6中止审理",
    bodyFontSize: 15,
  },
];

const defaultEdges: DiagramEdge[] = [
  {
    id: "supplier-shounong",
    from: "supplier",
    fromSide: "bottom",
    to: "shounong",
    toSide: "top",
    label: "采购合同 / 交货入库",
    labelPosition: { x: 1028, y: 172, width: 208 },
    labelW: 205,
    labelH: 34,
    opacity: 0.85,
  },
  {
    id: "shounong-huahe",
    points: [
      { x: 940, y: 280 },
      { x: 900, y: 280 },
      { x: 860, y: 315 },
    ],
    opacity: 0.85,
  },
  {
    id: "huahe-warehouse",
    points: [
      { x: 860, y: 350 },
      { x: 980, y: 350 },
      { x: 980, y: 475 },
      { x: 1060, y: 475 },
    ],
    label: "提供库房及入库作业",
    labelPosition: { x: 885, y: 358, width: 220 },
    labelW: 205,
    labelH: 34,
    opacity: 0.85,
  },
  {
    id: "tianweikang-warehouse",
    from: "tianweikang",
    fromSide: "right",
    to: "warehouse",
    toSide: "left",
    opacity: 0.85,
  },
  {
    id: "shounong-warehouse",
    points: [
      { x: 1170, y: 340 },
      { x: 1170, y: 385 },
      { x: 1230, y: 420 },
    ],
    opacity: 0.45,
  },
  {
    id: "shounong-wuhan",
    points: [
      { x: 1320, y: 280 },
      { x: 1505, y: 280 },
      { x: 1505, y: 330 },
      { x: 1660, y: 330 },
    ],
    label: "销售合同 / 保证金 / 部分转货权",
    labelPosition: { x: 1368, y: 236, width: 310 },
    labelW: 300,
    labelH: 36,
    opacity: 0.85,
  },
  {
    id: "he-huahe",
    points: [
      { x: 390, y: 175 },
      { x: 450, y: 175 },
      { x: 450, y: 315 },
      { x: 500, y: 315 },
    ],
    dashed: true,
    opacity: 0.45,
  },
  {
    id: "huahe-nongtou",
    points: [
      { x: 500, y: 335 },
      { x: 450, y: 335 },
      { x: 450, y: 435 },
      { x: 390, y: 435 },
    ],
    dashed: true,
    label: "确认3号仓玉米归属",
    labelPosition: { x: 315, y: 356, width: 220 },
    labelW: 210,
    labelH: 34,
    opacity: 0.85,
  },
  {
    id: "huahe-wuhan",
    points: [
      { x: 680, y: 380 },
      { x: 680, y: 545 },
      { x: 1510, y: 545 },
      { x: 1510, y: 390 },
      { x: 1660, y: 345 },
    ],
    dashed: true,
    label: "另行仓储协议主张",
    labelPosition: { x: 770, y: 532, width: 220 },
    labelW: 200,
    labelH: 34,
    opacity: 0.85,
  },
  {
    id: "huahe-core",
    points: [
      { x: 660, y: 380 },
      { x: 660, y: 570 },
      { x: 770, y: 625 },
    ],
    dashed: true,
    label: "重复确权 / 处分风险",
    labelPosition: { x: 500, y: 548, width: 220 },
    labelW: 210,
    labelH: 34,
    opacity: 0.85,
  },
  {
    id: "warehouse-core",
    points: [
      { x: 1230, y: 530 },
      { x: 1230, y: 585 },
      { x: 1170, y: 625 },
    ],
    opacity: 0.55,
  },
  {
    id: "wuhan-core",
    points: [
      { x: 1660, y: 365 },
      { x: 1600, y: 535 },
      { x: 1410, y: 625 },
    ],
    dashed: true,
    marker: false,
    opacity: 0,
  },
  {
    id: "core-dispute3",
    points: [
      { x: 805, y: 745 },
      { x: 310, y: 780 },
    ],
    opacity: 0.5,
  },
  {
    id: "core-shortage",
    points: [
      { x: 930, y: 745 },
      { x: 830, y: 780 },
    ],
    opacity: 0.6,
  },
  {
    id: "core-wuhan-dispute",
    points: [
      { x: 1270, y: 745 },
      { x: 1350, y: 780 },
    ],
    opacity: 0.6,
  },
  {
    id: "core-warehouse-table",
    points: [
      { x: 1400, y: 745 },
      { x: 1870, y: 780 },
    ],
    opacity: 0.5,
  },
  {
    id: "nongtou-dispute3",
    points: [
      { x: 240, y: 480 },
      { x: 240, y: 700 },
      { x: 240, y: 780 },
    ],
    dashed: true,
    opacity: 0.38,
  },
  {
    id: "wuhan-dispute",
    points: [
      { x: 1850, y: 390 },
      { x: 1850, y: 585 },
      { x: 1350, y: 710 },
      { x: 1350, y: 780 },
    ],
    dashed: true,
    marker: false,
    opacity: 0,
  },
  {
    id: "dispute3-case1",
    points: [
      { x: 310, y: 910 },
      { x: 310, y: 982 },
      { x: 260, y: 982 },
      { x: 260, y: 1025 },
    ],
    opacity: 0.65,
  },
  {
    id: "shortage-case2",
    points: [
      { x: 755, y: 910 },
      { x: 680, y: 985 },
      { x: 680, y: 1025 },
    ],
    opacity: 0.65,
  },
  {
    id: "shortage-case3",
    points: [
      { x: 905, y: 910 },
      { x: 1100, y: 985 },
      { x: 1100, y: 1025 },
    ],
    opacity: 0.55,
  },
  {
    id: "wuhan-dispute-case5",
    points: [
      { x: 1350, y: 910 },
      { x: 1350, y: 968 },
      { x: 1520, y: 968 },
      { x: 1520, y: 1025 },
    ],
    opacity: 0.55,
  },
  {
    id: "warehouse-table-case4",
    points: [
      { x: 1870, y: 910 },
      { x: 1870, y: 968 },
      { x: 1940, y: 968 },
      { x: 1940, y: 1025 },
    ],
    opacity: 0.55,
  },
];

const defaultTimelineItems: TimelineItem[] = [
  { date: "2023.10", event: "租赁协议" },
  { date: "2024.1/3", event: "采购合同" },
  { date: "2024.1-9", event: "货物入库" },
  { date: "2024.10", event: "发现短缺" },
  { date: "2025.10", event: "执行 / 移库受阻\n起诉华贺" },
  { date: "2025.11", event: "诉武汉" },
  { date: "2025.12", event: "武汉侵权案" },
  { date: "2026.4-6", event: "一审 / 再审 / 中止" },
];

const defaultLegendItems: LegendItem[] = [
  { id: "subject", label: "蓝色框：交易主体 / 权利主张主体", kind: "subject" },
  { id: "object", label: "黄色框：库房 / 货物 / 标的物", kind: "object" },
  { id: "dispute", label: "红色框：争议事实 / 风险事件", kind: "dispute" },
  { id: "case", label: "绿色框：诉讼或程序路径", kind: "case" },
  { id: "label", label: "紫色标签：合同 / 协议 / 程序动作", kind: "label" },
  { id: "solid", label: "实线箭头：合同、交易或已发生事实", kind: "solid" },
  { id: "dashed", label: "虚线箭头：争议主张或待确认关系", kind: "dashed" },
];

const defaultDiagramData: DiagramData = {
  nodes: defaultNodes,
  edges: defaultEdges,
  sections: defaultSections,
  timelineItems: defaultTimelineItems,
  legendItems: defaultLegendItems,
};

function cloneDiagramData(data: DiagramData): DiagramData {
  return JSON.parse(JSON.stringify(data)) as DiagramData;
}

function normalizeKind(value: unknown): NodeKind {
  if (value === "party" || value === "subject") return "subject";
  if (value === "asset" || value === "object") return "object";
  if (value === "dispute" || value === "case" || value === "note") return value;
  return "note";
}

function numberOr(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizePoint(value: unknown): Point | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const x = Number(record.x);
  const y = Number(record.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x, y };
}

function normalizeDiagramData(input: unknown): DiagramData {
  if (!input || typeof input !== "object") {
    throw new Error("JSON 根对象无效");
  }

  const record = input as Record<string, unknown>;
  if (!Array.isArray(record.nodes) || !Array.isArray(record.edges)) {
    throw new Error("JSON 必须包含 nodes 和 edges 数组");
  }

  const nodes = record.nodes.map((raw, index) => {
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
    } satisfies DiagramNode;
  });

  const edges = record.edges.map((raw, index) => {
    const edge = raw as Record<string, unknown>;
    const labelPositionRaw = edge.labelPosition as Record<string, unknown> | undefined;
    const points = Array.isArray(edge.points)
      ? edge.points.map(normalizePoint).filter((point): point is Point => Boolean(point))
      : undefined;
    const waypoints = Array.isArray(edge.waypoints)
      ? edge.waypoints.map(normalizePoint).filter((point): point is Point => Boolean(point))
      : undefined;

    return {
      id: String(edge.id ?? `edge-${index}`),
      from: edge.from === undefined ? undefined : String(edge.from),
      to: edge.to === undefined ? undefined : String(edge.to),
      fromSide: normalizeAnchorSide(edge.fromSide),
      toSide: normalizeAnchorSide(edge.toSide),
      points,
      path: edge.path === undefined ? undefined : String(edge.path),
      waypoints,
      dashed: Boolean(edge.dashed),
      label: edge.label === undefined ? undefined : String(edge.label),
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
      stroke: edge.stroke === undefined ? undefined : String(edge.stroke),
      strokeWidth: edge.strokeWidth === undefined ? undefined : numberOr(edge.strokeWidth, 1.9),
      marker: edge.marker === undefined ? undefined : Boolean(edge.marker),
    } satisfies DiagramEdge;
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
        } satisfies DiagramSectionData;
      })
    : cloneDiagramData(defaultDiagramData).sections;

  const timelineItems = Array.isArray(record.timelineItems)
    ? record.timelineItems.map((raw) => {
        const item = raw as Record<string, unknown>;
        return {
          date: String(item.date ?? ""),
          event: String(item.event ?? ""),
        } satisfies TimelineItem;
      })
    : cloneDiagramData(defaultDiagramData).timelineItems;

  const legendItems = Array.isArray(record.legendItems)
    ? record.legendItems.map((raw, index) => {
        const item = raw as Record<string, unknown>;
        const kind = item.kind;
        return {
          id: String(item.id ?? `legend-${index}`),
          label: String(item.label ?? ""),
          kind:
            kind === "label" || kind === "solid" || kind === "dashed"
              ? kind
              : normalizeKind(kind),
        } satisfies LegendItem;
      })
    : cloneDiagramData(defaultDiagramData).legendItems;

  return { nodes, edges, sections, timelineItems, legendItems };
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

function getNodeStyle(kind: NodeKind | "label") {
  return styleMap[kind];
}

function anchor(node: DiagramNode, side: AnchorSide = "center"): Point {
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

function edgePoints(edge: DiagramEdge, nodeMap: Map<string, DiagramNode>): Point[] {
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

function makePath(points: Point[]): string {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function parseSimplePath(path?: string): Point[] {
  if (!path?.trim()) return [];
  const matches = path.matchAll(/[ML]\s*(-?\d+(?:\.\d+)?)\s*,?\s*(-?\d+(?:\.\d+)?)/gi);
  return Array.from(matches).map((match) => ({
    x: Number(match[1]),
    y: Number(match[2]),
  }));
}

function editableEdgePoints(edge: DiagramEdge, nodeMap: Map<string, DiagramNode>): Point[] {
  if (edge.points?.length) return edge.points;
  const pathPoints = parseSimplePath(edge.path);
  if (pathPoints.length) return pathPoints;
  return edgePoints(edge, nodeMap);
}

function getRenderedPath(edge: DiagramEdge, nodeMap: Map<string, DiagramNode>): string {
  if (edge.path?.trim()) return edge.path;
  return makePath(edgePoints(edge, nodeMap));
}

function estimateTextWidth(text: string, fontSize: number): number {
  return Array.from(text).reduce((sum, char) => {
    if (/[\u4e00-\u9fff]/.test(char)) return sum + fontSize;
    if (/[A-Z]/i.test(char)) return sum + fontSize * 0.58;
    if (/\d/.test(char)) return sum + fontSize * 0.56;
    if (/\s/.test(char)) return sum + fontSize * 0.34;
    return sum + fontSize * 0.5;
  }, 0);
}

function tokenizeLine(line: string): string[] {
  const protectedPattern =
    /\d{4}\.\d{1,2}(?:-\d{1,2})?|\d{4}\.\d{1,2}\s*\/\s*\d{4}\.\d{1,2}|\d+(?:\.\d+)?(?:万元|亿元|吨)|\d+-\d+(?:、\d+-\d+)?|[A-Za-z0-9#]+|./g;
  return line.match(protectedPattern) ?? [];
}

function wrapManualLine(line: string, maxWidth: number, fontSize: number): string[] {
  const trimmed = line.trim();
  if (!trimmed) return [""];
  if (estimateTextWidth(trimmed, fontSize) <= maxWidth) return [trimmed];

  const tokens = tokenizeLine(trimmed);
  const lines: string[] = [];
  let current = "";

  for (const token of tokens) {
    const candidate = current + token;
    if (current && estimateTextWidth(candidate, fontSize) > maxWidth) {
      lines.push(current.trim());
      current = token.trimStart();
    } else {
      current = candidate;
    }
  }

  if (current.trim()) lines.push(current.trim());
  return lines;
}

function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  return text
    .split("\n")
    .flatMap((line) => wrapManualLine(line, maxWidth, fontSize));
}

function snap(value: number, enabled: boolean): number {
  if (!enabled) return Math.round(value * 10) / 10;
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

function almostSame(a: number, b: number): boolean {
  return Math.abs(a - b) <= ALIGN_TOLERANCE;
}

function alignEdgePoint(
  points: Point[],
  originalPoints: Point[],
  index: number,
  point: Point,
  enabled: boolean,
): Point {
  if (!enabled) return point;

  const previous = points[index - 1];
  const next = points[index + 1];
  const original = originalPoints[index];
  const originalPrevious = originalPoints[index - 1];
  const originalNext = originalPoints[index + 1];
  const aligned = { ...point };

  if (previous && original && originalPrevious) {
    if (almostSame(original.x, originalPrevious.x)) aligned.x = previous.x;
    if (almostSame(original.y, originalPrevious.y)) aligned.y = previous.y;
  }

  if (next && original && originalNext) {
    if (almostSame(original.x, originalNext.x)) aligned.x = next.x;
    if (almostSame(original.y, originalNext.y)) aligned.y = next.y;
  }

  if (previous) {
    if (almostSame(aligned.x, previous.x)) aligned.x = previous.x;
    if (almostSame(aligned.y, previous.y)) aligned.y = previous.y;
  }

  if (next) {
    if (almostSame(aligned.x, next.x)) aligned.x = next.x;
    if (almostSame(aligned.y, next.y)) aligned.y = next.y;
  }

  return aligned;
}

function defaultLabelPosition(points: Point[]): { x: number; y: number; width: number } {
  if (points.length >= 2) {
    const index = Math.max(0, Math.floor((points.length - 2) / 2));
    const from = points[index];
    const to = points[index + 1];
    return {
      x: Math.round((from.x + to.x) / 2 - 90),
      y: Math.round((from.y + to.y) / 2 - 18),
      width: 180,
    };
  }

  return { x: 100, y: 100, width: 180 };
}

function changed(a: DiagramData, b: DiagramData): boolean {
  return JSON.stringify(a) !== JSON.stringify(b);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function serializeSvg(svg: SVGSVGElement) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.querySelectorAll("[data-editor-only='true']").forEach((element) => {
    element.remove();
  });
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  clone.setAttribute("width", String(CANVAS.width));
  clone.setAttribute("height", String(CANVAS.height));
  return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(
    clone,
  )}`;
}

function DiagramSection({ section }: { section: DiagramSectionData }) {
  return (
    <g>
      <rect
        x={section.x}
        y={section.y}
        width={section.width}
        height={section.height}
        rx={8}
        fill={styleMap.section.fill}
        stroke={styleMap.section.stroke}
        strokeWidth={1.5}
      />
      <text
        x={section.x + 28}
        y={section.y + 34}
        fontFamily={fontFamily}
        fontSize={20}
        fontWeight={700}
        fill={styleMap.page.text}
      >
        {section.title}
      </text>
    </g>
  );
}

function NodeText({ node }: { node: DiagramNode }) {
  const titleFontSize = Math.max(14, node.titleFontSize ?? 18);
  const bodyFontSize = Math.max(14, node.bodyFontSize ?? 16);
  const paddingX = node.textAlign === "left" ? 26 : 20;
  const maxWidth = node.width - paddingX * 2;

  const manualLines = node.text.split("\n");
  const visualLines = manualLines.flatMap((line, manualIndex) => {
    const fontSize = manualIndex === 0 ? titleFontSize : bodyFontSize;
    return wrapManualLine(line, maxWidth, fontSize).map((value) => ({
      text: value,
      manualIndex,
      fontSize,
    }));
  });

  const lineHeights = visualLines.map((line) => line.fontSize * 1.42);
  const totalHeight = lineHeights.reduce((sum, value) => sum + value, 0);
  const startY =
    node.y +
    Math.max(12, (node.height - totalHeight) / 2) +
    visualLines[0].fontSize * 0.95;
  const textX =
    node.textAlign === "left" ? node.x + paddingX : node.x + node.width / 2;

  return (
    <text
      x={textX}
      y={startY}
      textAnchor={node.textAlign === "left" ? "start" : "middle"}
      fontFamily={fontFamily}
      fill={styleMap.page.text}
      pointerEvents="none"
    >
      {visualLines.map((line, index) => {
        const currentDy = index === 0 ? 0 : lineHeights[index - 1];
        return (
          <tspan
            key={`${node.id}-line-${index}`}
            x={textX}
            dy={index === 0 ? 0 : currentDy}
            fontSize={line.fontSize}
            fontWeight={line.manualIndex === 0 && node.boldTitle !== false ? 700 : 500}
          >
            {line.text}
          </tspan>
        );
      })}
    </text>
  );
}

function NodeCard({
  node,
  selected,
  editable,
  onPointerDown,
}: {
  node: DiagramNode;
  selected: boolean;
  editable: boolean;
  onPointerDown: (event: React.PointerEvent<SVGGElement>) => void;
}) {
  const style = getNodeStyle(node.type);
  const isCore = node.id === "core";

  return (
    <g
      onPointerDown={editable ? onPointerDown : undefined}
      style={{ cursor: editable ? "move" : "default" }}
    >
      <rect
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        rx={8}
        fill={style.fill}
        stroke={selected ? styleMap.selected.stroke : style.stroke}
        strokeWidth={selected ? 3 : isCore ? 2.6 : node.type === "dispute" ? 2 : 1.6}
      />
      <NodeText node={node} />
      {selected && (
        <rect
          data-editor-only="true"
          x={node.x - 7}
          y={node.y - 7}
          width={node.width + 14}
          height={node.height + 14}
          rx={10}
          fill="none"
          stroke={styleMap.selected.stroke}
          strokeDasharray="7 5"
          strokeWidth={1.6}
          pointerEvents="none"
        />
      )}
    </g>
  );
}

function EdgePath({
  edge,
  path,
  selected,
  editable,
  onSelect,
}: {
  edge: DiagramEdge;
  path: string;
  selected: boolean;
  editable: boolean;
  onSelect: (event: React.PointerEvent<SVGPathElement>) => void;
}) {
  return (
    <g>
      {editable && path && (
        <path
          data-editor-only="true"
          d={path}
          fill="none"
          stroke="transparent"
          strokeWidth={16}
          strokeLinecap="round"
          strokeLinejoin="round"
          pointerEvents="stroke"
          onPointerDown={onSelect}
          style={{ cursor: "pointer" }}
        />
      )}
      <path
        d={path}
        fill="none"
        stroke={selected ? styleMap.selected.stroke : edge.stroke ?? styleMap.edge.stroke}
        strokeWidth={selected ? 3 : edge.strokeWidth ?? 1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={edge.dashed ? "7 7" : undefined}
        markerEnd={edge.marker === false ? undefined : "url(#arrow)"}
        opacity={edge.opacity ?? 0.85}
      />
    </g>
  );
}

function EdgeLabel({
  edge,
  selected,
  editable,
  onPointerDown,
  onResizePointerDown,
  onLabelTextChange,
}: {
  edge: DiagramEdge;
  selected: boolean;
  editable: boolean;
  onPointerDown: (event: React.PointerEvent<SVGGElement>) => void;
  onResizePointerDown: (event: React.PointerEvent<SVGRectElement>) => void;
  onLabelTextChange: (value: string) => void;
}) {
  const labelX = edge.labelPosition?.x ?? edge.labelX;
  const labelY = edge.labelPosition?.y ?? edge.labelY;

  if (!edge.label || labelX === undefined || labelY === undefined) {
    return null;
  }

  const fontSize = 14;
  const width = edge.labelPosition?.width ?? edge.labelW ?? 180;
  const height = edge.labelH ?? 34;
  const maxWidth = edge.labelMaxWidth ?? width - 20;
  const lines = wrapText(edge.label, maxWidth, fontSize);
  const lineHeight = fontSize * 1.35;
  const textY =
    labelY + height / 2 - (lines.length * lineHeight) / 2 + fontSize;

  return (
    <g style={{ cursor: editable ? "move" : "default" }}>
      <rect
        x={labelX - 2}
        y={labelY - 2}
        width={width + 4}
        height={height + 4}
        rx={7}
        fill="#FFFFFF"
        opacity={0.95}
        onPointerDown={editable ? onPointerDown : undefined}
      />
      <rect
        x={labelX}
        y={labelY}
        width={width}
        height={height}
        rx={6}
        fill={styleMap.label.fill}
        stroke={selected ? styleMap.selected.stroke : "#FFFFFF"}
        strokeWidth={selected ? 2.5 : 2}
        opacity={0.98}
        onPointerDown={editable ? onPointerDown : undefined}
      />
      {editable && selected ? (
        <>
          <foreignObject
            data-editor-only="true"
            x={labelX + 7}
            y={labelY + 5}
            width={Math.max(30, width - 14)}
            height={Math.max(22, height - 10)}
          >
            <textarea
              value={edge.label}
              onChange={(event) => onLabelTextChange(event.target.value)}
              onPointerDown={(event) => event.stopPropagation()}
              style={{
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
                border: "none",
                outline: "none",
                resize: "none",
                overflow: "hidden",
                background: "transparent",
                color: styleMap.page.text,
                fontFamily,
                fontSize,
                fontWeight: 700,
                textAlign: "center",
                lineHeight: 1.35,
              }}
            />
          </foreignObject>
          <rect
            data-editor-only="true"
            x={labelX + width - 9}
            y={labelY + height - 9}
            width={14}
            height={14}
            rx={3}
            fill="#FFFFFF"
            stroke="#7C3AED"
            strokeWidth={2}
            onPointerDown={onResizePointerDown}
            style={{ cursor: "nwse-resize" }}
          />
        </>
      ) : (
        <text
          x={labelX + width / 2}
          y={textY}
          textAnchor="middle"
          fontFamily={fontFamily}
          fontSize={fontSize}
          fontWeight={600}
          fill={styleMap.page.text}
          pointerEvents="none"
        >
          {lines.map((line, index) => (
            <tspan
              key={`${edge.id}-label-${index}`}
              x={labelX + width / 2}
              dy={index === 0 ? 0 : lineHeight}
            >
              {line}
            </tspan>
          ))}
        </text>
      )}
    </g>
  );
}

function EdgeControlPoints({
  edge,
  points,
  onPointPointerDown,
  onMidpointPointerDown,
}: {
  edge: DiagramEdge;
  points: Point[];
  onPointPointerDown: (
    edge: DiagramEdge,
    pointIndex: number,
    event: React.PointerEvent<SVGCircleElement>,
  ) => void;
  onMidpointPointerDown: (
    edge: DiagramEdge,
    insertAfterIndex: number,
    event: React.PointerEvent<SVGRectElement>,
  ) => void;
}) {
  if (points.length < 2) return null;

  return (
    <g data-editor-only="true">
      {points.slice(0, -1).map((point, index) => {
        const next = points[index + 1];
        const midX = (point.x + next.x) / 2;
        const midY = (point.y + next.y) / 2;

        return (
          <rect
            key={`${edge.id}-mid-${index}`}
            x={midX - 6}
            y={midY - 6}
            width={12}
            height={12}
            rx={3}
            fill="#FFFFFF"
            stroke="#7C3AED"
            strokeWidth={2}
            onPointerDown={(event) => onMidpointPointerDown(edge, index, event)}
            style={{ cursor: "copy" }}
          />
        );
      })}
      {points.map((point, index) => (
        <circle
          key={`${edge.id}-point-${index}`}
          cx={point.x}
          cy={point.y}
          r={8}
          fill="#FFFFFF"
          stroke="#2563EB"
          strokeWidth={2.5}
          onPointerDown={(event) => onPointPointerDown(edge, index, event)}
          style={{ cursor: "move" }}
        />
      ))}
    </g>
  );
}

function Timeline({ items }: { items: TimelineItem[] }) {
  const x = 80;
  const y = 1280;
  const w = 1350;
  const h = 170;
  const lineY = y + 88;
  const startX = x + 85;
  const step = (w - 170) / Math.max(1, items.length - 1);

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill="#FFFFFF"
        stroke={styleMap.note.stroke}
        strokeWidth={1.4}
      />
      <text
        x={x + 26}
        y={y + 34}
        fontFamily={fontFamily}
        fontSize={18}
        fontWeight={700}
        fill={styleMap.page.text}
      >
        关键时间线
      </text>
      <line
        x1={startX}
        x2={x + w - 85}
        y1={lineY}
        y2={lineY}
        stroke={styleMap.edge.stroke}
        strokeWidth={2}
        opacity={0.65}
      />
      {items.map((item, index) => {
        const cx = startX + index * step;
        const labelAbove = index % 2 === 1;
        const textY = labelAbove ? lineY - 46 : lineY + 34;
        const eventLines = item.event.split("\n");

        return (
          <g key={`${item.date}-${index}`}>
            <circle
              cx={cx}
              cy={lineY}
              r={7}
              fill="#FFFFFF"
              stroke={styleMap.edge.stroke}
              strokeWidth={2}
            />
            <text
              x={cx}
              y={textY}
              textAnchor="middle"
              fontFamily={fontFamily}
              fill={styleMap.page.text}
            >
              <tspan x={cx} fontSize={15} fontWeight={700}>
                {item.date}
              </tspan>
              {eventLines.map((line, lineIndex) => (
                <tspan
                  key={`${item.date}-${lineIndex}`}
                  x={cx}
                  dy={lineIndex === 0 ? 20 : 18}
                  fontSize={14}
                  fontWeight={500}
                >
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function LegendSwatch({ item }: { item: LegendItem }) {
  const x = 0;
  const y = 0;

  if (item.kind === "solid" || item.kind === "dashed") {
    return (
      <line
        x1={x}
        y1={y + 7}
        x2={x + 30}
        y2={y + 7}
        stroke={styleMap.edge.stroke}
        strokeWidth={2}
        strokeDasharray={item.kind === "dashed" ? "6 5" : undefined}
        markerEnd="url(#arrow-small)"
      />
    );
  }

  const style = item.kind === "label" ? styleMap.label : getNodeStyle(item.kind);

  return (
    <rect
      x={x}
      y={y}
      width={22}
      height={14}
      rx={3}
      fill={style.fill}
      stroke={style.stroke}
      strokeWidth={item.kind === "label" ? 0 : 1.3}
    />
  );
}

function Legend({ items }: { items: LegendItem[] }) {
  const x = 1500;
  const y = 1260;
  const w = 600;
  const h = 225;
  const rowStartY = y + 62;
  const rowGap = 22;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill="#FFFFFF"
        stroke={styleMap.note.stroke}
        strokeWidth={1.4}
      />
      <text
        x={x + 26}
        y={y + 36}
        fontFamily={fontFamily}
        fontSize={18}
        fontWeight={700}
        fill={styleMap.page.text}
      >
        图例
      </text>
      {items.map((item, index) => {
        const rowY = rowStartY + index * rowGap;
        return (
          <g key={item.id} transform={`translate(${x + 28}, ${rowY - 13})`}>
            <LegendSwatch item={item} />
            <text
              x={42}
              y={12}
              fontFamily={fontFamily}
              fontSize={14}
              fontWeight={500}
              fill={styleMap.page.text}
            >
              {item.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...buttonStyle,
        background: active ? "#E0E7FF" : "#FFFFFF",
        borderColor: active ? "#4B63FF" : "#CBD5E1",
        color: disabled ? "#94A3B8" : "#1F2937",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label style={fieldLabelStyle}>
      <span>{label}</span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(numberOr(event.target.value, 0))}
        style={inputStyle}
      />
    </label>
  );
}

function PropertyPanel({
  selectedNode,
  selectedEdge,
  renderedEdgePath,
  selectedEdgePoints,
  onNodeChange,
  onEdgeChange,
  onDeleteNode,
  onDeleteEdge,
}: {
  selectedNode?: DiagramNode;
  selectedEdge?: DiagramEdge;
  renderedEdgePath?: string;
  selectedEdgePoints?: Point[];
  onNodeChange: (id: string, patch: Partial<DiagramNode>) => void;
  onEdgeChange: (id: string, patch: Partial<DiagramEdge>) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
}) {
  if (!selectedNode && !selectedEdge) {
    return (
      <aside style={panelStyle}>
        <h2 style={panelTitleStyle}>属性面板</h2>
        <p style={panelHintStyle}>
          开启编辑模式后，点击节点、紫色标签或连线进行编辑。选中连线后，拖蓝色圆点改路径，拖紫色小方块新增折点。
        </p>
      </aside>
    );
  }

  if (selectedNode) {
    return (
      <aside style={panelStyle}>
        <h2 style={panelTitleStyle}>节点属性</h2>
        <label style={fieldLabelStyle}>
          <span>节点编号</span>
          <input value={selectedNode.id} readOnly style={readOnlyInputStyle} />
        </label>
        <label style={fieldLabelStyle}>
          <span>节点文字</span>
          <textarea
            value={selectedNode.text}
            onChange={(event) =>
              onNodeChange(selectedNode.id, { text: event.target.value })
            }
            rows={7}
            style={textareaStyle}
          />
        </label>
        <div style={twoColumnStyle}>
          <NumberInput
            label="横坐标"
            value={selectedNode.x}
            onChange={(value) => onNodeChange(selectedNode.id, { x: value })}
          />
          <NumberInput
            label="纵坐标"
            value={selectedNode.y}
            onChange={(value) => onNodeChange(selectedNode.id, { y: value })}
          />
          <NumberInput
            label="宽度"
            value={selectedNode.width}
            onChange={(value) => onNodeChange(selectedNode.id, { width: value })}
          />
          <NumberInput
            label="高度"
            value={selectedNode.height}
            onChange={(value) => onNodeChange(selectedNode.id, { height: value })}
          />
        </div>
        <label style={fieldLabelStyle}>
          <span>节点类型</span>
          <select
            value={selectedNode.type}
            onChange={(event) =>
              onNodeChange(selectedNode.id, { type: event.target.value as NodeKind })
            }
            style={inputStyle}
          >
            <option value="subject">主体 / 权利主张方</option>
            <option value="object">库房 / 货物 / 标的物</option>
            <option value="dispute">争议事实 / 风险事件</option>
            <option value="case">案件路径 / 程序</option>
            <option value="note">备注 / 附注</option>
          </select>
        </label>
        <label style={checkboxStyle}>
          <input
            type="checkbox"
            checked={selectedNode.boldTitle !== false}
            onChange={(event) =>
              onNodeChange(selectedNode.id, { boldTitle: event.target.checked })
            }
          />
          是否加粗标题
        </label>
        <button
          type="button"
          onClick={() => onDeleteNode(selectedNode.id)}
          style={dangerButtonStyle}
        >
          删除节点
        </button>
      </aside>
    );
  }

  const edge = selectedEdge as DiagramEdge;
  const fallbackLabelPosition = defaultLabelPosition(selectedEdgePoints ?? []);
  const labelPosition = edge.labelPosition ?? {
    x: edge.labelX ?? fallbackLabelPosition.x,
    y: edge.labelY ?? fallbackLabelPosition.y,
    width: edge.labelW ?? 180,
  };

  return (
    <aside style={panelStyle}>
      <h2 style={panelTitleStyle}>关系属性</h2>
      <label style={fieldLabelStyle}>
        <span>关系编号</span>
        <input value={edge.id} readOnly style={readOnlyInputStyle} />
      </label>
      <div style={twoColumnStyle}>
        <label style={fieldLabelStyle}>
          <span>起点节点</span>
          <input
            value={edge.from ?? ""}
            onChange={(event) =>
              onEdgeChange(edge.id, { from: event.target.value || undefined })
            }
            style={inputStyle}
          />
        </label>
        <label style={fieldLabelStyle}>
          <span>终点节点</span>
          <input
            value={edge.to ?? ""}
            onChange={(event) =>
              onEdgeChange(edge.id, { to: event.target.value || undefined })
            }
            style={inputStyle}
          />
        </label>
      </div>
      <label style={fieldLabelStyle}>
        <span>关系标签文字</span>
        <textarea
          value={edge.label ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            onEdgeChange(edge.id, {
              label: value || undefined,
              labelPosition:
                value && !edge.labelPosition && edge.labelX === undefined
                  ? fallbackLabelPosition
                  : edge.labelPosition,
              labelH: value && edge.labelH === undefined ? 44 : edge.labelH,
            });
          }}
          rows={4}
          style={textareaStyle}
        />
      </label>
      {!edge.label && (
        <button
          type="button"
          onClick={() =>
            onEdgeChange(edge.id, {
              label: "关系标签",
              labelPosition: fallbackLabelPosition,
              labelH: 44,
            })
          }
          style={{ ...buttonStyle, width: "100%", marginBottom: 12 }}
        >
          添加关系标签
        </button>
      )}
      <div style={twoColumnStyle}>
        <NumberInput
          label="标签横坐标"
          value={labelPosition.x}
          onChange={(value) =>
            onEdgeChange(edge.id, {
              labelPosition: { ...labelPosition, x: value },
            })
          }
        />
        <NumberInput
          label="标签纵坐标"
          value={labelPosition.y}
          onChange={(value) =>
            onEdgeChange(edge.id, {
              labelPosition: { ...labelPosition, y: value },
            })
          }
        />
        <NumberInput
          label="标签宽度"
          value={labelPosition.width ?? 180}
          onChange={(value) =>
            onEdgeChange(edge.id, {
              labelPosition: { ...labelPosition, width: value },
            })
          }
        />
        <NumberInput
          label="标签高度"
          value={edge.labelH ?? 34}
          onChange={(value) =>
            onEdgeChange(edge.id, {
              labelH: Math.max(24, Math.min(220, value)),
            })
          }
        />
      </div>
      <label style={fieldLabelStyle}>
        <span>线条类型</span>
        <select
          value={edge.dashed ? "dashed" : "solid"}
          onChange={(event) =>
            onEdgeChange(edge.id, { dashed: event.target.value === "dashed" })
          }
          style={inputStyle}
        >
          <option value="solid">实线：已发生事实 / 合同关系</option>
          <option value="dashed">虚线：争议主张 / 待确认关系</option>
        </select>
      </label>
      <label style={fieldLabelStyle}>
        <span>线条颜色</span>
        <select
          value={edge.stroke ?? styleMap.edge.stroke}
          onChange={(event) =>
            onEdgeChange(edge.id, {
              stroke:
                event.target.value === styleMap.edge.stroke
                  ? undefined
                  : event.target.value,
            })
          }
          style={inputStyle}
        >
          {lineColorOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}（{item.value}）
            </option>
          ))}
        </select>
        <span
          style={{
            display: "block",
            width: "100%",
            height: 8,
            borderRadius: 999,
            background: edge.stroke ?? styleMap.edge.stroke,
            border: "1px solid #E2E8F0",
          }}
        />
      </label>
      <NumberInput
        label="线条粗细"
        value={edge.strokeWidth ?? 1.9}
        onChange={(value) =>
          onEdgeChange(edge.id, { strokeWidth: Math.max(0.5, Math.min(8, value)) })
        }
      />
      <label style={fieldLabelStyle}>
        <span>路径数据（高级）</span>
        <textarea
          value={edge.path ?? renderedEdgePath ?? ""}
          onChange={(event) =>
            onEdgeChange(edge.id, { path: event.target.value || undefined })
          }
          rows={6}
          style={{ ...textareaStyle, fontFamily: "Consolas, monospace" }}
        />
      </label>
      <button
        type="button"
        onClick={() => onDeleteEdge(edge.id)}
        style={dangerButtonStyle}
      >
        删除关系
      </button>
    </aside>
  );
}

export default function LegalRelationshipDiagram() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [diagramData, setDiagramData] = useState<DiagramData>(() =>
    cloneDiagramData(defaultDiagramData),
  );
  const diagramDataRef = useRef(diagramData);
  const [selected, setSelected] = useState<Selection>(null);
  const [editMode, setEditMode] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [smartAlign, setSmartAlign] = useState(true);
  const [past, setPast] = useState<DiagramData[]>([]);
  const [future, setFuture] = useState<DiagramData[]>([]);

  useEffect(() => {
    diagramDataRef.current = diagramData;
  }, [diagramData]);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = normalizeDiagramData(JSON.parse(saved));
      if (window.confirm("检测到本地保存版本，是否恢复？")) {
        setDiagramData(parsed);
        diagramDataRef.current = parsed;
      }
    } catch {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  const nodeMap = useMemo(
    () => new Map(diagramData.nodes.map((node) => [node.id, node])),
    [diagramData.nodes],
  );

  const renderedEdges = useMemo<RenderedEdge[]>(
    () =>
      diagramData.edges.map((edge) => ({
        ...edge,
        renderedPath: getRenderedPath(edge, nodeMap),
        editablePoints: editableEdgePoints(edge, nodeMap),
      })),
    [diagramData.edges, nodeMap],
  );

  const selectedNode =
    selected?.type === "node"
      ? diagramData.nodes.find((node) => node.id === selected.id)
      : undefined;
  const selectedEdge =
    selected?.type === "edge"
      ? diagramData.edges.find((edge) => edge.id === selected.id)
      : undefined;
  const selectedRenderedEdge = selectedEdge
    ? renderedEdges.find((edge) => edge.id === selectedEdge.id)
    : undefined;

  function applyData(nextData: DiagramData, recordHistory = true, historyBase?: DiagramData) {
    const previous = historyBase ?? diagramDataRef.current;
    if (recordHistory && changed(previous, nextData)) {
      setPast((items) => [...items.slice(-79), cloneDiagramData(previous)]);
      setFuture([]);
    }
    diagramDataRef.current = nextData;
    setDiagramData(nextData);
  }

  function updateData(
    producer: (data: DiagramData) => DiagramData,
    recordHistory = true,
  ) {
    const base = diagramDataRef.current;
    const draft = cloneDiagramData(base);
    const nextData = producer(draft);
    applyData(nextData, recordHistory, base);
  }

  function updateNode(id: string, patch: Partial<DiagramNode>) {
    updateData((data) => ({
      ...data,
      nodes: data.nodes.map((node) =>
        node.id === id ? { ...node, ...patch } : node,
      ),
    }));
  }

  function updateEdge(id: string, patch: Partial<DiagramEdge>) {
    updateData((data) => ({
      ...data,
      edges: data.edges.map((edge) =>
        edge.id === id ? { ...edge, ...patch } : edge,
      ),
    }));
  }

  function deleteNode(id: string) {
    if (!window.confirm(`确认删除节点 ${id}？相关连线也会删除。`)) return;
    updateData((data) => ({
      ...data,
      nodes: data.nodes.filter((node) => node.id !== id),
      edges: data.edges.filter((edge) => edge.from !== id && edge.to !== id),
    }));
    setSelected(null);
  }

  function deleteEdge(id: string) {
    if (!window.confirm(`确认删除关系 ${id}？`)) return;
    updateData((data) => ({
      ...data,
      edges: data.edges.filter((edge) => edge.id !== id),
    }));
    setSelected(null);
  }

  function undo() {
    setPast((items) => {
      if (!items.length) return items;
      const previous = items[items.length - 1];
      const current = cloneDiagramData(diagramDataRef.current);
      setFuture((futureItems) => [current, ...futureItems]);
      const nextData = cloneDiagramData(previous);
      diagramDataRef.current = nextData;
      setDiagramData(nextData);
      return items.slice(0, -1);
    });
  }

  function redo() {
    setFuture((items) => {
      if (!items.length) return items;
      const next = items[0];
      const current = cloneDiagramData(diagramDataRef.current);
      setPast((pastItems) => [...pastItems.slice(-79), current]);
      const nextData = cloneDiagramData(next);
      diagramDataRef.current = nextData;
      setDiagramData(nextData);
      return items.slice(1);
    });
  }

  function getSvgPoint(event: React.PointerEvent): Point {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const matrix = svg.getScreenCTM();
    if (!matrix) return { x: point.x, y: point.y };
    const transformed = point.matrixTransform(matrix.inverse());
    return { x: transformed.x, y: transformed.y };
  }

  function beginNodeDrag(node: DiagramNode, event: React.PointerEvent<SVGGElement>) {
    if (!editMode) return;
    event.stopPropagation();
    const point = getSvgPoint(event);
    setSelected({ type: "node", id: node.id });
    dragRef.current = {
      type: "node",
      id: node.id,
      offsetX: point.x - node.x,
      offsetY: point.y - node.y,
      originalData: cloneDiagramData(diagramDataRef.current),
    };
    svgRef.current?.setPointerCapture(event.pointerId);
  }

  function beginLabelDrag(edge: DiagramEdge, event: React.PointerEvent<SVGGElement>) {
    if (!editMode || !edge.label) return;
    event.stopPropagation();
    const point = getSvgPoint(event);
    const labelX = edge.labelPosition?.x ?? edge.labelX ?? 0;
    const labelY = edge.labelPosition?.y ?? edge.labelY ?? 0;
    setSelected({ type: "edge", id: edge.id });
    dragRef.current = {
      type: "label",
      id: edge.id,
      offsetX: point.x - labelX,
      offsetY: point.y - labelY,
      originalData: cloneDiagramData(diagramDataRef.current),
    };
    svgRef.current?.setPointerCapture(event.pointerId);
  }

  function beginLabelResize(edge: DiagramEdge, event: React.PointerEvent<SVGRectElement>) {
    if (!editMode || !edge.label) return;
    event.stopPropagation();
    const point = getSvgPoint(event);
    const labelPosition = edge.labelPosition ?? {
      x: edge.labelX ?? 0,
      y: edge.labelY ?? 0,
      width: edge.labelW ?? 180,
    };
    setSelected({ type: "edge", id: edge.id });
    dragRef.current = {
      type: "labelResize",
      id: edge.id,
      startX: point.x,
      startY: point.y,
      startWidth: labelPosition.width ?? edge.labelW ?? 180,
      startHeight: edge.labelH ?? 34,
      originalData: cloneDiagramData(diagramDataRef.current),
    };
    svgRef.current?.setPointerCapture(event.pointerId);
  }

  function convertEdgeToEditablePoints(edge: DiagramEdge, points: Point[]): DiagramData {
    const nextData = cloneDiagramData(diagramDataRef.current);
    nextData.edges = nextData.edges.map((item) =>
      item.id === edge.id
        ? {
            ...item,
            points: points.map((point) => ({ ...point })),
            path: undefined,
            waypoints: undefined,
          }
        : item,
    );
    diagramDataRef.current = nextData;
    setDiagramData(nextData);
    return nextData;
  }

  function beginEdgePointDrag(
    edge: DiagramEdge,
    pointIndex: number,
    event: React.PointerEvent<SVGCircleElement>,
  ) {
    if (!editMode) return;
    event.stopPropagation();
    const points = editableEdgePoints(edge, nodeMap).map((point) => ({ ...point }));
    const targetPoint = points[pointIndex];
    if (!targetPoint) return;

    const originalData = cloneDiagramData(diagramDataRef.current);
    convertEdgeToEditablePoints(edge, points);
    const pointer = getSvgPoint(event);
    setSelected({ type: "edge", id: edge.id });
    dragRef.current = {
      type: "edgePoint",
      id: edge.id,
      pointIndex,
      offsetX: pointer.x - targetPoint.x,
      offsetY: pointer.y - targetPoint.y,
      originalData,
      originalPoints: points,
    };
    svgRef.current?.setPointerCapture(event.pointerId);
  }

  function beginEdgeMidpointDrag(
    edge: DiagramEdge,
    insertAfterIndex: number,
    event: React.PointerEvent<SVGRectElement>,
  ) {
    if (!editMode) return;
    event.stopPropagation();
    const points = editableEdgePoints(edge, nodeMap).map((point) => ({ ...point }));
    const before = points[insertAfterIndex];
    const after = points[insertAfterIndex + 1];
    if (!before || !after) return;

    const insertedPoint = {
      x: snap((before.x + after.x) / 2, snapToGrid),
      y: snap((before.y + after.y) / 2, snapToGrid),
    };
    const nextPoints = [
      ...points.slice(0, insertAfterIndex + 1),
      insertedPoint,
      ...points.slice(insertAfterIndex + 1),
    ];
    const originalData = cloneDiagramData(diagramDataRef.current);
    convertEdgeToEditablePoints(edge, nextPoints);
    const pointer = getSvgPoint(event);
    setSelected({ type: "edge", id: edge.id });
    dragRef.current = {
      type: "edgePoint",
      id: edge.id,
      pointIndex: insertAfterIndex + 1,
      offsetX: pointer.x - insertedPoint.x,
      offsetY: pointer.y - insertedPoint.y,
      originalData,
      originalPoints: nextPoints,
    };
    svgRef.current?.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (!editMode || !dragRef.current) return;
    const drag = dragRef.current;
    const point = getSvgPoint(event);
    const nextX = "offsetX" in drag ? snap(point.x - drag.offsetX, snapToGrid) : 0;
    const nextY = "offsetY" in drag ? snap(point.y - drag.offsetY, snapToGrid) : 0;

    const nextData = cloneDiagramData(diagramDataRef.current);
    if (drag.type === "node") {
      nextData.nodes = nextData.nodes.map((node) =>
        node.id === drag.id ? { ...node, x: nextX, y: nextY } : node,
      );
    } else if (drag.type === "label") {
      nextData.edges = nextData.edges.map((edge) => {
        if (edge.id !== drag.id) return edge;
        const currentLabel = edge.labelPosition ?? {
          x: edge.labelX ?? 0,
          y: edge.labelY ?? 0,
          width: edge.labelW ?? 180,
        };
        return {
          ...edge,
          labelPosition: {
            ...currentLabel,
            x: nextX,
            y: nextY,
          },
        };
      });
    } else if (drag.type === "edgePoint") {
      nextData.edges = nextData.edges.map((edge) => {
        if (edge.id !== drag.id) return edge;
        const currentPoints = (edge.points?.length
          ? edge.points
          : editableEdgePoints(edge, new Map(nextData.nodes.map((node) => [node.id, node]))))
          .map((currentPoint) => ({ ...currentPoint }));
        if (!currentPoints[drag.pointIndex]) return edge;
        currentPoints[drag.pointIndex] = alignEdgePoint(
          currentPoints,
          drag.originalPoints,
          drag.pointIndex,
          { x: nextX, y: nextY },
          smartAlign,
        );
        return {
          ...edge,
          points: currentPoints,
          path: undefined,
          waypoints: undefined,
        };
      });
    } else if (drag.type === "labelResize") {
      nextData.edges = nextData.edges.map((edge) => {
        if (edge.id !== drag.id) return edge;
        const currentLabel = edge.labelPosition ?? {
          x: edge.labelX ?? 0,
          y: edge.labelY ?? 0,
          width: edge.labelW ?? drag.startWidth,
        };
        return {
          ...edge,
          labelPosition: {
            ...currentLabel,
            width: Math.max(70, snap(drag.startWidth + point.x - drag.startX, snapToGrid)),
          },
          labelH: Math.max(28, snap(drag.startHeight + point.y - drag.startY, snapToGrid)),
        };
      });
    }

    diagramDataRef.current = nextData;
    setDiagramData(nextData);
  }

  function endDrag() {
    const drag = dragRef.current;
    if (!drag) return;
    const current = diagramDataRef.current;
    if (changed(drag.originalData, current)) {
      setPast((items) => [...items.slice(-79), drag.originalData]);
      setFuture([]);
    }
    dragRef.current = null;
  }

  function exportSvg() {
    if (!svgRef.current) return;
    const svgText = serializeSvg(svgRef.current);
    downloadBlob(
      new Blob([svgText], { type: "image/svg+xml;charset=utf-8" }),
      "华贺库粮食短缺及多方权利主张关系图.svg",
    );
  }

  function exportPng() {
    if (!svgRef.current) return;
    const svgText = serializeSvg(svgRef.current);
    const svgBlob = new Blob([svgText], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = CANVAS.width * scale;
      canvas.height = CANVAS.height * scale;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        URL.revokeObjectURL(url);
        return;
      }

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, "华贺库粮食短缺及多方权利主张关系图.png");
        }
        URL.revokeObjectURL(url);
      }, "image/png");
    };

    image.onerror = () => URL.revokeObjectURL(url);
    image.src = url;
  }

  function exportJson() {
    downloadBlob(
      new Blob([JSON.stringify(diagramData, null, 2)], {
        type: "application/json;charset=utf-8",
      }),
      "legal-diagram-data.json",
    );
  }

  function importJsonFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = normalizeDiagramData(JSON.parse(String(reader.result)));
        applyData(parsed);
        setSelected(null);
        window.alert("JSON 已导入。");
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "JSON 格式不正确。");
      }
    };
    reader.readAsText(file, "utf-8");
  }

  function saveLocal() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(diagramData, null, 2));
    window.alert("已保存到本地，刷新后可恢复。");
  }

  function resetDefault() {
    if (!window.confirm("确认重置为默认数据？当前未导出的修改会丢失。")) return;
    applyData(cloneDiagramData(defaultDiagramData));
    setSelected(null);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: styleMap.page.background,
        color: styleMap.page.text,
        fontFamily,
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          margin: "0 auto 14px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 26, lineHeight: 1.35 }}>
            华贺库粮食短缺及多方权利主张关系图
          </h1>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 14,
              color: styleMap.page.mutedText,
            }}
          >
            编辑器版：拖动节点、紫色标签和连线控制点；小方块可插入新折点。
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <ToolbarButton onClick={exportSvg}>导出 SVG</ToolbarButton>
          <ToolbarButton onClick={exportPng}>导出 PNG</ToolbarButton>
        </div>
      </div>

      <div style={toolbarStyle}>
        <ToolbarButton active={editMode} onClick={() => setEditMode((value) => !value)}>
          {editMode ? "预览模式" : "编辑模式"}
        </ToolbarButton>
        <ToolbarButton onClick={saveLocal}>保存到本地</ToolbarButton>
        <ToolbarButton onClick={exportJson}>导出 JSON</ToolbarButton>
        <ToolbarButton onClick={() => fileInputRef.current?.click()}>导入 JSON</ToolbarButton>
        <ToolbarButton onClick={resetDefault}>重置为默认数据</ToolbarButton>
        <ToolbarButton onClick={undo} disabled={!past.length}>撤销</ToolbarButton>
        <ToolbarButton onClick={redo} disabled={!future.length}>重做</ToolbarButton>
        <ToolbarButton active={showGrid} onClick={() => setShowGrid((value) => !value)}>
          {showGrid ? "隐藏网格" : "显示网格"}
        </ToolbarButton>
        <ToolbarButton active={snapToGrid} onClick={() => setSnapToGrid((value) => !value)}>
          {snapToGrid ? "关闭吸附" : "吸附网格"}
        </ToolbarButton>
        <ToolbarButton active={smartAlign} onClick={() => setSmartAlign((value) => !value)}>
          {smartAlign ? "关闭自动对齐" : "自动对齐"}
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={importJsonFile}
          style={{ display: "none" }}
        />
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div
          style={{
            overflowX: "auto",
            paddingBottom: 12,
            flex: "1 1 auto",
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: CANVAS.width,
              background: "#FFFFFF",
              borderRadius: 10,
              boxShadow: "0 12px 34px rgba(15, 23, 42, 0.12)",
            }}
          >
            <svg
              ref={svgRef}
              width={CANVAS.width}
              height={CANVAS.height}
              viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`}
              role="img"
              aria-label="华贺库粮食短缺及多方权利主张关系图"
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              style={{
                display: "block",
                width: `${CANVAS.width}px`,
                height: `${CANVAS.height}px`,
                maxWidth: "none",
                background: "#FFFFFF",
                userSelect: editMode ? "none" : "auto",
              }}
            >
              <defs>
                <marker
                  id="arrow"
                  markerWidth="12"
                  markerHeight="12"
                  refX="10"
                  refY="6"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M 0 0 L 12 6 L 0 12 z" fill="context-stroke" />
                </marker>
                <marker
                  id="arrow-small"
                  markerWidth="10"
                  markerHeight="10"
                  refX="8"
                  refY="5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
                </marker>
                <pattern
                  id="editor-grid"
                  width={GRID_SIZE}
                  height={GRID_SIZE}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`}
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth={0.7}
                    opacity={0.35}
                  />
                </pattern>
              </defs>

              <rect
                x={0}
                y={0}
                width={CANVAS.width}
                height={CANVAS.height}
                fill="#FFFFFF"
                onPointerDown={() => editMode && setSelected(null)}
              />

              {editMode && showGrid && (
                <rect
                  data-editor-only="true"
                  x={0}
                  y={0}
                  width={CANVAS.width}
                  height={CANVAS.height}
                  fill="url(#editor-grid)"
                  pointerEvents="none"
                />
              )}

              {diagramData.sections.map((section) => (
                <DiagramSection key={section.id} section={section} />
              ))}

              <g>
                {renderedEdges.map((edge) => (
                  <EdgePath
                    key={edge.id}
                    edge={edge}
                    path={edge.renderedPath}
                    editable={editMode}
                    selected={selected?.type === "edge" && selected.id === edge.id}
                    onSelect={(event) => {
                      if (!editMode) return;
                      event.stopPropagation();
                      setSelected({ type: "edge", id: edge.id });
                    }}
                  />
                ))}
              </g>

              {diagramData.nodes.map((node) => (
                <NodeCard
                  key={node.id}
                  node={node}
                  editable={editMode}
                  selected={selected?.type === "node" && selected.id === node.id}
                  onPointerDown={(event) => beginNodeDrag(node, event)}
                />
              ))}

              {renderedEdges.map((edge) => (
                <EdgeLabel
                  key={`${edge.id}-label`}
                  edge={edge}
                  editable={editMode}
                  selected={selected?.type === "edge" && selected.id === edge.id}
                  onPointerDown={(event) => beginLabelDrag(edge, event)}
                  onResizePointerDown={(event) => beginLabelResize(edge, event)}
                  onLabelTextChange={(value) =>
                    updateEdge(edge.id, { label: value || undefined })
                  }
                />
              ))}

              {editMode &&
                selected?.type === "edge" &&
                renderedEdges
                  .filter((edge) => edge.id === selected.id)
                  .map((edge) => (
                    <EdgeControlPoints
                      key={`${edge.id}-controls`}
                      edge={edge}
                      points={edge.editablePoints}
                      onPointPointerDown={beginEdgePointDrag}
                      onMidpointPointerDown={beginEdgeMidpointDrag}
                    />
                  ))}

              <Timeline items={diagramData.timelineItems} />
              <Legend items={diagramData.legendItems} />
            </svg>
          </div>
        </div>

        {editMode && (
          <PropertyPanel
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            renderedEdgePath={selectedRenderedEdge?.renderedPath}
            selectedEdgePoints={selectedRenderedEdge?.editablePoints}
            onNodeChange={updateNode}
            onEdgeChange={updateEdge}
            onDeleteNode={deleteNode}
            onDeleteEdge={deleteEdge}
          />
        )}
      </div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  appearance: "none",
  border: "1px solid #CBD5E1",
  borderRadius: 8,
  padding: "10px 14px",
  background: "#FFFFFF",
  color: "#1F2937",
  fontFamily,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const toolbarStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  alignItems: "center",
  marginBottom: 14,
  padding: 10,
  background: "rgba(255, 255, 255, 0.72)",
  border: "1px solid #D8DFEA",
  borderRadius: 10,
};

const panelStyle: React.CSSProperties = {
  position: "sticky",
  top: 16,
  flex: "0 0 360px",
  width: 360,
  maxHeight: "calc(100vh - 48px)",
  overflowY: "auto",
  background: "#FFFFFF",
  border: "1px solid #D8DFEA",
  borderRadius: 10,
  boxShadow: "0 12px 34px rgba(15, 23, 42, 0.12)",
  padding: 16,
  boxSizing: "border-box",
};

const panelTitleStyle: React.CSSProperties = {
  margin: "0 0 14px",
  fontSize: 18,
  lineHeight: 1.35,
};

const panelHintStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.7,
  color: styleMap.page.mutedText,
};

const fieldLabelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 13,
  fontWeight: 700,
  color: styleMap.page.text,
  marginBottom: 12,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #CBD5E1",
  borderRadius: 8,
  padding: "9px 10px",
  fontFamily,
  fontSize: 14,
  color: styleMap.page.text,
  background: "#FFFFFF",
};

const readOnlyInputStyle: React.CSSProperties = {
  ...inputStyle,
  color: styleMap.page.mutedText,
  background: "#F8FAFC",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 90,
  resize: "vertical",
  lineHeight: 1.45,
};

const twoColumnStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

const checkboxStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  margin: "4px 0 14px",
  fontSize: 14,
  fontWeight: 600,
};

const dangerButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  width: "100%",
  borderColor: "#FCA5A5",
  background: "#FEF2F2",
  color: "#B91C1C",
};
