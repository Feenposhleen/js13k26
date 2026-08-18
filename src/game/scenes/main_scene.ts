import assetLibrary from "../../core/asset_library";
import createScene from "../../core/scene";
import createSprite from "../../core/sprite";
import { utils } from "../../core/utils";
import { createParticles } from "./common/particles";
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
        [utils._rndRange(-0.3, 1.3), utils._rndRange(-0.1, 0.6)],
        [0.08, 0.08],
      );
      const speed = 0.5 + utils._rndFloat() * 1.5;
      const baseScale = 0.3 + (utils._rndFloat() * 0.1);
      star._updater = (s, g, delta) => {
        s._position[0] = utils._wrap(s._position[0] - delta * 0.2 * s._scale[0], -0.3, 1.3);
        s._angle += delta * speed * 0.5;
        const pulse = 1 + 0.2 * utils._sin(g._worker._ticks * speed * 2);
        s._scale = [baseScale * pulse, baseScale * pulse];
      };
      scene._rootSprite._addChild(star);
    }

    // Decorative floating clouds
    let cloudCloseness = 0.1;
    for (let i = 0; i < 64; i++) {
      cloudCloseness += 0.01;
      const scale = cloudCloseness * 6;
      const cloud = createSprite(
        assetLibrary._textures._cloud_one,
        [utils._rndFloat() * 3 - 1, 0.3 + (cloudCloseness * 2) + (utils._rndFloat() * 0.1)],
        [(scale * 2), scale],
      );
      cloud._updater = (s, g, delta) => {
        s._position[0] = utils._wrap(s._position[0] - delta * 1.2 * (s._scale[1] + 0.1), -1, 2);
      };
      scene._rootSprite._addChild(cloud);
    }

    // Main interactive player sprite
    const trail = createParticles(
      assetLibrary._textures._particle,
      32,
      true,
      unicorn,
      [-utils._pi - 0.05, -utils._pi + 0.05,],
      [0.4, 0.6],
      [0.4, 0.8],
      [0.1, 0.2]
    );
    trail._position = [-0.02, 0];

    scene._rootSprite._addChild(trail);
    scene._rootSprite._addChild(unicorn);
  });

  scene._updater = (scene, game, delta) => {
    game._state._ticks += delta;
  };

  return scene;
};
