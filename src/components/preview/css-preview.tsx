'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Check } from 'lucide-react';

interface CssPreviewProps {
  css: string;
}

export function CssPreview({ css }: CssPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [css]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h3 className="font-medium text-sm">Generated CSS</h3>
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <pre className="p-4 text-xs font-mono whitespace-pre-wrap text-muted-foreground">
          {css}
        </pre>
      </ScrollArea>
    </div>
  );
}
