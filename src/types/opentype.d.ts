declare module 'opentype.js' {
  export interface PathCommand {
    type: string;
    x?: number;
    y?: number;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
  }

  export interface BoundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }

  export class Path {
    commands: PathCommand[];
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    curveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): void;
    quadTo(x1: number, y1: number, x: number, y: number): void;
    close(): void;
    toSVG(decimalPlaces?: number): string;
    toPathData(decimalPlaces?: number): string;
    getBoundingBox(): BoundingBox;
  }

  export interface GlyphOptions {
    name: string;
    unicode?: number;
    advanceWidth: number;
    path: Path;
  }

  export class Glyph {
    constructor(options: GlyphOptions);
    name: string;
    unicode: number;
    unicodes: number[];
    advanceWidth: number;
    path: Path;
  }

  export interface FontOptions {
    familyName: string;
    styleName: string;
    unitsPerEm: number;
    ascender: number;
    descender: number;
    glyphs: Glyph[];
  }

  export class Font {
    constructor(options: FontOptions);
    familyName: string;
    styleName: string;
    unitsPerEm: number;
    ascender: number;
    descender: number;
    glyphs: { length: number; get: (i: number) => Glyph };
    toArrayBuffer(): ArrayBuffer;
    download(fileName?: string): void;
  }

  const opentype: {
    Path: typeof Path;
    Glyph: typeof Glyph;
    Font: typeof Font;
    parse(buffer: ArrayBuffer): Font;
    load(url: string, callback: (err: Error | null, font?: Font) => void): void;
  };

  export default opentype;
}
