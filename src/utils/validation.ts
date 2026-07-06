import type { DiagramProject, ValidationIssue } from "../domain/types";

function issue(
  code: string,
  title: string,
  message: string,
  targetType?: ValidationIssue["targetType"],
  targetId?: string,
  severity: ValidationIssue["severity"] = "warning",
): ValidationIssue {
  return {
    id: `${code}:${targetType ?? "project"}:${targetId ?? "all"}`,
    code,
    severity,
    title,
    message,
    targetType,
    targetId,
  };
}

function findDuplicates(values: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  values.forEach((value) => {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  });
  return Array.from(duplicates);
}

export function validateDiagramProject(project: DiagramProject): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { nodes, edges } = project.data;
  const nodeIds = nodes.map((node) => node.id);
  const edgeIds = edges.map((edge) => edge.id);
  const nodeIdSet = new Set(nodeIds);
  const connectedNodeIds = new Set<string>();

  if (project.schemaVersion !== 1) {
    issues.push(
      issue(
        "schema-version",
        "Schema 版本不匹配",
        `当前文件 schemaVersion 为 ${project.schemaVersion}，建议迁移到 1。`,
        "project",
        project.id,
        "info",
      ),
    );
  }

  findDuplicates(nodeIds).forEach((id) => {
    issues.push(
      issue("duplicate-node-id", "节点编号重复", `节点编号 ${id} 出现多次。`, "node", id, "error"),
    );
  });

  findDuplicates(edgeIds).forEach((id) => {
    issues.push(
      issue("duplicate-edge-id", "关系编号重复", `关系编号 ${id} 出现多次。`, "edge", id, "error"),
    );
  });

  edges.forEach((edge) => {
    if (edge.visible === false || edge.opacity === 0) {
      issues.push(
        issue(
          "hidden-edge",
          "存在隐藏关系",
          `关系 ${edge.id} 被隐藏，导出和汇报前请确认是否需要保留。`,
          "edge",
          edge.id,
          "info",
        ),
      );
    }

    if (edge.from) {
      if (nodeIdSet.has(edge.from)) connectedNodeIds.add(edge.from);
      else {
        issues.push(
          issue(
            "dangling-edge-source",
            "关系起点不存在",
            `关系 ${edge.id} 的起点 ${edge.from} 不存在。`,
            "edge",
            edge.id,
            "error",
          ),
        );
      }
    }

    if (edge.to) {
      if (nodeIdSet.has(edge.to)) connectedNodeIds.add(edge.to);
      else {
        issues.push(
          issue(
            "dangling-edge-target",
            "关系终点不存在",
            `关系 ${edge.id} 的终点 ${edge.to} 不存在。`,
            "edge",
            edge.id,
            "error",
          ),
        );
      }
    }
  });

  nodes.forEach((node) => {
    if (!connectedNodeIds.has(node.id)) {
      issues.push(
        issue(
          "isolated-node",
          "孤立节点",
          `节点 ${node.id} 没有关联关系。`,
          "node",
          node.id,
          "info",
        ),
      );
    }
    if (node.text.length > 180) {
      issues.push(
        issue(
          "long-node-text",
          "节点文字过长",
          `节点 ${node.id} 的文字较长，建议拆分或放入备注/依据。`,
          "node",
          node.id,
        ),
      );
    }
  });

  return issues;
}
