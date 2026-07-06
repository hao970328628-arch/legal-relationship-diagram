export type ToastMessage = {
  id: string;
  text: string;
  tone?: "success" | "error" | "info";
};

export function ToastHost({ toasts }: { toasts: ToastMessage[] }) {
  if (!toasts.length) return null;

  return (
    <div style={hostStyle}>
      {toasts.map((toast) => (
        <div key={toast.id} style={toastStyle(toast.tone ?? "info")}>
          {toast.text}
        </div>
      ))}
    </div>
  );
}

const hostStyle: React.CSSProperties = {
  position: "fixed",
  top: 18,
  right: 18,
  display: "grid",
  gap: 8,
  zIndex: 50,
};

const toastStyle = (tone: NonNullable<ToastMessage["tone"]>): React.CSSProperties => ({
  minWidth: 220,
  borderRadius: 8,
  padding: "10px 12px",
  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.18)",
  background: tone === "success" ? "#ECFDF5" : tone === "error" ? "#FEF2F2" : "#EFF6FF",
  border:
    tone === "success"
      ? "1px solid #A7F3D0"
      : tone === "error"
        ? "1px solid #FECACA"
        : "1px solid #BFDBFE",
  color: tone === "success" ? "#047857" : tone === "error" ? "#B91C1C" : "#1D4ED8",
  fontSize: 13,
  fontWeight: 700,
});
