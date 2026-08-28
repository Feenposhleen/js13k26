import assetLibrary from "../../../core/asset_library";
import createSprite, { Sprite } from "../../../core/sprite";
import { utils, Vec } from "../../../core/utils";
import { createParticles } from "../common/particles";
import { createExplosion } from "./fxPacks";
import { colorByTexture, textureByColor } from "./projectile";

const enemyOrigin: Vec = [1.2, -1];

export const createEnemyTwo = (color: number, fxLayer: Sprite, targetPosition: Vec) => {
  const enemy = createSprite(assetLibrary._textures._enemy_two, enemyOrigin, [0.2, 0.2]);
  const colorTexture = createSprite(textureByColor(color), [-0.09, -0.06], [0.5, 0.5]);
  colorTexture._angle = -utils._pi / 2;
  enemy._addChild(colorTexture);

  const rand = utils._rndFloat();

  enemy._updater = (s, g, d) => {
    s._position = utils._vectorLerp(
      enemyOrigin,
      utils._vectorAdd(targetPosition, [rand * 0.1, rand * 0.05]),
      utils._easeCubicOut(s._lifetime * 0.4),
    );

    s._position = utils._vectorAdd(s._position, [
      utils._cos(g._worker._ticks * 2 + rand) * 0.05,
      utils._sin(g._worker._ticks + rand) * 0.02,
    ]);

    const targetAngle = utils._sin(g._worker._ticks * 6) * 0.15;
    s._angle += (targetAngle - s._angle) * utils._clamp(d * 5, 0, 1);

    // Check projectile collisions
    let [projectile, distance] = utils._nearestSprite(s._position, g._state._projectiles);
    if (projectile && distance < 0.06) {
      const projectileSplash = createParticles(
        projectile._texture!,
        4,
        false,
        null,
        [-0.1, 0.1],
        [0.6, 0.8],
        [0.4, 0.6],
        [0.1, 0.2],
        [-0.1, 0.1],
        [-0.05, 0.05],
      );
      projectileSplash._position = [...enemy._position];

      g._state._layerFxFront._addChild(projectileSplash);

      if (colorByTexture(projectile._texture!) === color) {
        enemy._dead = true;
        trail._dead = true;

        createExplosion(fxLayer, enemy._position, 0.8);
        g._worker._setPostProgramValue(0, 1);

        g._worker._playSfx(7);
      } else {
        projectile._dead = true;
        g._state._projectiles = g._state._projectiles.filter((x) => x != projectile);

        const dingSplash = createParticles(
          assetLibrary._textures._particle,
          4,
          false,
          null,
          [-utils._pi, utils._pi],
          [0.6, 0.8],
          [0.4, 0.6],
          [0.1, 0.2],
          [-0.1, 0.1],
          [-0.05, 0.05],
        );
        dingSplash._position = [...projectile._position];
        g._state._layerFxFront._addChild(dingSplash);

        g._worker._playSfx(8);
      }
    }
  };

  const trail = createParticles(
    assetLibrary._textures._particle,
    32,
    true,
    enemy,
    [-utils._pi - 0.05, -utils._pi + 0.05],
    [0.4, 0.6],
    [0.3, 0.6],
    [0.08, 0.1],
  );
  fxLayer._addChild(trail);

  return enemy;
};
