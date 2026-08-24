import assetLibrary from "../../../core/asset_library";
import createSprite, { Sprite } from "../../../core/sprite";
import { utils, Vec } from "../../../core/utils";
import { createParticles } from "../common/particles";

export const createEnemyOne = (fxLayer: Sprite, startY: number, finalY: number) => {
  const enemy = createSprite(assetLibrary._textures._enemy_one, [0, startY], [0.2, 0.2]);
  const rand = utils._rndFloat();

  enemy._updater = (s, g, d) => {
    const addend: Vec = [utils._cos(g._worker._ticks * 2 + rand) * 0.05, utils._sin(g._worker._ticks + rand) * 0.02]
    s._position = utils._vectorLerp([0, startY], [0.7 + (rand * 0.1), finalY + (rand * 0.05)], utils._easeCubicOut(s._lifetime * 0.4));
    s._position = utils._vectorAdd(s._position, addend);
    const targetAngle = utils._sin(g._worker._ticks * 6) * 0.15;
    s._angle += (targetAngle - s._angle) * utils._clamp(d * 5, 0, 1);

    // Check projectile collisions
    let [projectile, distance] = utils._nearestSprite(s._position, g._state._projectiles);
    if (projectile && (distance < 0.04)) {
      enemy._dead = true;
      trail._dead = true;

      projectile._dead = true;
      g._state._projectiles = g._state._projectiles.filter((x) => x != projectile);

      const explosion = createParticles(
        assetLibrary._textures._explosion,
        6,
        false,
        null,
        [-utils._pi, utils._pi],
        [0.2, 0.3],
        [0.1, 0.3],
        [0.4, 0.6],
        [-utils._pi, utils._pi],
        [-0.2, 1.2],
      );
      explosion._position = [...enemy._position];
      fxLayer._addChild(explosion);

      const shrapnel = createParticles(
        assetLibrary._textures._particle,
        16,
        false,
        null,
        [-utils._pi, utils._pi],
        [0.3, 0.5],
        [0.4, 0.6],
        [0.1, 0.2],
        [-utils._pi, utils._pi],
        [-0.2, 0.2],
      );
      shrapnel._position = [...enemy._position];
      fxLayer._addChild(shrapnel);

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

      fxLayer._addChild(projectileSplash);
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
