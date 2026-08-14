import drawables, { RawDrawableData, RawPolygon } from "./assets/drawables.gen";
import { RENDERER_SPRITE_RESOLUTION } from "./config";
import { PlayOptions } from "./sound";

const assetLibrary = {
  _textures: drawables._textures,
  _textureCache: new Map<string, ImageData>(),
  _textureDataMap: new Map<any, number>(),

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
    textureData: RawPolygon[],
  ): Promise<ImageData> {
    const canvas = new OffscreenCanvas(RENDERER_SPRITE_RESOLUTION, RENDERER_SPRITE_RESOLUTION);
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < textureData.length; i++) {
      const poly = textureData[i];
      const color = palette[poly[0] as number];
      const str = poly[2] as string;

      const firstX = (canvas.width * (str.charCodeAt(0) - 40)) / 50;
      const firstY = (canvas.height * (str.charCodeAt(1) - 40)) / 50;

      ctx.beginPath();
      ctx.moveTo(firstX, firstY);

      for (let j = 2; j < str.length; j += 2) {
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

  _getMusic(id: number): PlayOptions {
    switch (id) {
      case 1:
        return {
          _bass: [
            0, 1, 0, 0,
            1, 0, 0, 0,
            0, 0, 0, 0,
            1, 0, 0, 0,
          ],
          _snare: [
            0, 0, 1, 0,
            0, 0, 1, 0,
          ],
          _chords: [
            1, 0, 0, 0,
            0, 0, 0, 0,
            1, 0, 1, 0,
            0, 0, 0, 0,
            1, 0, 0, 0,
            0, 0, 0, 0,
            1, 0, 1, 0,
            0, 0, 0, 0,
          ],
          _kick: [
            1, 0, 0, 0,
            0, 1, 0, 0,
          ],
        };
      case 2:
        return {
          _bass: [
            0, 1, 1, 0,
            1, 0, 0, 0,
            0, 0, 1, 0,
            1, 0, 0, 0,
            0, 1, 1, 0,
            1, 0, 1, 0,
            1, 0, 0, 0,
            1, 0, 0, 0,
          ],
          _snare: [
            1, 0, 1, 0,
            1, 0, 1, 0,
          ],
          _chords: [
            1, 0, 0, 0,
            0, 0, 0, 0,
            1, 0, 1, 0,
            0, 0, 0, 0,
            1, 0, 0, 0,
            0, 0, 0, 0,
            1, 0, 1, 0,
            0, 0, 0, 0,
          ],
          _kick: [
            1, 0, 0, 0,
            0, 1, 0, 0,
          ],
        };
      case 3:
        return {
          _snare: [
            0, 0, 1, 0,
            0, 0, 1, 0,
          ],
          _kick: [
            1, 0, 0, 0,
            0, 1, 0, 0,
          ],
        };
      case 4:
        return {
          _snare: [
            1, 0, 1, 0,
            1, 0, 1, 0,
          ],
          _kick: [
            1, 0, 0, 0,
            0, 1, 0, 0,
          ],

        };
      default:
        return {};
    }
  },

  _getSfx(id: number): PlayOptions {
    switch (id) {
      case 1:
        return {
          _beep: [1],
          _octave: 2,
        };
      case 2:
        return {
          _boop: [1],
          _octave: 2,
        };
      case 3:
        return {
          _bang: [1],
          _octave: 2,
        };
      default:
        return {};
    }
  },
};

export default assetLibrary;

export type AssetLibrary = typeof assetLibrary;
