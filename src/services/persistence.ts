import type { DiagramProject } from "../domain/types";
import { normalizeDiagramProject } from "./importExportJson";

export const PROJECT_STORAGE_KEY = "legal-relationship-diagram-project";

export function loadProjectDraft(storage: Storage = window.localStorage): DiagramProject | null {
  const saved = storage.getItem(PROJECT_STORAGE_KEY);
  if (!saved) return null;
  try {
    return normalizeDiagramProject(JSON.parse(saved));
  } catch {
    storage.removeItem(PROJECT_STORAGE_KEY);
    return null;
  }
}

export function saveProjectDraft(
  project: DiagramProject,
  storage: Storage = window.localStorage,
) {
  storage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(project, null, 2));
}

export function clearProjectDraft(storage: Storage = window.localStorage) {
  storage.removeItem(PROJECT_STORAGE_KEY);
}
