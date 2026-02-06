'use client';

import { useState } from 'react';
import { Type, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectSwitcher } from '@/components/project/project-switcher';
import { OpenFontDialog } from '@/components/import/open-font-dialog';

export function Header() {
  const [fontDialogOpen, setFontDialogOpen] = useState(false);

  return (
    <header className="h-14 border-b bg-background flex items-center px-4 gap-4 shrink-0">
      <div className="flex items-center gap-2">
        <Type className="h-5 w-5 text-primary" />
        <h1 className="font-semibold text-lg">Icon Font Generator</h1>
      </div>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setFontDialogOpen(true)}>
        <FolderOpen className="h-4 w-4" />
        Open Font
      </Button>
      <div className="ml-auto">
        <ProjectSwitcher />
      </div>
      <OpenFontDialog open={fontDialogOpen} onOpenChange={setFontDialogOpen} />
    </header>
  );
}
