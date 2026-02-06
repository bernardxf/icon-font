'use client';

import { useCallback, useState } from 'react';
import { useProjectStore } from '@/stores/project-store';
import { useIconStore } from '@/stores/icon-store';
import { importProject } from '@/lib/export/json-export';
import { parseFontFile, type ParsedFontFile } from '@/lib/font-parsing/font-file-parser';
import type { IconGlyph } from '@/types';

interface FontImportState {
  importing: boolean;
  error: string | null;
  parsedFont: ParsedFontFile | null;
}

export function useFontImport() {
  const [state, setState] = useState<FontImportState>({
    importing: false,
    error: null,
    parsedFont: null,
  });

  const createProject = useProjectStore(s => s.createProject);
  const updateProject = useProjectStore(s => s.updateProject);
  const switchProject = useProjectStore(s => s.switchProject);
  const loadProjects = useProjectStore(s => s.loadProjects);
  const addIcons = useIconStore(s => s.addIcons);

  const parseFile = useCallback(async (file: File) => {
    setState({ importing: true, error: null, parsedFont: null });

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();

      // JSON project import — use existing importProject and skip preview
      if (ext === 'json') {
        const newProjectId = await importProject(file);
        await loadProjects();
        switchProject(newProjectId);
        setState({ importing: false, error: null, parsedFont: null });
        return 'json-imported' as const;
      }

      // Font file (.ttf, .woff, .woff2, .svg)
      if (ext === 'ttf' || ext === 'woff' || ext === 'woff2' || ext === 'svg') {
        const buffer = await file.arrayBuffer();
        const parsed = await parseFontFile(buffer);

        if (parsed.glyphs.length === 0) {
          setState({ importing: false, error: 'No valid glyphs found in font file.', parsedFont: null });
          return null;
        }

        setState({ importing: false, error: null, parsedFont: parsed });
        return parsed;
      }

      setState({ importing: false, error: `Unsupported file type: .${ext}`, parsedFont: null });
      return null;
    } catch (err) {
      setState({
        importing: false,
        error: err instanceof Error ? err.message : 'Failed to parse file',
        parsedFont: null,
      });
      return null;
    }
  }, [loadProjects, switchProject]);

  const confirmImport = useCallback(async (parsedFont: ParsedFontFile) => {
    setState(s => ({ ...s, importing: true, error: null }));

    try {
      // Create a new project with font metadata
      const project = await createProject(parsedFont.fontFamily);
      await updateProject(project.id, {
        fontName: parsedFont.fontName,
        fontFamily: parsedFont.fontFamily,
        unitsPerEm: parsedFont.unitsPerEm,
        ascender: parsedFont.ascender,
        descender: parsedFont.descender,
      });

      // Add all glyphs as icons
      const iconsToAdd: Omit<IconGlyph, 'id' | 'order' | 'createdAt' | 'updatedAt'>[] =
        parsedFont.glyphs.map(g => ({
          projectId: project.id,
          name: g.name,
          svgContent: g.svgContent,
          pathData: g.pathData,
          viewBox: g.viewBox,
          width: g.width,
          height: g.height,
          unicode: g.unicode,
          tags: [],
        }));

      await addIcons(project.id, iconsToAdd);
      switchProject(project.id);

      setState({ importing: false, error: null, parsedFont: null });
    } catch (err) {
      setState(s => ({
        ...s,
        importing: false,
        error: err instanceof Error ? err.message : 'Failed to import font',
      }));
    }
  }, [createProject, updateProject, addIcons, switchProject]);

  const cancelImport = useCallback(() => {
    setState({ importing: false, error: null, parsedFont: null });
  }, []);

  return {
    ...state,
    parseFile,
    confirmImport,
    cancelImport,
  };
}
