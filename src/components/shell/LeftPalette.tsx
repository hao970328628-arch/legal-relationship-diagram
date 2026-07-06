import { diagramTemplates } from "../../domain/templates";
import { nodeKindOptions, relationKindOptions } from "../../domain/legalSchema";
import type { LegalRelationKind, NodeKind } from "../../domain/types";

type LeftPaletteProps = {
  relationCreateFrom?: string;
  selectedRelationKind: LegalRelationKind;
  onAddNode: (kind: NodeKind) => void;
  onRelationKindChange: (kind: LegalRelationKind) => void;
  onStartRelation: () => void;
  onCancelRelation: () => void;
};

export function LeftPalette({
  relationCreateFrom,
  selectedRelationKind,
  onAddNode,
  onRelationKindChange,
  onStartRelation,
  onCancelRelation,
}: LeftPaletteProps) {
  return (
    <aside style={paletteStyle}>
      <section>
        <h2 style={sectionTitleStyle}>元素库</h2>
        <div style={gridStyle}>
          {nodeKindOptions.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onAddNode(item.value)}
              style={paletteButtonStyle}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>关系线</h2>
        <label style={labelStyle}>
          <span>关系类型</span>
          <select
            value={selectedRelationKind}
            onChange={(event) => onRelationKindChange(event.target.value as LegalRelationKind)}
            style={selectStyle}
          >
            {relationKindOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        {relationCreateFrom ? (
          <button type="button" onClick={onCancelRelation} style={activeRelationStyle}>
            起点：{relationCreateFrom}
          </button>
        ) : (
          <button type="button" onClick={onStartRelation} style={paletteButtonStyle}>
            创建关系
          </button>
        )}
        <p style={hintStyle}>
          点击“创建关系”后，先点起点节点，再点终点节点。
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>模板库</h2>
        {diagramTemplates.map((template) => (
          <div key={template.id} style={templateStyle}>
            <strong>{template.title}</strong>
            <span>{template.description}</span>
          </div>
        ))}
      </section>
    </aside>
  );
}

const paletteStyle: React.CSSProperties = {
  flex: "0 0 230px",
  width: 230,
  background: "#FFFFFF",
  border: "1px solid #D8DFEA",
  borderRadius: 8,
  padding: 12,
  boxShadow: "0 10px 26px rgba(15, 23, 42, 0.08)",
};

const sectionStyle: React.CSSProperties = {
  marginTop: 18,
};

const sectionTitleStyle: React.CSSProperties = {
  margin: "0 0 10px",
  fontSize: 15,
  lineHeight: 1.3,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
};

const paletteButtonStyle: React.CSSProperties = {
  border: "1px solid #CBD5E1",
  borderRadius: 7,
  padding: "9px 8px",
  background: "#F8FAFC",
  color: "#1F2937",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const activeRelationStyle: React.CSSProperties = {
  ...paletteButtonStyle,
  width: "100%",
  background: "#E0E7FF",
  borderColor: "#4B63FF",
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 9,
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #CBD5E1",
  borderRadius: 7,
  padding: "8px",
  fontSize: 13,
};

const hintStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#64748B",
  fontSize: 12,
  lineHeight: 1.55,
};

const templateStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 3,
  padding: "8px 0",
  borderTop: "1px solid #E2E8F0",
  fontSize: 12,
  color: "#64748B",
};
