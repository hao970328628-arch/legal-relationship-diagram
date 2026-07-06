import type { DiagramProject, DiagramType, PagePreset } from "../../domain/types";
import {
  fieldLabelStyle,
  inputStyle,
  NumberInput,
  panelTitleStyle,
  textareaStyle,
  twoColumnStyle,
} from "./shared";

type ProjectInspectorProps = {
  project: DiagramProject;
  onProjectChange: (patch: Partial<DiagramProject>) => void;
  onCanvasChange: (patch: Partial<DiagramProject["canvas"]>) => void;
};

export function ProjectInspector({
  project,
  onProjectChange,
  onCanvasChange,
}: ProjectInspectorProps) {
  return (
    <>
      <h2 style={panelTitleStyle}>项目检查器</h2>
      <label style={fieldLabelStyle}>
        <span>项目名称</span>
        <input
          value={project.title}
          onChange={(event) => onProjectChange({ title: event.target.value })}
          style={inputStyle}
        />
      </label>
      <label style={fieldLabelStyle}>
        <span>项目说明</span>
        <textarea
          value={project.description ?? ""}
          onChange={(event) => onProjectChange({ description: event.target.value })}
          rows={4}
          style={textareaStyle}
        />
      </label>
      <label style={fieldLabelStyle}>
        <span>图谱类型</span>
        <select
          value={project.diagramType}
          onChange={(event) => onProjectChange({ diagramType: event.target.value as DiagramType })}
          style={inputStyle}
        >
          <option value="legal-relationship">法律关系图</option>
          <option value="transaction">交易结构图</option>
          <option value="case-path">诉讼路径图</option>
          <option value="dispute">争议焦点图</option>
          <option value="evidence-chain">证据链图</option>
        </select>
      </label>
      <div style={twoColumnStyle}>
        <NumberInput
          label="画布宽度"
          value={project.canvas.width}
          onChange={(value) => onCanvasChange({ width: Math.max(800, value) })}
        />
        <NumberInput
          label="画布高度"
          value={project.canvas.height}
          onChange={(value) => onCanvasChange({ height: Math.max(600, value) })}
        />
      </div>
      <label style={fieldLabelStyle}>
        <span>页面预设</span>
        <select
          value={project.canvas.pagePreset ?? "custom"}
          onChange={(event) => onCanvasChange({ pagePreset: event.target.value as PagePreset })}
          style={inputStyle}
        >
          <option value="custom">自定义</option>
          <option value="A4">A4</option>
          <option value="A3">A3</option>
          <option value="16:9">16:9</option>
        </select>
      </label>
    </>
  );
}
