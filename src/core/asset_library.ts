import audioData, { RawAudioData, RawSfx, RawSong } from "./assets/audio.gen";
import drawables, { RawDrawableData, RawTexture } from "./assets/drawables.gen";
import { RENDERER_SPRITE_RESOLUTION } from "./config";

const assetLibrary = {
  _textures: drawables._textures,
  _textureCache: new Map<string, ImageData>(),
  _textureDataMap: new Map<any, number>(),
  _audioData: audioData as RawAudioData,
  _sfx: audioData._sfx,
  _songs: audioData._songs,

  async _preRenderTextures(): Promise<void> {
    let i = 0;

    for (const textureKey of Object.keys(assetLibrary._textures)) {
      this._textureCache.set(
        textureKey,
        await this._preRenderTexture(
          (drawables as RawDrawableData)._palette,
          (drawables._textures as any)[textureKey],
        ),
      );

      i++;
    }
  },

  async _preRenderTexture(
    palette: string[],
    textureData: RawTexture,
  ): Promise<ImageData> {
    const canvas = new OffscreenCanvas(RENDERER_SPRITE_RESOLUTION, RENDERER_SPRITE_RESOLUTION);
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < textureData.length; i++) {
      const str = textureData[i];
      const color = palette[str.charCodeAt(0) - 40];

      const firstX = (canvas.width * (str.charCodeAt(2) - 40)) / 50;
      const firstY = (canvas.height * (str.charCodeAt(3) - 40)) / 50;

      ctx.beginPath();
      ctx.moveTo(firstX, firstY);

      for (let j = 4; j < str.length; j += 2) {
        const x = (canvas.width * (str.charCodeAt(j) - 40)) / 50;
        const y = (canvas.height * (str.charCodeAt(j + 1) - 40)) / 50;
        ctx.lineTo(x, y);
      }

      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }

    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  },

  _textureIndex(data: any): number {
    if (this._textureDataMap.size === 0) {
      Object.keys(this._textures).forEach((key, i) => {
        this._textureDataMap.set((drawables._textures as any)[key], i);
      });
    }

    return this._textureDataMap.get(data)!;
  },

  _getMusic(idOrKey: number | string): RawSong | null {
    if (typeof idOrKey === 'string') {
      return (this._songs as Record<string, RawSong>)[idOrKey] || null;
    }
    const keys = Object.keys(this._songs);
    const key = keys[idOrKey - 1] || keys[0];
    return key ? (this._songs as Record<string, RawSong>)[key] : null;
  },

  _getSfx(idOrKey: number | string): RawSfx | null {
    if (typeof idOrKey === 'string') {
      return (this._sfx as Record<string, RawSfx>)[idOrKey] || null;
    }
    const keys = Object.keys(this._sfx);
    const key = keys[idOrKey - 1] || keys[0];
    return key ? (this._sfx as Record<string, RawSfx>)[key] : null;
  },
};

export default assetLibrary;

export type AssetLibrary = typeof assetLibrary;
