export type DragPanSnapshot = {
  startClientX: number;
  startClientY: number;
  startScrollLeft: number;
  startScrollTop: number;
};

export function getDraggedScrollPosition(
  snapshot: DragPanSnapshot,
  current: { clientX: number; clientY: number },
) {
  return {
    scrollLeft: Math.max(0, snapshot.startScrollLeft - (current.clientX - snapshot.startClientX)),
    scrollTop: Math.max(0, snapshot.startScrollTop - (current.clientY - snapshot.startClientY)),
  };
}
