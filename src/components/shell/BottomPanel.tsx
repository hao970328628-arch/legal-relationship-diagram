import type { TimelineItem, ValidationIssue } from "../../domain/types";

export type BottomPanelTab = "validation" | "timeline" | "json";

type BottomPanelProps = {
  activeTab: BottomPanelTab;
  issues: ValidationIssue[];
  timelineItems: TimelineItem[];
  jsonText: string;
  onTabChange: (tab: BottomPanelTab) => void;
};

export function BottomPanel({
  activeTab,
  issues,
  timelineItems,
  jsonText,
  onTabChange,
}: BottomPanelProps) {
  return (
    <section style={panelStyle}>
      <div style={tabsStyle}>
        <TabButton active={activeTab === "validation"} onClick={() => onTabChange("validation")}>
          校验问题 {issues.length}
        </TabButton>
        <TabButton active={activeTab === "timeline"} onClick={() => onTabChange("timeline")}>
          时间线
        </TabButton>
        <TabButton active={activeTab === "json"} onClick={() => onTabChange("json")}>
          JSON
        </TabButton>
      </div>
      {activeTab === "validation" && (
        <div style={contentStyle}>
          {issues.length === 0 ? (
            <p style={emptyStyle}>当前没有校验问题。</p>
          ) : (
            issues.map((issue) => (
              <div key={issue.id} style={issueStyle}>
                <span style={badgeStyle(issue.severity)}>{issue.severity}</span>
                <strong>{issue.title}</strong>
                <span>{issue.message}</span>
              </div>
            ))
          )}
        </div>
      )}
      {activeTab === "timeline" && (
        <div style={contentStyle}>
          {timelineItems.map((item, index) => (
            <div key={`${item.date}-${index}`} style={issueStyle}>
              <strong>{item.date}</strong>
              <span>{item.event}</span>
            </div>
          ))}
        </div>
      )}
      {activeTab === "json" && (
        <textarea value={jsonText} readOnly style={jsonStyle} />
      )}
    </section>
  );
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...tabStyle,
        borderColor: active ? "#4B63FF" : "#CBD5E1",
        background: active ? "#E0E7FF" : "#FFFFFF",
      }}
    >
      {children}
    </button>
  );
}

const panelStyle: React.CSSProperties = {
  marginTop: 12,
  background: "#FFFFFF",
  border: "1px solid #D8DFEA",
  borderRadius: 8,
  overflow: "hidden",
};

const tabsStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  padding: 10,
  borderBottom: "1px solid #E2E8F0",
};

const tabStyle: React.CSSProperties = {
  border: "1px solid #CBD5E1",
  borderRadius: 7,
  padding: "7px 10px",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const contentStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  maxHeight: 180,
  overflowY: "auto",
  padding: 10,
};

const emptyStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748B",
  fontSize: 13,
};

const issueStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "92px 150px minmax(0, 1fr)",
  gap: 10,
  alignItems: "start",
  fontSize: 13,
  color: "#334155",
};

const badgeStyle = (severity: ValidationIssue["severity"]): React.CSSProperties => ({
  width: 78,
  borderRadius: 999,
  padding: "2px 8px",
  textAlign: "center",
  background:
    severity === "error" ? "#FEE2E2" : severity === "warning" ? "#FEF3C7" : "#E0F2FE",
  color:
    severity === "error" ? "#B91C1C" : severity === "warning" ? "#92400E" : "#0369A1",
  fontWeight: 800,
  fontSize: 11,
});

const jsonStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 180,
  border: "none",
  padding: 12,
  fontFamily: "Consolas, monospace",
  fontSize: 12,
  resize: "vertical",
  boxSizing: "border-box",
};
