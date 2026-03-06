const DIAGRAM_STORAGE_PREFIX = 'vibelab-survey-diagram:';

export function saveSurveyDiagramSource(source: string) {
  const diagramId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(`${DIAGRAM_STORAGE_PREFIX}${diagramId}`, source);
  return diagramId;
}

export function loadSurveyDiagramSource(diagramId: string) {
  return localStorage.getItem(`${DIAGRAM_STORAGE_PREFIX}${diagramId}`);
}
