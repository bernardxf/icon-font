import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { db } from '@/lib/storage/db';
import type { Project, FontSettings } from '@/types';

interface ProjectStore {
  projects: Project[];
  currentProjectId: string | null;
  currentProject: Project | null;
  loading: boolean;

  loadProjects: () => Promise<void>;
  createProject: (name?: string) => Promise<Project>;
  switchProject: (id: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  updateFontSettings: (settings: Partial<FontSettings>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

const DEFAULT_PROJECT: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'My Icon Font',
  fontName: 'my-icons',
  fontFamily: 'my-icons',
  prefix: 'icon',
  unitsPerEm: 1024,
  ascender: 1024,
  descender: 0,
  baselineOffset: 0,
};

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProjectId: null,
  currentProject: null,
  loading: true,

  loadProjects: async () => {
    const projects = await db.projects.toArray();
    if (projects.length === 0) {
      const project = await get().createProject();
      set({ projects: [project], currentProjectId: project.id, currentProject: project, loading: false });
    } else {
      const savedId = localStorage.getItem('currentProjectId');
      const currentId = savedId && projects.find(p => p.id === savedId) ? savedId : projects[0].id;
      set({
        projects,
        currentProjectId: currentId,
        currentProject: projects.find(p => p.id === currentId) || projects[0],
        loading: false,
      });
    }
  },

  createProject: async (name?: string) => {
    const now = Date.now();
    const project: Project = {
      id: uuid(),
      ...DEFAULT_PROJECT,
      ...(name ? { name, fontName: name.toLowerCase().replace(/\s+/g, '-'), fontFamily: name.toLowerCase().replace(/\s+/g, '-') } : {}),
      createdAt: now,
      updatedAt: now,
    };
    await db.projects.add(project);
    const projects = await db.projects.toArray();
    set({ projects, currentProjectId: project.id, currentProject: project });
    localStorage.setItem('currentProjectId', project.id);
    return project;
  },

  switchProject: (id: string) => {
    const project = get().projects.find(p => p.id === id);
    if (project) {
      set({ currentProjectId: id, currentProject: project });
      localStorage.setItem('currentProjectId', id);
    }
  },

  updateProject: async (id: string, updates: Partial<Project>) => {
    await db.projects.update(id, { ...updates, updatedAt: Date.now() });
    const projects = await db.projects.toArray();
    const currentProject = projects.find(p => p.id === get().currentProjectId) || null;
    set({ projects, currentProject });
  },

  updateFontSettings: async (settings: Partial<FontSettings>) => {
    const { currentProjectId } = get();
    if (!currentProjectId) return;
    await get().updateProject(currentProjectId, settings);
  },

  deleteProject: async (id: string) => {
    await db.projects.delete(id);
    await db.icons.where('projectId').equals(id).delete();
    const projects = await db.projects.toArray();
    if (projects.length === 0) {
      const project = await get().createProject();
      set({ projects: [project], currentProjectId: project.id, currentProject: project });
    } else if (get().currentProjectId === id) {
      set({ projects, currentProjectId: projects[0].id, currentProject: projects[0] });
      localStorage.setItem('currentProjectId', projects[0].id);
    } else {
      set({ projects });
    }
  },
}));
