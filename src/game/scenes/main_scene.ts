import assetLibrary from "../../core/asset_library";
import createScene from "../../core/scene";
import createSprite from "../../core/sprite";
import { utils } from "../../core/utils";
import unicorn from "./gameplay/unicorn";

export const createMainScene = () => {
  const scene = createScene((scene, game) => {
    // Start background music loop (1)
    game._worker._setMusic(1);

    // Full-screen background quad
    const bg = createSprite(assetLibrary._textures._ui_square_bg, [0.5, 0.5], [10, 10]);
    scene._rootSprite._addChild(bg);

    // Decorative floating stars
    for (let i = 0; i < 32; i++) {
      const star = createSprite(
        assetLibrary._textures._star,
        [utils._rndFloat(), utils._rndFloat()],
        [0.08, 0.08],
      );
      const speed = 0.5 + utils._rndFloat() * 1.5;
      const baseScale = 0.05 + utils._rndFloat() * 0.05;
      star._opacity = 0.4 + utils._rndFloat() * 0.4;
      star._updater = (s, g, delta) => {
        s._position[0] = utils._wrap(s._position[0] - delta * 3 * s._scale[0], 0, 1);
        s._angle += delta * speed * 0.5;
        const pulse = 1 + 0.2 * utils._sin(g._worker._ticks * speed * 2);
        s._scale = [baseScale * pulse, baseScale * pulse];
      };
      scene._rootSprite._addChild(star);
    }

    // Decorative floating clouds
    let cloudCloseness = 0.2;
    for (let i = 0; i < 32; i++) {
      cloudCloseness += 0.02;
      const scale = cloudCloseness * 5;
      const star = createSprite(
        assetLibrary._textures._cloud_one,
        [utils._rndFloat() * 3 - 1, 0.1 + cloudCloseness * 2 + utils._rndFloat() * 0.1],
        [scale, scale + utils._rndFloat() * 0.4],
      );
      star._updater = (s, g, delta) => {
        s._position[0] = utils._wrap(s._position[0] - delta * 1 * (s._scale[1] + 0.01), -1, 2);
      };
      scene._rootSprite._addChild(star);
    }

    // Main interactive player sprite
    scene._rootSprite._addChild(unicorn);
  });

  scene._updater = (scene, game, delta) => {
    game._state._ticks += delta;
  };

  return scene;
};
