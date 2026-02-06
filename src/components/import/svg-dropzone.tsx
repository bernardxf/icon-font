'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SvgDropzoneProps {
  onFilesAccepted: (files: File[]) => void;
  importing: boolean;
  compact?: boolean;
}

export function SvgDropzone({ onFilesAccepted, importing, compact }: SvgDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const svgFiles = acceptedFiles.filter(f => f.name.endsWith('.svg') || f.type === 'image/svg+xml');
      if (svgFiles.length > 0) {
        onFilesAccepted(svgFiles);
      }
    },
    [onFilesAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/svg+xml': ['.svg'] },
    disabled: importing,
    multiple: true,
  });

  if (compact) {
    return (
      <div
        {...getRootProps()}
        className={cn(
          'flex items-center gap-2 rounded-lg border-2 border-dashed px-4 py-3 cursor-pointer transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
          importing && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {importing ? 'Importing...' : 'Drop SVGs or click to import'}
        </span>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 cursor-pointer transition-all',
        isDragActive ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-muted-foreground/25 hover:border-primary/50',
        importing && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input {...getInputProps()} />
      <Upload className="h-10 w-10 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-1">
        {isDragActive ? 'Drop SVG files here' : 'Import SVG Icons'}
      </h3>
      <p className="text-sm text-muted-foreground">
        {importing ? 'Processing...' : 'Drag & drop SVG files, or click to browse'}
      </p>
    </div>
  );
}
