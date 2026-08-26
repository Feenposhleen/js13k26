import assetLibrary from "../../../core/asset_library";
import { RawTexture } from "../../../core/assets/drawables.gen";
import { FONT_GLYPH_LIST } from "../../../core/config";
import createSprite, { Sprite } from "../../../core/sprite";
import { utils, Vec } from "../../../core/utils";

export const createText = (
  text: string,
) => {
  const anchor = createSprite(null, [0, 0]);

  let offset = 0;
  for (let char of text) {
    offset += 0.38;
    if (FONT_GLYPH_LIST.includes(char)) {
      const sprite = createSprite(assetLibrary._textures[`__font_${char}`], [offset, 0])
      anchor._addChild(sprite);
    }
  }

  anchor._updater = (s, g, d) => {
    if (s._children.length == 0) {
      s._dead = true;
    }
  };

  return anchor;
};
