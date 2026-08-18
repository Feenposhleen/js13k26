import assetLibrary from "../../../core/asset_library";
import createSprite, { Sprite } from "../../../core/sprite";
import { utils } from "../../../core/utils";
import { createParallax } from "../common/parallax";

export const createBackground = () => {
  const bg = createSprite(null, [0, 0]);

  const fill = createSprite(assetLibrary._textures._ui_square_bg, [0.5, 0.5], [10, 10]);
  bg._addChild(fill);

  const stars = createParallax(
    assetLibrary._textures._star,
    32,
    [0.5, 0.8],
    [-0.1, 0.4],
    [0.4, 0.2],
    (s, g, d) => (s._angle += d * 0.3),
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
