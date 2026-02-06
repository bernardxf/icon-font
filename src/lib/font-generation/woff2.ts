import { compress, decompress } from 'woff2-encoder';

export async function compressWoff2(ttfBuffer: ArrayBuffer): Promise<ArrayBuffer> {
  const result = await compress(new Uint8Array(ttfBuffer));
  return result.buffer as ArrayBuffer;
}

export async function decompressWoff2(woff2Buffer: ArrayBuffer): Promise<ArrayBuffer> {
  const result = await decompress(new Uint8Array(woff2Buffer));
  return result.buffer as ArrayBuffer;
}

/** Check if buffer starts with WOFF2 magic bytes (wOF2 = 0x774F4632) */
export function isWoff2(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) return false;
  const view = new DataView(buffer);
  return view.getUint32(0) === 0x774F4632;
}
