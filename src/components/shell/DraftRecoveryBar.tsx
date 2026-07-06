type DraftRecoveryBarProps = {
  title: string;
  onRestore: () => void;
  onDismiss: () => void;
};

export function DraftRecoveryBar({ title, onRestore, onDismiss }: DraftRecoveryBarProps) {
  return (
    <div style={barStyle}>
      <span>检测到本地草稿：{title}</span>
      <div style={actionsStyle}>
        <button type="button" onClick={onRestore} style={buttonStyle}>
          恢复
        </button>
        <button type="button" onClick={onDismiss} style={buttonStyle}>
          忽略
        </button>
      </div>
    </div>
  );
}

const barStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 10,
  padding: "9px 12px",
  border: "1px solid #BFDBFE",
  borderRadius: 8,
  background: "#EFF6FF",
  color: "#1D4ED8",
  fontSize: 13,
  fontWeight: 700,
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
};

const buttonStyle: React.CSSProperties = {
  border: "1px solid #93C5FD",
  borderRadius: 7,
  padding: "5px 9px",
  background: "#FFFFFF",
  color: "#1D4ED8",
  fontWeight: 700,
  cursor: "pointer",
};
