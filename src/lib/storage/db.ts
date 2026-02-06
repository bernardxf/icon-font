import Dexie, { type Table } from 'dexie';
import type { IconGlyph, Project } from '@/types';

export class IconFontDB extends Dexie {
  icons!: Table<IconGlyph, string>;
  projects!: Table<Project, string>;

  constructor() {
    super('IconFontGenDB');
    this.version(1).stores({
      icons: 'id, projectId, name, unicode, order, [projectId+order]',
      projects: 'id, name, createdAt',
    });
  }
}

export const db = new IconFontDB();
