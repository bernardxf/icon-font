'use client';

import { useCallback, useRef } from 'react';
import { FileUp, AlertCircle } from 'lucide-react';
import { useFontImport } from '@/hooks/use-font-import';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface OpenFontDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OpenFontDialog({ open, onOpenChange }: OpenFontDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importing, error, parsedFont, parseFile, confirmImport, cancelImport } = useFontImport();

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const result = await parseFile(file);
      // JSON imports complete immediately — close dialog
      if (result === 'json-imported') {
        onOpenChange(false);
      }
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [parseFile, onOpenChange]
  );

  const handleConfirm = useCallback(async () => {
    if (!parsedFont) return;
    await confirmImport(parsedFont);
    onOpenChange(false);
  }, [parsedFont, confirmImport, onOpenChange]);

  const handleCancel = useCallback(() => {
    cancelImport();
    onOpenChange(false);
  }, [cancelImport, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Open Font File</DialogTitle>
          <DialogDescription>
            Import an existing icon font (.ttf, .woff, .woff2, .svg) or a project file (.json).
          </DialogDescription>
        </DialogHeader>

        {!parsedFont && (
          <div className="flex flex-col items-center gap-4 py-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".ttf,.woff,.woff2,.svg,.json"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="outline"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="gap-2"
            >
              <FileUp className="h-4 w-4" />
              {importing ? 'Parsing...' : 'Choose File'}
            </Button>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {parsedFont && (
          <>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <span className="text-muted-foreground">Font Family</span>
                <span className="font-medium">{parsedFont.fontFamily}</span>
                <span className="text-muted-foreground">Units Per Em</span>
                <span className="font-medium">{parsedFont.unitsPerEm}</span>
                <span className="text-muted-foreground">Ascender</span>
                <span className="font-medium">{parsedFont.ascender}</span>
                <span className="text-muted-foreground">Descender</span>
                <span className="font-medium">{parsedFont.descender}</span>
                <span className="text-muted-foreground">Glyphs</span>
                <span className="font-medium">{parsedFont.glyphs.length}</span>
              </div>

              {parsedFont.glyphs.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-2">Preview</p>
                  <div className="grid grid-cols-10 gap-1 max-h-40 overflow-y-auto rounded-md border p-2">
                    {parsedFont.glyphs.slice(0, 60).map((g, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded bg-muted/50 p-1 flex items-center justify-center"
                        title={`${g.name} (U+${g.unicode.toString(16).padStart(4, '0').toUpperCase()})`}
                      >
                        <svg
                          viewBox={g.viewBox}
                          className="w-full h-full"
                          dangerouslySetInnerHTML={{ __html: `<path d="${g.pathData}" fill="currentColor"/>` }}
                        />
                      </div>
                    ))}
                  </div>
                  {parsedFont.glyphs.length > 60 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ...and {parsedFont.glyphs.length - 60} more
                    </p>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleCancel} disabled={importing}>
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={importing}>
                {importing ? 'Importing...' : `Import ${parsedFont.glyphs.length} Glyphs`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
