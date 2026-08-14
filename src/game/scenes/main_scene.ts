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
    for (let i = 0; i < 8; i++) {
      const star = createSprite(
        assetLibrary._textures._star,
        [utils._rndFloat(), utils._rndFloat()],
        [0.08, 0.08]
      );
      const speed = 0.5 + utils._rndFloat() * 1.5;
      const baseScale = 0.05 + utils._rndFloat() * 0.05;
      star._opacity = 0.4 + utils._rndFloat() * 0.4;
      star._updater = (s, g, delta) => {
        s._angle += delta * speed * 0.5;
        const pulse = 1 + 0.2 * utils._sin(g._worker._ticks * speed * 2);
        s._scale = [baseScale * pulse, baseScale * pulse];
      };
      scene._rootSprite._addChild(star);
    }

    // Main interactive player sprite
    const player = createSprite(assetLibrary._textures._player, [0.5, 0.5], [0.25, 0.25]);

    // Satellite particle orbiting the player (demonstrates hierarchical transforms)
    const orbiter = createSprite(assetLibrary._textures._particle, [0.4, 0], [0.35, 0.35]);
    orbiter._updater = (s, g, delta) => {
      s._angle += delta * 4;
    };
    player._addChild(orbiter);

    let lastPointerDown = false;

    player._updater = (sprite, g, delta) => {
      // Smoothly track pointer position
      const pointerCoord = g._input._pointer._coord;
      sprite._position = utils._vectorLerp(sprite._position, pointerCoord, delta * 8);

      // Rotate towards movement direction with gentle bobbing
      const targetAngle = utils._sin(g._worker._ticks * 2) * 0.15;
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
