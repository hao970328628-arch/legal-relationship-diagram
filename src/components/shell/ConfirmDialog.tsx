export type ConfirmRequest = {
  title: string;
  message: string;
  confirmText?: string;
};

type ConfirmDialogProps = {
  request: ConfirmRequest | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({ request, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!request) return null;

  return (
    <div style={overlayStyle}>
      <div style={dialogStyle}>
        <h2 style={titleStyle}>{request.title}</h2>
        <p style={messageStyle}>{request.message}</p>
        <div style={actionsStyle}>
          <button type="button" onClick={onCancel} style={secondaryButtonStyle}>
            取消
          </button>
          <button type="button" onClick={onConfirm} style={dangerButtonStyle}>
            {request.confirmText ?? "确认"}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  display: "grid",
  placeItems: "center",
  background: "rgba(15, 23, 42, 0.28)",
  zIndex: 40,
};

const dialogStyle: React.CSSProperties = {
  width: 380,
  background: "#FFFFFF",
  borderRadius: 8,
  boxShadow: "0 22px 60px rgba(15, 23, 42, 0.26)",
  padding: 18,
};

const titleStyle: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: 18,
};

const messageStyle: React.CSSProperties = {
  margin: 0,
  lineHeight: 1.6,
  color: "#475569",
  fontSize: 14,
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 18,
};

const secondaryButtonStyle: React.CSSProperties = {
  border: "1px solid #CBD5E1",
  borderRadius: 7,
  padding: "8px 12px",
  background: "#FFFFFF",
  fontWeight: 700,
  cursor: "pointer",
};

const dangerButtonStyle: React.CSSProperties = {
  ...secondaryButtonStyle,
  borderColor: "#FCA5A5",
  background: "#FEF2F2",
  color: "#B91C1C",
};
