'use client';

import { useIconStore } from '@/stores/icon-store';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { useProjectStore } from '@/stores/project-store';

export function BottomBar() {
  const iconCount = useIconStore(s => s.icons.length);
  const selectedCount = useWorkspaceStore(s => s.selectedIds.size);
  const project = useProjectStore(s => s.currentProject);

  return (
    <footer className="h-8 border-t bg-muted/30 flex items-center px-4 text-xs text-muted-foreground gap-4 shrink-0">
      <span>{iconCount} icons</span>
      {selectedCount > 0 && <span>{selectedCount} selected</span>}
      {project && (
        <>
          <span className="ml-auto">Font: {project.fontFamily}</span>
          <span>Prefix: {project.prefix}</span>
          <span>UPM: {project.unitsPerEm}</span>
        </>
      )}
    </footer>
  );
}
