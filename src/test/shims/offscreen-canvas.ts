// Minimal jsdom shim — enough for our resize-pipeline tests, NOT a real renderer.
// Tests that exercise actual pixel data must mock prepareImage instead.

class FakeOffscreenCanvas {
  width: number;
  height: number;
  constructor(w: number, h: number) { this.width = w; this.height = h; }
  getContext(): { drawImage: () => void; getImageData: () => { data: Uint8ClampedArray } } {
    return {
      drawImage: () => {},
      getImageData: () => ({ data: new Uint8ClampedArray(this.width * this.height * 4) }),
    };
  }
  async convertToBlob(opts: { type: string; quality?: number }): Promise<Blob> {
    return new Blob([new Uint8Array([0])], { type: opts.type });
  }
}

if (typeof globalThis.OffscreenCanvas === 'undefined') {
  (globalThis as unknown as Record<string, unknown>).OffscreenCanvas = FakeOffscreenCanvas;
}

if (typeof globalThis.createImageBitmap === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (globalThis as unknown as Record<string, unknown>).createImageBitmap = async (_blob: Blob) => ({
    width: 1024,
    height: 768,
    close: () => {},
  });
}
