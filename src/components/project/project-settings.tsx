'use client';

import { useProjectStore } from '@/stores/project-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { exportProject, importProject } from '@/lib/export/json-export';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCallback, useRef } from 'react';

export function ProjectSettings() {
  const { currentProject, currentProjectId, updateFontSettings, loadProjects } = useProjectStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(async () => {
    if (!currentProjectId) return;
    await exportProject(currentProjectId);
  }, [currentProjectId]);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importProject(file);
      await loadProjects();
    } catch (err) {
      console.error('Import failed:', err);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [loadProjects]);

  if (!currentProject) return null;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <h3 className="font-medium">Font Settings</h3>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="fontName" className="text-xs">Font Name</Label>
            <Input
              id="fontName"
              value={currentProject.fontName}
              onChange={e => updateFontSettings({ fontName: e.target.value })}
              className="h-8"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fontFamily" className="text-xs">Font Family</Label>
            <Input
              id="fontFamily"
              value={currentProject.fontFamily}
              onChange={e => updateFontSettings({ fontFamily: e.target.value })}
              className="h-8"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prefix" className="text-xs">CSS Prefix</Label>
            <Input
              id="prefix"
              value={currentProject.prefix}
              onChange={e => updateFontSettings({ prefix: e.target.value })}
              className="h-8"
            />
          </div>
        </div>

        <Separator />

        <h3 className="font-medium">Font Metrics</h3>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="unitsPerEm" className="text-xs">Units Per Em</Label>
            <Input
              id="unitsPerEm"
              type="number"
              value={currentProject.unitsPerEm}
              onChange={e => updateFontSettings({ unitsPerEm: parseInt(e.target.value) || 1024 })}
              className="h-8"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ascender" className="text-xs">Ascender</Label>
            <Input
              id="ascender"
              type="number"
              value={currentProject.ascender}
              onChange={e => updateFontSettings({ ascender: parseInt(e.target.value) || 1024 })}
              className="h-8"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descender" className="text-xs">Descender</Label>
            <Input
              id="descender"
              type="number"
              value={currentProject.descender}
              onChange={e => updateFontSettings({ descender: parseInt(e.target.value) || 0 })}
              className="h-8"
            />
          </div>
        </div>

        <Separator />

        <h3 className="font-medium">Project Import/Export</h3>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>
    </ScrollArea>
  );
}
