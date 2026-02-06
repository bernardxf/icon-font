'use client';

import { useFontPreview } from '@/hooks/use-font-preview';
import { formatCodepoint } from '@/lib/font-generation/codepoint-allocator';
import type { IconGlyph } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { FontGenerationResult } from '@/hooks/use-font-generation';

interface FontPreviewProps {
  result: FontGenerationResult;
  icons: IconGlyph[];
  fontFamily: string;
}

export function FontPreview({ result, icons, fontFamily }: FontPreviewProps) {
  const fontLoaded = useFontPreview(result.fontData.ttfBuffer, fontFamily + '-preview');

  if (!fontLoaded) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        Loading font preview...
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <h3 className="font-medium mb-4">Font Preview - {icons.length} glyphs</h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
          {icons.map(icon => {
            const codepoint = result.fontData.codepointMap.get(icon.id);
            if (!codepoint) return null;
            return (
              <div
                key={icon.id}
                className="flex flex-col items-center justify-center p-3 rounded-lg border bg-card"
              >
                <span
                  className="text-3xl mb-2"
                  style={{ fontFamily: fontFamily + '-preview' }}
                >
                  {String.fromCodePoint(codepoint)}
                </span>
                <span className="text-[10px] text-muted-foreground truncate max-w-full">
                  {icon.name}
                </span>
                <span className="text-[9px] text-muted-foreground/60 font-mono">
                  U+{formatCodepoint(codepoint)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
