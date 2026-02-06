import type { ParsedSvg } from './svg-parser';

export function normalizeSvg(parsed: ParsedSvg): ParsedSvg {
  const [, , vbWidth, vbHeight] = parsed.viewBox.split(/[\s,]+/).map(Number);
  const w = vbWidth || parsed.width;
  const h = vbHeight || parsed.height;

  // Normalize to a square viewBox
  const size = Math.max(w, h);
  const offsetX = (size - w) / 2;
  const offsetY = (size - h) / 2;

  const normalizedViewBox = `0 0 ${size} ${size}`;

  // Build normalized SVG content
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${normalizedViewBox}">
  <g transform="translate(${offsetX}, ${offsetY})">
    <path d="${parsed.pathData}" fill="currentColor"/>
  </g>
</svg>`;

  return {
    ...parsed,
    viewBox: normalizedViewBox,
    width: size,
    height: size,
    svgContent,
  };
}
