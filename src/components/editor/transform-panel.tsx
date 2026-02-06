'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RotateCw, FlipHorizontal2, FlipVertical2, RotateCcw } from 'lucide-react';
import { applyTransform, getDefaultTransform } from '@/lib/svg-processing/svg-transformer';
import type { IconGlyph } from '@/types';

interface TransformPanelProps {
  icon: IconGlyph;
  onUpdate: (updates: Partial<IconGlyph>) => void;
  pendingScale: number;
  onScaleChange: (scale: number) => void;
}

export function TransformPanel({ icon, onUpdate, pendingScale, onScaleChange }: TransformPanelProps) {
  const applyToDraft = useCallback(
    (t: Parameters<typeof applyTransform>[1]) => {
      const [, , , vbSize] = icon.viewBox.split(/[\s,]+/).map(Number);
      const size = vbSize || icon.width;
      const newPathData = applyTransform(icon.pathData, t, size);

      const newSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${icon.viewBox}">
  <path d="${newPathData}" fill="currentColor"/>
</svg>`;

      onUpdate({ pathData: newPathData, svgContent: newSvgContent });
    },
    [icon, onUpdate]
  );

  const handleRotate = useCallback(
    (degrees: number) => {
      applyToDraft({ ...getDefaultTransform(), rotate: degrees });
    },
    [applyToDraft]
  );

  const handleFlipH = useCallback(() => {
    applyToDraft({ ...getDefaultTransform(), flipH: true });
  }, [applyToDraft]);

  const handleFlipV = useCallback(() => {
    applyToDraft({ ...getDefaultTransform(), flipV: true });
  }, [applyToDraft]);

  return (
    <div className="p-4 space-y-4 border-t">
      <h3 className="font-medium text-sm">Transform</h3>

      <div className="space-y-3">
        <Label className="text-xs">Rotate</Label>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-8" onClick={() => handleRotate(-90)}>
            <RotateCcw className="h-4 w-4 mr-1" />
            -90°
          </Button>
          <Button variant="outline" size="sm" className="h-8" onClick={() => handleRotate(90)}>
            <RotateCw className="h-4 w-4 mr-1" />
            90°
          </Button>
          <Button variant="outline" size="sm" className="h-8" onClick={() => handleRotate(180)}>
            180°
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label className="text-xs">Flip</Label>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-8" onClick={handleFlipH}>
            <FlipHorizontal2 className="h-4 w-4 mr-1" />
            Horizontal
          </Button>
          <Button variant="outline" size="sm" className="h-8" onClick={handleFlipV}>
            <FlipVertical2 className="h-4 w-4 mr-1" />
            Vertical
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Scale</Label>
          <span className="text-xs text-muted-foreground">{Math.round(pendingScale * 100)}%</span>
        </div>
        <Slider
          value={[pendingScale]}
          onValueChange={([v]) => onScaleChange(v)}
          min={0.1}
          max={2}
          step={0.05}
          className="w-full"
        />
      </div>
    </div>
  );
}
