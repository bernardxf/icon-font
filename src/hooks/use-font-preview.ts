'use client';

import { useEffect, useRef, useState } from 'react';

export function useFontPreview(fontBuffer: ArrayBuffer | null, fontFamily: string) {
  const [fontLoaded, setFontLoaded] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!fontBuffer) {
      setFontLoaded(false);
      return;
    }

    // Clean up previous blob URL
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }

    const blob = new Blob([fontBuffer], { type: 'font/ttf' });
    const url = URL.createObjectURL(blob);
    blobUrlRef.current = url;

    const fontFace = new FontFace(fontFamily, `url(${url})`);

    fontFace.load().then(loadedFace => {
      document.fonts.add(loadedFace);
      setFontLoaded(true);
    }).catch(() => {
      setFontLoaded(false);
    });

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [fontBuffer, fontFamily]);

  return fontLoaded;
}
