import { legalStatusOptions, relationKindOptions } from "../../domain/legalSchema";
import type { DiagramEdge, LegalRelationKind, LegalStatus, Point } from "../../domain/types";
import {
  buttonStyle,
  dangerButtonStyle,
  fieldLabelStyle,
  inputStyle,
  NumberInput,
  panelTitleStyle,
  readOnlyInputStyle,
  textareaStyle,
  twoColumnStyle,
} from "./shared";

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

type EdgeInspectorProps = {
  edge: DiagramEdge;
  renderedEdgePath?: string;
  selectedEdgePoints?: Point[];
  onChange: (id: string, patch: Partial<DiagramEdge>) => void;
  onDelete: (id: string) => void;
};

export function EdgeInspector({
  edge,
  renderedEdgePath,
  selectedEdgePoints,
  onChange,
  onDelete,
}: EdgeInspectorProps) {
  const fallbackLabelPosition = defaultLabelPosition(selectedEdgePoints ?? []);
  const labelPosition = edge.labelPosition ?? {
    x: edge.labelX ?? fallbackLabelPosition.x,
    y: edge.labelY ?? fallbackLabelPosition.y,
    width: edge.labelW ?? 180,
  };

  return (
    <>
      <h2 style={panelTitleStyle}>关系检查器</h2>
      <label style={fieldLabelStyle}>
        <span>关系编号</span>
        <input value={edge.id} readOnly style={readOnlyInputStyle} />
      </label>
      <div style={twoColumnStyle}>
        <label style={fieldLabelStyle}>
          <span>起点节点</span>
          <input
            value={edge.from ?? ""}
            onChange={(event) => onChange(edge.id, { from: event.target.value || undefined })}
            style={inputStyle}
          />
        </label>
        <label style={fieldLabelStyle}>
          <span>终点节点</span>
          <input
            value={edge.to ?? ""}
            onChange={(event) => onChange(edge.id, { to: event.target.value || undefined })}
            style={inputStyle}
          />
        </label>
      </div>
      <label style={fieldLabelStyle}>
        <span>法律关系类型</span>
        <select
          value={edge.relationKind ?? "contract"}
          onChange={(event) => onChange(edge.id, { relationKind: event.target.value as LegalRelationKind })}
          style={inputStyle}
        >
          {relationKindOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label style={fieldLabelStyle}>
        <span>法律状态</span>
        <select
          value={edge.legalStatus ?? "confirmed"}
          onChange={(event) => onChange(edge.id, { legalStatus: event.target.value as LegalStatus })}
          style={inputStyle}
        >
          {legalStatusOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label style={fieldLabelStyle}>
        <span>图上标签</span>
        <textarea
          value={edge.label ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            onChange(edge.id, {
              label: value || undefined,
              labelPosition:
                value && !edge.labelPosition && edge.labelX === undefined
                  ? fallbackLabelPosition
                  : edge.labelPosition,
              labelH: value && edge.labelH === undefined ? 44 : edge.labelH,
            });
          }}
          rows={3}
          style={textareaStyle}
        />
      </label>
      {!edge.label && (
        <button
          type="button"
          onClick={() =>
            onChange(edge.id, {
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
        <NumberInput label="标签横坐标" value={labelPosition.x} onChange={(value) => onChange(edge.id, { labelPosition: { ...labelPosition, x: value } })} />
        <NumberInput label="标签纵坐标" value={labelPosition.y} onChange={(value) => onChange(edge.id, { labelPosition: { ...labelPosition, y: value } })} />
        <NumberInput label="标签宽度" value={labelPosition.width ?? 180} onChange={(value) => onChange(edge.id, { labelPosition: { ...labelPosition, width: value } })} />
        <NumberInput label="标签高度" value={edge.labelH ?? 34} onChange={(value) => onChange(edge.id, { labelH: Math.max(24, Math.min(220, value)) })} />
      </div>
      <label style={fieldLabelStyle}>
        <span>依据 / 证明基础</span>
        <textarea
          value={edge.basis ?? ""}
          onChange={(event) => onChange(edge.id, { basis: event.target.value })}
          rows={3}
          style={textareaStyle}
        />
      </label>
      <div style={twoColumnStyle}>
        <label style={fieldLabelStyle}>
          <span>金额</span>
          <input value={edge.amount ?? ""} onChange={(event) => onChange(edge.id, { amount: event.target.value })} style={inputStyle} />
        </label>
        <label style={fieldLabelStyle}>
          <span>日期</span>
          <input value={edge.date ?? ""} onChange={(event) => onChange(edge.id, { date: event.target.value })} style={inputStyle} />
        </label>
      </div>
      <label style={fieldLabelStyle}>
        <span>来源文件 / 证据</span>
        <input
          value={edge.sourceDocument ?? ""}
          onChange={(event) => onChange(edge.id, { sourceDocument: event.target.value })}
          style={inputStyle}
        />
      </label>
      <details style={{ marginBottom: 12 }}>
        <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 13 }}>高级路径和样式</summary>
        <label style={{ ...fieldLabelStyle, marginTop: 10 }}>
          <span>路径数据</span>
          <textarea
            value={edge.path ?? renderedEdgePath ?? ""}
            onChange={(event) => onChange(edge.id, { path: event.target.value || undefined })}
            rows={5}
            style={{ ...textareaStyle, fontFamily: "Consolas, monospace" }}
          />
        </label>
        <div style={twoColumnStyle}>
          <label style={fieldLabelStyle}>
            <span>颜色覆盖</span>
            <input value={edge.stroke ?? ""} onChange={(event) => onChange(edge.id, { stroke: event.target.value || undefined })} style={inputStyle} />
          </label>
          <NumberInput label="线条粗细" value={edge.strokeWidth ?? 1.9} onChange={(value) => onChange(edge.id, { strokeWidth: Math.max(0.5, Math.min(8, value)) })} />
        </div>
      </details>
      <button type="button" onClick={() => onDelete(edge.id)} style={dangerButtonStyle}>
        删除关系
      </button>
    </>
  );
}
