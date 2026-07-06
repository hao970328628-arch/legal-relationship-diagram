import type { DiagramEdge, LegalRelationKind, LegalStatus, NodeKind } from "./types";

export const nodeKindOptions: Array<{ value: NodeKind; label: string; defaultText: string }> = [
  { value: "subject", label: "主体", defaultText: "新主体\n身份 / 权利主张" },
  { value: "object", label: "标的物", defaultText: "新标的物\n货物 / 资产 / 库房" },
  { value: "dispute", label: "争议", defaultText: "新争议事实\n风险或冲突说明" },
  { value: "case", label: "程序", defaultText: "新案件路径\n程序动作 / 状态" },
  { value: "evidence", label: "证据", defaultText: "新证据\n名称 / 页码 / 摘要" },
  { value: "note", label: "备注", defaultText: "新备注\n补充说明" },
];

export const relationKindOptions: Array<{ value: LegalRelationKind; label: string }> = [
  { value: "contract", label: "买卖 / 合同关系" },
  { value: "ownership-claim", label: "货权 / 权利主张" },
  { value: "warehouse", label: "仓储 / 保管" },
  { value: "payment", label: "付款 / 资金流" },
  { value: "guarantee", label: "担保 / 保证" },
  { value: "tort", label: "侵权责任" },
  { value: "dispute", label: "争议关系" },
  { value: "procedure", label: "程序动作" },
  { value: "evidence", label: "证据指向" },
  { value: "risk", label: "风险提示" },
];

export const legalStatusOptions: Array<{ value: LegalStatus; label: string }> = [
  { value: "confirmed", label: "已确认" },
  { value: "claimed", label: "主张中" },
  { value: "disputed", label: "争议中" },
  { value: "pending", label: "待确认 / 待裁判" },
  { value: "invalidated", label: "已否定 / 已失效" },
];

const relationColor: Record<LegalRelationKind, string> = {
  contract: "#2563EB",
  "ownership-claim": "#7C3AED",
  warehouse: "#00A86B",
  payment: "#D99A00",
  guarantee: "#0F766E",
  tort: "#DC2626",
  dispute: "#FF3B30",
  procedure: "#16A34A",
  evidence: "#64748B",
  risk: "#EA580C",
};

const dashedStatuses = new Set<LegalStatus>(["claimed", "disputed", "pending", "invalidated"]);

export function deriveEdgeStyle(edge: DiagramEdge) {
  const relationKind = edge.relationKind ?? "contract";
  const legalStatus = edge.legalStatus ?? "confirmed";

  return {
    stroke: edge.stroke ?? relationColor[relationKind],
    dashed: edge.dashed ?? dashedStatuses.has(legalStatus),
    strokeWidth: edge.strokeWidth ?? (legalStatus === "disputed" ? 2.3 : 1.9),
  };
}

export function relationLabel(kind?: LegalRelationKind) {
  return relationKindOptions.find((item) => item.value === kind)?.label ?? "法律关系";
}
