import type { DiagramProject } from "../../domain/types";

type TopBarProps = {
  project: DiagramProject;
  editMode: boolean;
  canUndo: boolean;
  canRedo: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  smartAlign: boolean;
  zoom: number;
  onProjectTitleChange: (title: string) => void;
  onToggleEditMode: () => void;
  onSave: () => void;
  onExportJson: () => void;
  onImportJson: () => void;
  onExportSvg: () => void;
  onExportPng: () => void;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onToggleSmartAlign: () => void;
  onZoomChange: (zoom: number) => void;
};

export function TopBar({
  project,
  editMode,
  canUndo,
  canRedo,
  showGrid,
  snapToGrid,
  smartAlign,
  zoom,
  onProjectTitleChange,
  onToggleEditMode,
  onSave,
  onExportJson,
  onImportJson,
  onExportSvg,
  onExportPng,
  onReset,
  onUndo,
  onRedo,
  onToggleGrid,
  onToggleSnap,
  onToggleSmartAlign,
  onZoomChange,
}: TopBarProps) {
  return (
    <header style={headerStyle}>
      <div style={projectBlockStyle}>
        <label style={titleLabelStyle}>
          <span style={captionStyle}>项目名称</span>
          <input
            value={project.title}
            onChange={(event) => onProjectTitleChange(event.target.value)}
            style={titleInputStyle}
          />
        </label>
        <div style={metaStyle}>
          <span>{project.diagramType}</span>
          <span>schema v{project.schemaVersion}</span>
          <span>画布 {project.canvas.width} x {project.canvas.height}</span>
        </div>
      </div>

      <div style={buttonGroupStyle}>
        <ToolbarButton active={editMode} onClick={onToggleEditMode}>
          {editMode ? "预览" : "编辑"}
        </ToolbarButton>
        <ToolbarButton onClick={onSave}>保存</ToolbarButton>
        <ToolbarButton onClick={onUndo} disabled={!canUndo}>撤销</ToolbarButton>
        <ToolbarButton onClick={onRedo} disabled={!canRedo}>重做</ToolbarButton>
        <ToolbarButton onClick={onExportSvg}>SVG</ToolbarButton>
        <ToolbarButton onClick={onExportPng}>PNG</ToolbarButton>
        <ToolbarButton onClick={onExportJson}>JSON</ToolbarButton>
        <ToolbarButton onClick={onImportJson}>导入</ToolbarButton>
        <ToolbarButton onClick={onReset}>重置</ToolbarButton>
      </div>

      <div style={buttonGroupStyle}>
        <ToolbarButton active={showGrid} onClick={onToggleGrid}>网格</ToolbarButton>
        <ToolbarButton active={snapToGrid} onClick={onToggleSnap}>吸附</ToolbarButton>
        <ToolbarButton active={smartAlign} onClick={onToggleSmartAlign}>对齐</ToolbarButton>
        <ToolbarButton onClick={() => onZoomChange(Math.max(0.4, zoom - 0.1))}>-</ToolbarButton>
        <span style={zoomTextStyle}>{Math.round(zoom * 100)}%</span>
        <ToolbarButton onClick={() => onZoomChange(Math.min(1.4, zoom + 0.1))}>+</ToolbarButton>
        <ToolbarButton onClick={() => onZoomChange(1)}>100%</ToolbarButton>
        <ToolbarButton onClick={() => onZoomChange(0.55)}>适应</ToolbarButton>
      </div>
    </header>
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

const headerStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(300px, 1fr) auto",
  gap: 10,
  alignItems: "center",
  marginBottom: 12,
  padding: 12,
  background: "rgba(255, 255, 255, 0.86)",
  border: "1px solid #D8DFEA",
  borderRadius: 8,
};

const projectBlockStyle: React.CSSProperties = {
  minWidth: 0,
};

const titleLabelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const captionStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#64748B",
};

const titleInputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid transparent",
  borderRadius: 6,
  padding: "4px 6px",
  fontSize: 22,
  fontWeight: 800,
  color: "#111827",
  background: "transparent",
};

const metaStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginTop: 4,
  fontSize: 12,
  color: "#64748B",
};

const buttonGroupStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 7,
  flexWrap: "wrap",
};

const zoomTextStyle: React.CSSProperties = {
  minWidth: 44,
  textAlign: "center",
  fontSize: 13,
  fontWeight: 700,
  color: "#334155",
};

const buttonStyle: React.CSSProperties = {
  appearance: "none",
  border: "1px solid #CBD5E1",
  borderRadius: 7,
  padding: "8px 11px",
  background: "#FFFFFF",
  color: "#1F2937",
  fontFamily: "Microsoft YaHei, PingFang SC, Noto Sans CJK SC, sans-serif",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};
