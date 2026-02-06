'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { useIconStore } from '@/stores/icon-store';
import { IconProperties } from './icon-properties';
import { TransformPanel } from './transform-panel';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';
import { applyTransform, getDefaultTransform } from '@/lib/svg-processing/svg-transformer';
import type { IconGlyph } from '@/types';

export function IconEditor() {
  const editingIconId = useWorkspaceStore(s => s.editingIconId);
  const setEditingIconId = useWorkspaceStore(s => s.setEditingIconId);
  const icons = useIconStore(s => s.icons);
  const updateIcon = useIconStore(s => s.updateIcon);

  const savedIcon = icons.find(i => i.id === editingIconId);

  const [draft, setDraft] = useState<IconGlyph | null>(null);
  const [pendingScale, setPendingScale] = useState(1);

  // Initialize or reset draft when the saved icon changes identity
  useEffect(() => {
    if (savedIcon) {
      setDraft({ ...savedIcon });
      setPendingScale(1);
    } else {
      setDraft(null);
    }
  }, [savedIcon?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const isDirty = useMemo(() => {
    if (!draft || !savedIcon) return false;
    if (pendingScale !== 1) return true;
    return (
      draft.name !== savedIcon.name ||
      draft.unicode !== savedIcon.unicode ||
      draft.ligature !== savedIcon.ligature ||
      draft.pathData !== savedIcon.pathData ||
      draft.svgContent !== savedIcon.svgContent ||
      JSON.stringify(draft.tags) !== JSON.stringify(savedIcon.tags)
    );
  }, [draft, savedIcon, pendingScale]);

  const handleUpdateDraft = useCallback((updates: Partial<IconGlyph>) => {
    setDraft(prev => prev ? { ...prev, ...updates } : prev);
  }, []);

  const handleSave = useCallback(async () => {
    if (!draft || !savedIcon) return;

    let finalDraft = { ...draft };

    // Bake pending scale into pathData if needed
    if (pendingScale !== 1) {
      const [, , , vbSize] = finalDraft.viewBox.split(/[\s,]+/).map(Number);
      const size = vbSize || finalDraft.width;
      const t = { ...getDefaultTransform(), scale: pendingScale };
      const newPathData = applyTransform(finalDraft.pathData, t, size);
      const newSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${finalDraft.viewBox}">
  <path d="${newPathData}" fill="currentColor"/>
</svg>`;
      finalDraft = { ...finalDraft, pathData: newPathData, svgContent: newSvgContent };
    }

    await updateIcon(savedIcon.id, {
      name: finalDraft.name,
      unicode: finalDraft.unicode,
      ligature: finalDraft.ligature,
      tags: finalDraft.tags,
      pathData: finalDraft.pathData,
      svgContent: finalDraft.svgContent,
    });

    setPendingScale(1);
  }, [draft, savedIcon, pendingScale, updateIcon]);

  const handleReset = useCallback(() => {
    if (!savedIcon) return;
    setDraft({ ...savedIcon });
    setPendingScale(1);
  }, [savedIcon]);

  if (!savedIcon || !draft) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>Select an icon to edit</p>
        <p className="text-sm mt-1">Double-click an icon in the grid</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <Button variant="ghost" size="sm" onClick={() => setEditingIconId(null)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h2 className="font-medium">Edit: {draft.name}</h2>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!isDirty}
            className="gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!isDirty}
            className="gap-1"
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SVG Preview */}
        <div className="flex-1 flex items-center justify-center p-8 bg-muted/30">
          <div className="relative w-64 h-64 rounded-lg border bg-background shadow-sm overflow-hidden">
            {/* Grid overlay */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 32" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4" />
            </svg>
            <div
              className="absolute inset-4 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
              style={pendingScale !== 1 ? { transform: `scale(${pendingScale})` } : undefined}
              dangerouslySetInnerHTML={{ __html: draft.svgContent }}
            />
          </div>
        </div>

        {/* Properties sidebar */}
        <div className="w-80 border-l overflow-y-auto">
          <IconProperties icon={draft} onUpdate={handleUpdateDraft} />
          <TransformPanel icon={draft} onUpdate={handleUpdateDraft} pendingScale={pendingScale} onScaleChange={setPendingScale} />
        </div>
      </div>
    </div>
  );
}
