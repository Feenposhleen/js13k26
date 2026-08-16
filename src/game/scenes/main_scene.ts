import assetLibrary from "../../core/asset_library";
import createScene from "../../core/scene";
import createSprite from "../../core/sprite";
import { utils } from "../../core/utils";

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

    // Unicorn trail
    for (let i = 0; i < 32; i++) {
      const scale = 0.05 + utils._rndFloat() * 0.05;
      const star = createSprite(
        assetLibrary._textures._particle,
        [
          utils._rndRange(-0.2, game._state._playerPosition[0]),
          game._state._playerPosition[1] - utils._rndRange(-0.01, 0.01),
        ],
        [scale, scale],
      );
      star._updater = (s, g, delta) => {
        s._position[0] -= delta * (1 + s._scale[0]);
        if (s._scale[0] < 0.04) {
          s._position = [
            game._state._playerPosition[0] - 0.04,
            game._state._playerPosition[1] - utils._rndRange(-0.01, 0.01),
          ];
          s._scale = [scale, scale];
        }
        s._scale[0] -= delta * 0.2;
        s._scale[1] -= delta * 0.2;
        s._angle += delta * s._scale[0];
      };
      scene._rootSprite._addChild(star);
    }

    // Main interactive player sprite
    const player = createSprite(assetLibrary._textures._unicorn_one, [0.5, 0.5], [0.25, 0.25]);
    const unicornZooka = createSprite(assetLibrary._textures._unicorn_zooka, [-0.045, -0.15], [0.5, 0.7]);
    player._addChild(unicornZooka);

    let lastPointerDown = false;

    player._updater = (sprite, g, delta) => {
      sprite._texture =
        (game._state._ticks * 4) % 2 < 1
          ? assetLibrary._textures._unicorn_two
          : assetLibrary._textures._unicorn_one;
      // Smoothly track pointer position
      const pointerCoord = g._input._pointer._coord;
      g._state._playerPosition = [...sprite._position];
      sprite._position = utils._vectorLerp(sprite._position, pointerCoord, delta * 8);

      // Rotate towards movement direction with gentle bobbing
      const targetAngle = utils._sin(g._worker._ticks * 6) * 0.15;
      sprite._angle += (targetAngle - sprite._angle) * utils._clamp(delta * 5, 0, 1);

      // Trigger SFX on pointer click
      if (g._input._pointer._down && !lastPointerDown) {
        g._state._score++;
        g._worker._playSfx(1);
        sprite._scale = [0.32, 0.32];
      } else {
        sprite._scale = utils._vectorLerp(sprite._scale, [0.25, 0.25], delta * 10);
      }
      lastPointerDown = g._input._pointer._down;
    };

    scene._rootSprite._addChild(player);
  });

  scene._updater = (scene, game, delta) => {
    game._state._ticks += delta;
  };

  return scene;
};
