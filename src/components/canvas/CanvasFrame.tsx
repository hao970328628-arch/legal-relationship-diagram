import { useRef, useState } from "react";
import { getDraggedScrollPosition, type DragPanSnapshot } from "../../utils/pan";

type CanvasFrameProps = {
  width: number;
  zoom: number;
  panEnabled: boolean;
  children: React.ReactNode;
};

export function CanvasFrame({ width, zoom, panEnabled, children }: CanvasFrameProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const dragSnapshotRef = useRef<DragPanSnapshot | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function beginPan(event: React.PointerEvent<HTMLDivElement>) {
    if (!panEnabled || event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("button,input,textarea,select")) return;
    const element = scrollRef.current;
    if (!element) return;

    dragSnapshotRef.current = {
      startClientX: event.clientX,
      startClientY: event.clientY,
      startScrollLeft: element.scrollLeft,
      startScrollTop: element.scrollTop,
    };
    setIsDragging(true);
    element.setPointerCapture(event.pointerId);
  }

  function movePan(event: React.PointerEvent<HTMLDivElement>) {
    const snapshot = dragSnapshotRef.current;
    const element = scrollRef.current;
    if (!snapshot || !element) return;

    const next = getDraggedScrollPosition(snapshot, event);
    element.scrollLeft = next.scrollLeft;
    element.scrollTop = next.scrollTop;
  }

  function endPan(event: React.PointerEvent<HTMLDivElement>) {
    const element = scrollRef.current;
    dragSnapshotRef.current = null;
    setIsDragging(false);
    if (element?.hasPointerCapture(event.pointerId)) {
      element.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <div
      data-testid="canvas-frame"
      ref={scrollRef}
      onPointerDown={beginPan}
      onPointerMove={movePan}
      onPointerUp={endPan}
      onPointerCancel={endPan}
      style={{
        ...scrollStyle,
        cursor: panEnabled ? (isDragging ? "grabbing" : "grab") : "default",
      }}
    >
      <div
        style={{
          width: width * zoom,
          background: "#FFFFFF",
          borderRadius: 8,
          boxShadow: "0 12px 34px rgba(15, 23, 42, 0.12)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

const scrollStyle: React.CSSProperties = {
  overflow: "auto",
  paddingBottom: 12,
  flex: "1 1 auto",
  minWidth: 0,
  maxHeight: "calc(100vh - 260px)",
  borderRadius: 8,
  userSelect: "none",
  touchAction: "none",
  overscrollBehavior: "contain",
};
