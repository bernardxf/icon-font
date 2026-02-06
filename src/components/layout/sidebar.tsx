'use client';

import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LayoutGrid, Edit, Eye, Package, Settings, PanelLeftClose, PanelLeft } from 'lucide-react';
import type { EditorTab } from '@/types';

const navItems: { tab: EditorTab; icon: React.ReactNode; label: string }[] = [
  { tab: 'icons', icon: <LayoutGrid className="h-4 w-4" />, label: 'Icons' },
  { tab: 'editor', icon: <Edit className="h-4 w-4" />, label: 'Editor' },
  { tab: 'preview', icon: <Eye className="h-4 w-4" />, label: 'Preview' },
  { tab: 'generate', icon: <Package className="h-4 w-4" />, label: 'Generate' },
];

export function Sidebar() {
  const { activeTab, setActiveTab, sidebarOpen, setSidebarOpen } = useWorkspaceStore();

  return (
    <div
      className={cn(
        'border-r bg-muted/30 flex flex-col transition-all shrink-0',
        sidebarOpen ? 'w-48' : 'w-12'
      )}
    >
      <div className="flex items-center justify-end p-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        {navItems.map(item => (
          <Button
            key={item.tab}
            variant={activeTab === item.tab ? 'secondary' : 'ghost'}
            size="sm"
            className={cn(
              'w-full justify-start',
              !sidebarOpen && 'justify-center px-0'
            )}
            onClick={() => setActiveTab(item.tab)}
          >
            {item.icon}
            {sidebarOpen && <span className="ml-2">{item.label}</span>}
          </Button>
        ))}
      </nav>

      <Separator />

      <div className="p-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn('w-full justify-start', !sidebarOpen && 'justify-center px-0')}
          onClick={() => setActiveTab('preview')}
        >
          <Settings className="h-4 w-4" />
          {sidebarOpen && <span className="ml-2">Settings</span>}
        </Button>
      </div>
    </div>
  );
}
