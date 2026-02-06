import { saveAs } from 'file-saver';
import { db } from '@/lib/storage/db';
import type { IconGlyph, Project } from '@/types';

interface ProjectExport {
  version: 1;
  project: Project;
  icons: IconGlyph[];
  exportedAt: string;
}

export async function exportProject(projectId: string): Promise<void> {
  const project = await db.projects.get(projectId);
  if (!project) throw new Error('Project not found');

  const icons = await db.icons.where('projectId').equals(projectId).sortBy('order');

  const data: ProjectExport = {
    version: 1,
    project,
    icons,
    exportedAt: new Date().toISOString(),
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  saveAs(blob, `${project.fontName}-project.json`);
}

export async function importProject(file: File): Promise<string> {
  const text = await file.text();
  const data: ProjectExport = JSON.parse(text);

  if (data.version !== 1) {
    throw new Error('Unsupported project file version');
  }

  // Generate new IDs to avoid conflicts
  const { v4: uuid } = await import('uuid');
  const newProjectId = uuid();
  const now = Date.now();

  const project: Project = {
    ...data.project,
    id: newProjectId,
    name: `${data.project.name} (imported)`,
    createdAt: now,
    updatedAt: now,
  };

  const icons: IconGlyph[] = data.icons.map(icon => ({
    ...icon,
    id: uuid(),
    projectId: newProjectId,
    createdAt: now,
    updatedAt: now,
  }));

  await db.projects.add(project);
  await db.icons.bulkAdd(icons);

  return newProjectId;
}
