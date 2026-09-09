import assetLibrary from "../../../core/asset_library";
import { RawTexture } from "../../../core/assets/drawables.gen";
import { FONT_GLYPH_LIST } from "../../../core/config";
import { createSprite, createEmptySprite } from "../../../core/sprite";

export const createText = (text: string) => {
  const anchor = createEmptySprite();
  const textureAsMap: Record<string, RawTexture> = assetLibrary._textures;

  let offset = -(text.length * 0.38) / 2;
  for (let char of text) {
    if (FONT_GLYPH_LIST.includes(char)) {
      const sprite = createSprite(textureAsMap[`__font_${char}`], [offset, 0]);
      anchor._addChild(sprite);
    }
    offset += 0.38;
  }

  anchor._updater = (s, g, d) => {
    if (s._children.length == 0) {
      s._dead = true;
    }
  };

  return anchor;
};
