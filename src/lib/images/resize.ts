import { blobToDataUrl } from './blobToDataUrl';

const MAX_EDGE = 2048;
const QUALITY = 0.85;
const MAX_RAW_FILE = 25 * 1024 * 1024;

export const MAX_PER_MESSAGE = 4;
export const MAX_TOTAL_BYTES = 10 * 1024 * 1024;

export interface PreparedImage {
  dataUrl: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  width: number;
  height: number;
  originalBytes: number;
  resizedBytes: number;
}

function hasAlpha(
  ctx: { getImageData: (x: number, y: number, w: number, h: number) => { data: Uint8ClampedArray } },
  w: number, h: number,
): boolean {
  const sample = ctx.getImageData(0, 0, w, h);
  const data = sample.data;
  const stride = Math.max(1, Math.floor(data.length / 4 / 1024));
  for (let i = 3; i < data.length; i += 4 * stride) {
    if (data[i] < 255) return true;
  }
  return false;
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  if (!file.type.startsWith('image/')) throw new Error('Not an image file');
  if (file.size > MAX_RAW_FILE) throw new Error('File too large (>25 MB)');

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap as unknown as CanvasImageSource, 0, 0, w, h);

  const useJpeg = file.type !== 'image/png' || !hasAlpha(ctx as never, w, h);
  const blob = await canvas.convertToBlob({
    type: useJpeg ? 'image/jpeg' : 'image/png',
    quality: useJpeg ? QUALITY : undefined,
  });

  return {
    dataUrl: await blobToDataUrl(blob),
    mimeType: useJpeg ? 'image/jpeg' : 'image/png',
    width: w,
    height: h,
    originalBytes: file.size,
    resizedBytes: blob.size,
  };
}
