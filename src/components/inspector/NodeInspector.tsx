import { nodeKindOptions } from "../../domain/legalSchema";
import type { DiagramNode, NodeKind } from "../../domain/types";
import {
  checkboxStyle,
  dangerButtonStyle,
  fieldLabelStyle,
  inputStyle,
  NumberInput,
  panelTitleStyle,
  readOnlyInputStyle,
  textareaStyle,
  twoColumnStyle,
} from "./shared";

type NodeInspectorProps = {
  node: DiagramNode;
  onChange: (id: string, patch: Partial<DiagramNode>) => void;
  onDelete: (id: string) => void;
};

export function NodeInspector({ node, onChange, onDelete }: NodeInspectorProps) {
  return (
    <>
      <h2 style={panelTitleStyle}>节点检查器</h2>
      <label style={fieldLabelStyle}>
        <span>节点编号</span>
        <input value={node.id} readOnly style={readOnlyInputStyle} />
      </label>
      <label style={fieldLabelStyle}>
        <span>节点文字</span>
        <textarea
          value={node.text}
          onChange={(event) => onChange(node.id, { text: event.target.value })}
          rows={6}
          style={textareaStyle}
        />
      </label>
      <label style={fieldLabelStyle}>
        <span>法律身份 / 角色</span>
        <input
          value={node.role ?? ""}
          onChange={(event) => onChange(node.id, { role: event.target.value })}
          style={inputStyle}
        />
      </label>
      <div style={twoColumnStyle}>
        <NumberInput label="横坐标" value={node.x} onChange={(value) => onChange(node.id, { x: value })} />
        <NumberInput label="纵坐标" value={node.y} onChange={(value) => onChange(node.id, { y: value })} />
        <NumberInput label="宽度" value={node.width} onChange={(value) => onChange(node.id, { width: value })} />
        <NumberInput label="高度" value={node.height} onChange={(value) => onChange(node.id, { height: value })} />
      </div>
      <label style={fieldLabelStyle}>
        <span>节点类型</span>
        <select
          value={node.type}
          onChange={(event) => onChange(node.id, { type: event.target.value as NodeKind })}
          style={inputStyle}
        >
          {nodeKindOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label style={fieldLabelStyle}>
        <span>备注 / 内部说明</span>
        <textarea
          value={node.note ?? ""}
          onChange={(event) => onChange(node.id, { note: event.target.value })}
          rows={3}
          style={textareaStyle}
        />
      </label>
      <label style={checkboxStyle}>
        <input
          type="checkbox"
          checked={node.boldTitle !== false}
          onChange={(event) => onChange(node.id, { boldTitle: event.target.checked })}
        />
        是否加粗标题
      </label>
      <button type="button" onClick={() => onDelete(node.id)} style={dangerButtonStyle}>
        删除节点
      </button>
    </>
  );
}
