import type { DiagramType, NodeKind } from "./types";

export type DiagramTemplateSummary = {
  id: string;
  title: string;
  diagramType: DiagramType;
  description: string;
  recommendedNodes: NodeKind[];
};

export const diagramTemplates: DiagramTemplateSummary[] = [
  {
    id: "legal-relationship",
    title: "法律关系图",
    diagramType: "legal-relationship",
    description: "展示主体、合同、货权主张和风险关系。",
    recommendedNodes: ["subject", "object", "dispute", "case"],
  },
  {
    id: "transaction",
    title: "交易结构图",
    diagramType: "transaction",
    description: "展示交易主体、资金流、货物流和担保安排。",
    recommendedNodes: ["subject", "object", "note"],
  },
  {
    id: "case-path",
    title: "诉讼路径图",
    diagramType: "case-path",
    description: "展示起诉、执行、异议、再审等程序节点。",
    recommendedNodes: ["subject", "case", "evidence"],
  },
  {
    id: "dispute",
    title: "争议焦点图",
    diagramType: "dispute",
    description: "聚焦核心争议事实、各方主张和风险结论。",
    recommendedNodes: ["subject", "dispute", "evidence"],
  },
  {
    id: "evidence-chain",
    title: "证据链图",
    diagramType: "evidence-chain",
    description: "把证据、事实和证明目的串联成可汇报结构。",
    recommendedNodes: ["evidence", "dispute", "note"],
  },
];
