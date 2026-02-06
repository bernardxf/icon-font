import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { db } from '@/lib/storage/db';
import type { IconGlyph } from '@/types';

interface IconStore {
  icons: IconGlyph[];
  loading: boolean;
  searchQuery: string;

  loadIcons: (projectId: string) => Promise<void>;
  addIcons: (projectId: string, icons: Omit<IconGlyph, 'id' | 'order' | 'createdAt' | 'updatedAt'>[]) => Promise<void>;
  updateIcon: (id: string, updates: Partial<IconGlyph>) => Promise<void>;
  deleteIcons: (ids: string[]) => Promise<void>;
  reorderIcons: (orderedIds: string[]) => Promise<void>;
  setSearchQuery: (query: string) => void;
  getFilteredIcons: () => IconGlyph[];
  getNextOrder: () => number;
}

export const useIconStore = create<IconStore>((set, get) => ({
  icons: [],
  loading: false,
  searchQuery: '',

  loadIcons: async (projectId: string) => {
    set({ loading: true });
    const icons = await db.icons.where('projectId').equals(projectId).sortBy('order');
    set({ icons, loading: false });
  },

  addIcons: async (projectId, newIcons) => {
    const currentMax = get().getNextOrder();
    const now = Date.now();
    const iconsToAdd: IconGlyph[] = newIcons.map((icon, i) => ({
      ...icon,
      id: uuid(),
      order: currentMax + i,
      createdAt: now,
      updatedAt: now,
    }));
    await db.icons.bulkAdd(iconsToAdd);
    const icons = await db.icons.where('projectId').equals(projectId).sortBy('order');
    set({ icons });
  },

  updateIcon: async (id, updates) => {
    await db.icons.update(id, { ...updates, updatedAt: Date.now() });
    const currentIcons = get().icons;
    const projectId = currentIcons[0]?.projectId;
    if (projectId) {
      const icons = await db.icons.where('projectId').equals(projectId).sortBy('order');
      set({ icons });
    }
  },

  deleteIcons: async (ids) => {
    await db.icons.bulkDelete(ids);
    set({ icons: get().icons.filter(i => !ids.includes(i.id)) });
  },

  reorderIcons: async (orderedIds) => {
    const updates = orderedIds.map((id, index) => ({ key: id, changes: { order: index } }));
    for (const update of updates) {
      await db.icons.update(update.key, update.changes);
    }
    const icons = get().icons.slice().sort((a, b) => {
      const aIdx = orderedIds.indexOf(a.id);
      const bIdx = orderedIds.indexOf(b.id);
      return aIdx - bIdx;
    });
    icons.forEach((icon, i) => { icon.order = i; });
    set({ icons });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  getFilteredIcons: () => {
    const { icons, searchQuery } = get();
    if (!searchQuery) return icons;
    const q = searchQuery.toLowerCase();
    return icons.filter(
      icon =>
        icon.name.toLowerCase().includes(q) ||
        icon.tags.some(t => t.toLowerCase().includes(q))
    );
  },

  getNextOrder: () => {
    const { icons } = get();
    return icons.length > 0 ? Math.max(...icons.map(i => i.order)) + 1 : 0;
  },
}));
