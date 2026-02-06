import { SVGPathData } from 'svg-pathdata';
import type { Transform } from '@/types';

export function applyTransform(pathData: string, transform: Transform, viewBoxSize: number): string {
  try {
    let svgPath = new SVGPathData(pathData);
    const center = viewBoxSize / 2;

    // Apply scale
    if (transform.scale !== 1) {
      svgPath = svgPath
        .translate(-center, -center)
        .scale(transform.scale, transform.scale)
        .translate(center, center);
    }

    // Apply rotation
    if (transform.rotate !== 0) {
      const rad = (transform.rotate * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      svgPath = svgPath
        .translate(-center, -center)
        .matrix(cos, sin, -sin, cos, 0, 0)
        .translate(center, center);
    }

    // Apply flip horizontal
    if (transform.flipH) {
      svgPath = svgPath
        .translate(-center, 0)
        .scale(-1, 1)
        .translate(center, 0);
    }

    // Apply flip vertical
    if (transform.flipV) {
      svgPath = svgPath
        .translate(0, -center)
        .scale(1, -1)
        .translate(0, center);
    }

    // Apply translation
    if (transform.translateX || transform.translateY) {
      svgPath = svgPath.translate(transform.translateX, transform.translateY);
    }

    return svgPath.encode();
  } catch {
    return pathData;
  }
}

export function getDefaultTransform(): Transform {
  return {
    rotate: 0,
    flipH: false,
    flipV: false,
    scale: 1,
    translateX: 0,
    translateY: 0,
  };
}
