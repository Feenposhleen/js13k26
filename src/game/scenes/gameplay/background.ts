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
    [0.5, 1],
    [-0.1, 0.4],
    [0.2, 0.1],
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

  // Parallax stars
  // for (let i = 0; i < 32; i++) {
  //   const star = createSprite(
  //     assetLibrary._textures._star,
  //     [utils._rndRange(-0.3, 1.3), utils._rndRange(-0.1, 0.6)],
  //     [0.08, 0.08],
  //   );
  //   const speed = 0.5 + utils._rndFloat() * 1.5;
  //   const baseScale = 0.3 + utils._rndFloat() * 0.1;
  //   star._updater = (s, g, delta) => {
  //     s._position[0] = utils._wrap(s._position[0] - delta * 0.2 * s._scale[0], -0.3, 1.3);
  //     s._angle += delta * speed * 0.5;
  //     const pulse = 1 + 0.2 * utils._sin(g._worker._ticks * speed * 2);
  //     s._scale = [baseScale * pulse, baseScale * pulse];
  //   };
  //   bg._addChild(star);
  // }

  // Parallax clouds
  // let cloudCloseness = 0.1;
  // for (let i = 0; i < 64; i++) {
  //   cloudCloseness += 0.01;
  //   const scale = cloudCloseness * 6;
  //   const cloud = createSprite(
  //     assetLibrary._textures._cloud_one,
  //     [utils._rndFloat() * 3 - 1, 0.3 + cloudCloseness * 2 + utils._rndFloat() * 0.1],
  //     [scale * 2, scale],
  //   );
  //   cloud._updater = (s, g, delta) => {
  //     s._position[0] = utils._wrap(s._position[0] - delta * 1.2 * (s._scale[1] + 0.1), -1, 2);
  //   };
  //   bg._addChild(cloud);
  // }

  return bg;
};
