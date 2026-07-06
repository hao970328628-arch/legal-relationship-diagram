import type { DiagramEdge, DiagramNode, DiagramProject, Point } from "../../domain/types";
import { EdgeInspector } from "./EdgeInspector";
import { NodeInspector } from "./NodeInspector";
import { ProjectInspector } from "./ProjectInspector";

type InspectorProps = {
  project: DiagramProject;
  selectedNode?: DiagramNode;
  selectedEdge?: DiagramEdge;
  renderedEdgePath?: string;
  selectedEdgePoints?: Point[];
  onProjectChange: (patch: Partial<DiagramProject>) => void;
  onCanvasChange: (patch: Partial<DiagramProject["canvas"]>) => void;
  onNodeChange: (id: string, patch: Partial<DiagramNode>) => void;
  onEdgeChange: (id: string, patch: Partial<DiagramEdge>) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
};

export function Inspector({
  project,
  selectedNode,
  selectedEdge,
  renderedEdgePath,
  selectedEdgePoints,
  onProjectChange,
  onCanvasChange,
  onNodeChange,
  onEdgeChange,
  onDeleteNode,
  onDeleteEdge,
}: InspectorProps) {
  return (
    <aside style={panelStyle}>
      {selectedNode ? (
        <NodeInspector
          node={selectedNode}
          onChange={onNodeChange}
          onDelete={onDeleteNode}
        />
      ) : selectedEdge ? (
        <EdgeInspector
          edge={selectedEdge}
          renderedEdgePath={renderedEdgePath}
          selectedEdgePoints={selectedEdgePoints}
          onChange={onEdgeChange}
          onDelete={onDeleteEdge}
        />
      ) : (
        <ProjectInspector
          project={project}
          onProjectChange={onProjectChange}
          onCanvasChange={onCanvasChange}
        />
      )}
    </aside>
  );
}

const panelStyle: React.CSSProperties = {
  flex: "0 0 340px",
  width: 340,
  maxHeight: "calc(100vh - 128px)",
  overflowY: "auto",
  background: "#FFFFFF",
  border: "1px solid #D8DFEA",
  borderRadius: 8,
  boxShadow: "0 10px 26px rgba(15, 23, 42, 0.08)",
  padding: 14,
  boxSizing: "border-box",
};
