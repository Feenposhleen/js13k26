import assetLibrary from "../../../core/asset_library";
import { createNode, createEmptyNode } from "../../../core/node";
import { createParallax } from "../common/parallax";

export const createBackground = () => {
  const bg = createEmptyNode();

  const fill = createNode(assetLibrary._textures._ui_square_bg, [0.5, 0.5], [10, 10]);
  bg._addChild(fill);

  const mountains = createParallax(
    assetLibrary._textures._mountain_one,
    32,
    [0.8, 0.9],
    [0.6, 0.8],
    [1.4, 0.8],
  );
  bg._addChild(mountains);

  const stars = createParallax(
    assetLibrary._textures._star,
    16,
    [0.5, 0.9],
    [-0.1, 0.4],
    [0.1, 0.05],
    (s, g, d) => {
      s._rotation += d * (s._scale[0] - 0.3) * 4;
    },
  );
  bg._addChild(stars);

  const clouds = createParallax(
    assetLibrary._textures._cloud_one,
    32,
    [0.01, 0.6],
    [1, 0.7],
    [1.7, 0.8],
  );
  bg._addChild(clouds);

  return bg;
};
