import assetLibrary from "../../../core/asset_library";
import { RawTexture } from "../../../core/assets/drawables.gen";
import { FONT_GLYPH_LIST } from "../../../core/config";
import { createNode, createEmptyNode } from "../../../core/node";

export const createText = (text: string) => {
  const anchor = createEmptyNode();
  const textureAsMap: Record<string, RawTexture> = assetLibrary._textures;

  let offset = -(text.length * 0.38) / 2;
  for (const char of text) {
    if (FONT_GLYPH_LIST.includes(char)) {
      const node = createNode(textureAsMap[`__font_${char}`], [offset, 0]);
      anchor._addChild(node);
    }
    offset += 0.38;
  }

  anchor._updater = (s, _g, _d) => {
    if (s._children.length == 0) {
      s._dead = true;
    }
  };

  return anchor;
};
