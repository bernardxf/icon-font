'use client';

import { useIconStore } from '@/stores/icon-store';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Grid3X3, LayoutGrid, Square } from 'lucide-react';
import type { ViewMode } from '@/types';

const viewModes: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
  { mode: 'small', icon: <Grid3X3 className="h-4 w-4" />, label: 'Small' },
  { mode: 'medium', icon: <LayoutGrid className="h-4 w-4" />, label: 'Medium' },
  { mode: 'large', icon: <Square className="h-4 w-4" />, label: 'Large' },
];

export function SearchToolbar() {
  const searchQuery = useIconStore(s => s.searchQuery);
  const setSearchQuery = useIconStore(s => s.setSearchQuery);
  const icons = useIconStore(s => s.icons);
  const { viewMode, setViewMode } = useWorkspaceStore();

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search icons..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-8 h-8"
        />
      </div>
      <span className="text-sm text-muted-foreground">{icons.length} icons</span>
      <div className="flex items-center gap-0.5 ml-auto">
        {viewModes.map(v => (
          <Button
            key={v.mode}
            variant={viewMode === v.mode ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode(v.mode)}
            title={v.label}
          >
            {v.icon}
          </Button>
        ))}
      </div>
    </div>
  );
}
