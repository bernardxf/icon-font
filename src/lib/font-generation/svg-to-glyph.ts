import opentype, { type Path } from 'opentype.js';
import { SVGPathData } from 'svg-pathdata';
import { SVGPathDataTransformer } from 'svg-pathdata';

export function svgPathToGlyphPath(
  pathData: string,
  viewBox: string,
  unitsPerEm: number,
  ascender: number
): Path {
  const path = new opentype.Path();

  if (!pathData || !pathData.trim()) return path;

  const [, , vbWidth, vbHeight] = viewBox.split(/[\s,]+/).map(Number);
  const size = Math.max(vbWidth || 1024, vbHeight || 1024);
  const scale = unitsPerEm / size;

  try {
    // Normalize all command types to the 5 basics (M, L, C, Q, Z)
    // before transforms so converters have full path context:
    //   S → C  (smooth cubic needs prior control point)
    //   T → Q  (smooth quad needs prior control point)
    //   H/V → L (needs current position for missing axis)
    //   A → C  (arc-to-cubic needs current position as start)
    const normalized = new SVGPathData(pathData)
      .toAbs()
      .transform(SVGPathDataTransformer.NORMALIZE_ST())
      .transform(SVGPathDataTransformer.NORMALIZE_HVZ())
      .transform(SVGPathDataTransformer.A_TO_C());

    // Scale and Y-flip: in fonts, Y goes up; in SVG, Y goes down
    const transformed = normalized
      .scale(scale, scale)
      .translate(0, -ascender)
      .scale(1, -1);

    // Convert to opentype path commands
    for (const cmd of transformed.commands) {
      switch (cmd.type) {
        case SVGPathData.MOVE_TO:
          path.moveTo(cmd.x, cmd.y);
          break;
        case SVGPathData.LINE_TO:
          path.lineTo(cmd.x, cmd.y);
          break;
        case SVGPathData.CURVE_TO:
          path.curveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
          break;
        case SVGPathData.QUAD_TO:
          path.quadTo(cmd.x1, cmd.y1, cmd.x, cmd.y);
          break;
        case SVGPathData.CLOSE_PATH:
          path.close();
          break;
      }
    }
  } catch (e) {
    console.warn('Failed to convert SVG path to glyph:', e);
  }

  return path;
}
