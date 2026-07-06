export function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label style={fieldLabelStyle}>
      <span>{label}</span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(numberOr(event.target.value, 0))}
        style={inputStyle}
      />
    </label>
  );
}

export function numberOr(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const panelTitleStyle: React.CSSProperties = {
  margin: "0 0 14px",
  fontSize: 18,
  lineHeight: 1.35,
};

export const fieldLabelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 13,
  fontWeight: 700,
  color: "#1F2937",
  marginBottom: 12,
};

export const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #CBD5E1",
  borderRadius: 7,
  padding: "8px 9px",
  fontFamily: "Microsoft YaHei, PingFang SC, Noto Sans CJK SC, sans-serif",
  fontSize: 14,
  color: "#1F2937",
  background: "#FFFFFF",
};

export const readOnlyInputStyle: React.CSSProperties = {
  ...inputStyle,
  color: "#64748B",
  background: "#F8FAFC",
};

export const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 88,
  resize: "vertical",
  lineHeight: 1.45,
};

export const twoColumnStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

export const checkboxStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  margin: "4px 0 14px",
  fontSize: 14,
  fontWeight: 600,
};

export const buttonStyle: React.CSSProperties = {
  appearance: "none",
  border: "1px solid #CBD5E1",
  borderRadius: 7,
  padding: "9px 12px",
  background: "#FFFFFF",
  color: "#1F2937",
  fontFamily: "Microsoft YaHei, PingFang SC, Noto Sans CJK SC, sans-serif",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};

export const dangerButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  width: "100%",
  borderColor: "#FCA5A5",
  background: "#FEF2F2",
  color: "#B91C1C",
};
